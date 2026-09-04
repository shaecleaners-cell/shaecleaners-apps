import {
  pantauOrders,
  ubahStatusOrder
} from "./firebase.js";


let semuaOrders = [];
let filterAktif = "semua";


const orderList = document.getElementById("orderList");

const jumlahBaru =
  document.getElementById("jumlahBaru");

const jumlahProses =
  document.getElementById("jumlahProses");

const jumlahSelesai =
  document.getElementById("jumlahSelesai");


/* =========================
   PANTAU PESANAN REALTIME
========================= */

pantauOrders((orders) => {

  semuaOrders = orders;

  updateStatistik();

  tampilkanOrders();

});


/* =========================
   STATISTIK
========================= */

function updateStatistik() {

  const baru = semuaOrders.filter(
    order =>
      String(order.status || "")
        .toLowerCase() === "menunggu"
  ).length;


  const proses = semuaOrders.filter(
    order =>
      String(order.status || "")
        .toLowerCase() === "diproses"
  ).length;


  const selesai = semuaOrders.filter(
    order =>
      String(order.status || "")
        .toLowerCase() === "selesai"
  ).length;


  jumlahBaru.textContent = baru;

  jumlahProses.textContent = proses;

  jumlahSelesai.textContent = selesai;

}


/* =========================
   TAMPILKAN ORDERS
========================= */

function tampilkanOrders() {

  let orders = semuaOrders;


  if (filterAktif !== "semua") {

    orders = semuaOrders.filter(order => {

      return String(order.status || "")
        .toLowerCase() ===
        filterAktif.toLowerCase();

    });

  }


  if (orders.length === 0) {

    orderList.innerHTML = `

      <div class="empty">

        <div class="empty-icon">
          📭
        </div>

        <b>Belum ada pesanan</b>

        <p>
          Pesanan customer akan muncul di sini.
        </p>

      </div>

    `;

    return;

  }


  orderList.innerHTML =
    orders.map(buatOrderCard).join("");

}


/* =========================
   CARD PESANAN
========================= */

function buatOrderCard(order) {

  const nama =
    order.nama ||
    order.namaCustomer ||
    order.name ||
    "Customer";


  const phone =
    order.phone ||
    order.telepon ||
    order.noHp ||
    "";


  const layanan =
    order.layanan ||
    order.service ||
    "Layanan";


  const tanggal =
    order.tanggal ||
    "-";


  const jam =
    order.jam ||
    "-";


  const total =
    order.total ||
    order.harga ||
    0;


  const invoice =
    order.invoice ||
    order.invoiceNumber ||
    order.id;


  const status =
    order.status ||
    "Menunggu";


  return `

    <div class="order-card">

      <div class="order-top">

        <div>

          <div class="invoice">
            ${escapeHTML(invoice)}
          </div>

          <div class="customer">
            👤 ${escapeHTML(nama)}
          </div>

        </div>


        <span class="status ${statusClass(status)}">
          ${escapeHTML(status)}
        </span>

      </div>


      <div class="order-info">

        <div class="info-row">
          <span>🧹</span>
          <span>
            ${escapeHTML(layanan)}
          </span>
        </div>


        <div class="info-row">
          <span>📅</span>
          <span>
            ${escapeHTML(tanggal)}
          </span>
        </div>


        <div class="info-row">
          <span>⏰</span>
          <span>
            ${escapeHTML(jam)}
          </span>
        </div>


        <div class="info-row">
          <span>📞</span>
          <span>
            ${escapeHTML(phone)}
          </span>
        </div>

      </div>


      <div class="total">

        <span>Total</span>

        <strong>
          ${formatRupiah(total)}
        </strong>

      </div>


      <div class="order-actions">

        <button
          class="btn btn-detail"
          onclick="detailOrder('${order.id}')">

          Detail

        </button>


        ${
          status.toLowerCase() === "menunggu"

          ? `

          <button
            class="btn btn-terima"
            onclick="terimaOrder('${order.id}')">

            ✓ Terima

          </button>

          `

          :

          status.toLowerCase() === "diproses"

          ? `

          <button
            class="btn btn-selesai"
            onclick="selesaiOrder('${order.id}')">

            ✓ Selesai

          </button>

          `

          :

          `

          <button
            class="btn btn-wa"
            onclick="bukaWhatsApp('${phone}')">

            WhatsApp

          </button>

          `
        }

      </div>


      ${
        status.toLowerCase() === "menunggu"

        ? `

        <button
          class="btn btn-batal"
          style="width:100%;margin-top:8px"
          onclick="batalOrder('${order.id}')">

          Batalkan Pesanan

        </button>

        `

        : ""

      }

    </div>

  `;

}


/* =========================
   TERIMA
========================= */

window.terimaOrder = async function(id) {

  if (!confirm(
    "Terima pesanan ini?"
  )) return;


  try {

    await ubahStatusOrder(
      id,
      "Diproses"
    );

    alert(
      "Pesanan berhasil diterima."
    );

  } catch (error) {

    console.error(error);

    alert(
      "Gagal menerima pesanan."
    );

  }

};


/* =========================
   SELESAI
========================= */

window.selesaiOrder = async function(id) {

  if (!confirm(
    "Pesanan sudah selesai?"
  )) return;


  try {

    await ubahStatusOrder(
      id,
      "Selesai"
    );

  } catch (error) {

    console.error(error);

    alert(
      "Gagal mengubah status."
    );

  }

};


/* =========================
   BATAL
========================= */

window.batalOrder = async function(id) {

  if (!confirm(
    "Batalkan pesanan ini?"
  )) return;


  try {

    await ubahStatusOrder(
      id,
      "Dibatalkan"
    );

  } catch (error) {

    console.error(error);

    alert(
      "Gagal membatalkan pesanan."
    );

  }

};


/* =========================
   DETAIL
========================= */

window.detailOrder = function(id) {

  const order =
    semuaOrders.find(
      item => item.id === id
    );


  if (!order) return;


  let html = "";


  Object.entries(order).forEach(
    ([key, value]) => {

      if (key === "id") return;


      let hasil = value;


      if (
        key === "total" ||
        key === "harga"
      ) {

        hasil =
          formatRupiah(value);

      }


      if (
        typeof value === "object" &&
        value !== null
      ) {

        hasil =
          JSON.stringify(value);

      }


      html += `

        <div class="detail-item">

          <div class="detail-label">
            ${escapeHTML(key)}
          </div>

          <div class="detail-value">
            ${escapeHTML(
              String(hasil ?? "-")
            )}
          </div>

        </div>

      `;

    }
  );


  document.getElementById(
    "detailOrder"
  ).innerHTML = html;


  document.getElementById(
    "detailModal"
  ).classList.add("show");

};


/* =========================
   WHATSAPP
========================= */

window.bukaWhatsApp = function(phone) {

  if (!phone) {

    alert(
      "Nomor WhatsApp tidak tersedia."
    );

    return;

  }


  let nomor =
    String(phone)
      .replace(/\D/g, "");


  if (nomor.startsWith("0")) {

    nomor =
      "62" +
      nomor.substring(1);

  }


  window.open(
    "https://wa.me/" + nomor,
    "_blank"
  );

};


/* =========================
   FILTER
========================= */

document
  .querySelectorAll(".filter")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".filter")
          .forEach(btn =>
            btn.classList.remove("active")
          );


        button.classList.add("active");


        filterAktif =
          button.dataset.status;


        tampilkanOrders();

      }
    );

  });


/* =========================
   CLOSE MODAL
========================= */

document
  .getElementById("closeModal")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById("detailModal")
        .classList.remove("show");

    }
  );


/* =========================
   HELPERS
========================= */

function formatRupiah(value) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(
    Number(value) || 0
  );

}


function statusClass(status) {

  const s =
    String(status)
      .toLowerCase();


  if (s === "menunggu")
    return "status-menunggu";


  if (s === "diproses")
    return "status-diproses";


  if (s === "selesai")
    return "status-selesai";


  if (s === "dibatalkan")
    return "status-dibatalkan";


  return "status-menunggu";

}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}