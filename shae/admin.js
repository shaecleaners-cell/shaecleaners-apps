import {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from "./firebase.js";


const $ = id => document.getElementById(id);

let allOrders = [];
let unsubscribe = null;


/* =========================
   PASSWORD ADMIN
========================= */

const ADMIN_PASSWORD = "123456";


/* =========================
   LOGIN
========================= */

$("loginBtn").addEventListener("click", loginAdmin);

$("adminPassword").addEventListener("keydown", e => {

  if (e.key === "Enter") {
    loginAdmin();
  }

});


function loginAdmin() {

  const password =
    $("adminPassword").value;

  if (!password) {

    $("loginMsg").textContent =
      "Password wajib diisi.";

    return;
  }


  if (password !== ADMIN_PASSWORD) {

    $("loginMsg").textContent =
      "Password admin salah.";

    return;
  }


  sessionStorage.setItem(
    "shae_admin_login",
    "true"
  );


  $("loginBox").hidden = true;
  $("panel").hidden = false;

  $("loginMsg").textContent = "";

  startOrders();
}


/* =========================
   CEK LOGIN
========================= */

if (
  sessionStorage.getItem(
    "shae_admin_login"
  ) === "true"
) {

  $("loginBox").hidden = true;
  $("panel").hidden = false;

  startOrders();

}


/* =========================
   LOGOUT
========================= */

$("logoutBtn").addEventListener(
  "click",
  () => {

    sessionStorage.removeItem(
      "shae_admin_login"
    );

    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    $("panel").hidden = true;
    $("loginBox").hidden = false;
    $("adminPassword").value = "";

  }
);


/* =========================
   FIREBASE ORDERS
========================= */

function startOrders() {

  clearError();

  $("orders").innerHTML =
    `<div class="loading">
      Menghubungkan ke Firebase...
    </div>`;


  try {

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );


    unsubscribe = onSnapshot(
      q,

      snapshot => {

        allOrders =
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        renderOrders();

      },

      error => {

        console.error(error);

        showError(
          "Tidak dapat membaca pesanan Firebase: " +
          error.message
        );

        $("orders").innerHTML =
          `<div class="empty">
            Tidak dapat membaca pesanan.
          </div>`;

      }
    );

  } catch (error) {

    showError(error.message);

  }

}


/* =========================
   RENDER
========================= */

function renderOrders() {

  const filter =
    $("filterStatus").value;


  const orders =
    allOrders.filter(order =>
      !filter ||
      order.status === filter
    );


  $("totalOrders").textContent =
    allOrders.length;


  $("waitingOrders").textContent =
    allOrders.filter(order =>
      order.status === "Menunggu" ||
      order.status === "Menunggu Konfirmasi"
    ).length;


  $("confirmedOrders").textContent =
    allOrders.filter(order =>
      order.status === "Dikonfirmasi"
    ).length;


  $("doneOrders").textContent =
    allOrders.filter(order =>
      order.status === "Selesai"
    ).length;


  if (!orders.length) {

    $("orders").innerHTML =
      `<div class="empty">
        Belum ada pesanan.
      </div>`;

    return;

  }


  $("orders").innerHTML =
    orders.map(order => {

      const phone =
        order.phone ||
        order.hp ||
        "";

      const invoice =
        order.invoice ||
        order.id;


      return `

        <article class="invoice-card">

          <div class="top">

            <div>

              <b>
                ${order.service ||
                  order.layanan ||
                  "Layanan"}
              </b>

              <div class="muted">
                ${invoice}
              </div>

            </div>

            <span class="status">
              ${order.status ||
                "Menunggu"}
            </span>

          </div>


          <div class="line">
            <span>Pelanggan</span>
            <b>
              ${order.name ||
                order.nama ||
                "-"}
            </b>
          </div>


          <div class="line">
            <span>WhatsApp</span>
            <b>
              ${phone || "-"}
            </b>
          </div>


          <div class="line">
            <span>Jadwal</span>
            <b>
              ${order.date ||
                order.tanggal ||
                "-"}
              ${order.time ||
                order.jam ||
                ""}
            </b>
          </div>


          <div class="line">
            <span>Total</span>
            <b>
              ${rupiah(order.total)}
            </b>
          </div>


          <div class="actions">

            <button
              onclick="
                ubahStatus(
                  '${order.id}',
                  'Dikonfirmasi'
                )
              ">
              Konfirmasi
            </button>


            <button
              onclick="
                ubahStatus(
                  '${order.id}',
                  'Diproses'
                )
              ">
              Proses
            </button>


            <button
              onclick="
                ubahStatus(
                  '${order.id}',
                  'Selesai'
                )
              ">
              Selesai
            </button>


            <button
              class="wa"
              onclick="
                wa(
                  '${phone}',
                  '${invoice}'
                )
              ">
              WhatsApp
            </button>

          </div>

        </article>

      `;

    }).join("");

}


/* =========================
   UBAH STATUS
========================= */

window.ubahStatus =
async function(id, status) {

  try {

    await updateDoc(
      doc(db, "orders", id),
      {
        status: status,
        updatedAt: serverTimestamp()
      }
    );

  } catch (error) {

    showError(
      "Gagal mengubah status: " +
      error.message
    );

  }

};


/* =========================
   WHATSAPP
========================= */

window.wa =
function(phone, invoice) {

  if (!phone) {

    alert(
      "Nomor WhatsApp pelanggan tidak tersedia."
    );

    return;
  }


  phone =
    phone.replace(/\D/g, "");


  if (phone.startsWith("0")) {

    phone =
      "62" + phone.substring(1);

  }


  const message =
    `Halo, kami dari Shae Cleaners.

Terkait pesanan ${invoice}.

Terima kasih.`;


  window.open(
    "https://wa.me/" +
    phone +
    "?text=" +
    encodeURIComponent(message),
    "_blank"
  );

};


/* =========================
   FILTER
========================= */

$("filterStatus").addEventListener(
  "change",
  renderOrders
);


/* =========================
   HELPER
========================= */

function rupiah(n) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(Number(n) || 0);

}


function showError(text) {

  $("errorBox").textContent =
    text;

  $("errorBox").hidden = false;

}


function clearError() {

  $("errorBox").hidden = true;

}