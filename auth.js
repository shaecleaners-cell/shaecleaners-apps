// =====================================================
// SHAE CLEANERS - AUTH.JS
// LOGIN & REGISTER
// =====================================================

import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc,
  setDoc
} from "./firebase.js";

const msg = document.getElementById("msg");

function errorMessage(e) {

  const errors = {
    "auth/email-already-in-use":
      "Email sudah terdaftar.",

    "auth/invalid-credential":
      "Email atau password salah.",

    "auth/weak-password":
      "Password minimal 6 karakter.",

    "auth/invalid-email":
      "Format email tidak valid.",

    "auth/network-request-failed":
      "Periksa koneksi internet.",

    "auth/configuration-not-found":
      "Firebase Authentication belum diaktifkan. Silakan aktifkan Email/Password di Firebase Console.",

    "auth/operation-not-allowed":
      "Login Email/Password belum diaktifkan di Firebase.",

    "auth/too-many-requests":
      "Terlalu banyak percobaan. Coba lagi beberapa saat."
  };

  return errors[e.code] || e.message || "Terjadi kesalahan.";
}


// =====================================================
// REGISTER
// =====================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

  registerForm.onsubmit = async (e) => {

    e.preventDefault();

    msg.textContent = "Mendaftarkan...";

    try {

      const name =
        document.getElementById("name").value.trim();

      const phone =
        document.getElementById("phone").value.trim();

      const email =
        document.getElementById("email").value.trim();

      const password =
        document.getElementById("password").value;


      // Buat akun Firebase
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      // Simpan nama ke Firebase Auth
      await updateProfile(
        credential.user,
        {
          displayName: name
        }
      );


      // Simpan data pelanggan ke Firestore
      await setDoc(
        doc(db, "customers", credential.user.uid),
        {
          uid: credential.user.uid,
          nama: name,
          hp: phone,
          email: email,
          createdAt: new Date()
        }
      );


      msg.textContent =
        "Pendaftaran berhasil. Membuka aplikasi...";


      setTimeout(() => {
        location.href = "index.html";
      }, 500);


    } catch (error) {

      console.error("REGISTER ERROR:", error);

      msg.textContent =
        errorMessage(error);
    }

  };

}


// =====================================================
// LOGIN
// =====================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

  loginForm.onsubmit = async (e) => {

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
        "Login berhasil...";


      setTimeout(() => {
        location.href = "index.html";
      }, 500);


    } catch (error) {

      console.error("LOGIN ERROR:", error);

      msg.textContent =
        errorMessage(error);
    }

  };

}