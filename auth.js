import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAQRKEMFceCbJRGgPfr3Vtt-AdbE38pwVg",
  authDomain: "shaecleaners-f6ed8.firebaseapp.com",
  projectId: "shaecleaners-f6ed8",
  storageBucket: "shaecleaners-f6ed8.firebasestorage.app",
  messagingSenderId: "839960858623",
  appId: "1:839960858623:web:1aa97b91f54924cd10e1ca"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const msg = document.getElementById("msg");


function tampilError(error) {

  console.error(error);

  const pesan = {
    "auth/email-already-in-use":
      "Email sudah terdaftar.",

    "auth/invalid-email":
      "Format email tidak valid.",

    "auth/weak-password":
      "Password minimal 6 karakter.",

    "auth/invalid-credential":
      "Email atau password salah.",

    "auth/operation-not-allowed":
      "Login Email/Password belum diaktifkan di Firebase.",

    "auth/configuration-not-found":
      "Firebase Authentication belum dikonfigurasi.",

    "auth/network-request-failed":
      "Koneksi internet bermasalah."
  };

  msg.textContent =
    pesan[error.code] ||
    "Terjadi kesalahan: " + error.message;
}


// ===============================
// REGISTER
// ===============================

const registerForm =
  document.getElementById("registerForm");

if (registerForm) {

  registerForm.addEventListener("submit", async function(e) {

    e.preventDefault();

    msg.textContent = "Mendaftarkan akun...";

    try {

      const nama =
        document.getElementById("name").value.trim();

      const hp =
        document.getElementById("phone").value.trim();

      const email =
        document.getElementById("email").value.trim();

      const password =
        document.getElementById("password").value;


      if (!nama || !hp || !email || !password) {

        msg.textContent =
          "Semua data wajib diisi.";

        return;
      }


      // Buat akun Firebase
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      // Simpan nama ke Authentication
      await updateProfile(
        userCredential.user,
        {
          displayName: nama
        }
      );


      // Simpan data pelanggan
      await setDoc(
        doc(
          db,
          "customers",
          userCredential.user.uid
        ),
        {
          uid: userCredential.user.uid,
          nama: nama,
          hp: hp,
          email: email,
          createdAt: new Date()
        }
      );


      msg.textContent =
        "✓ Akun berhasil dibuat. Membuka aplikasi...";


      setTimeout(() => {

        window.location.href = "index.html";

      }, 800);


    } catch (error) {

      tampilError(error);

    }

  });

}


// ===============================
// LOGIN
// ===============================

const loginForm =
  document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async function(e) {

    e.preventDefault();

    msg.textContent = "Memeriksa akun...";

    try {

      const email =
        document.getElementById("email").value.trim();

      const password =
        document.getElementById("password").value;


      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      msg.textContent =
        "✓ Login berhasil...";


      setTimeout(() => {

        window.location.href = "index.html";

      }, 500);


    } catch (error) {

      tampilError(error);

    }

  });

}