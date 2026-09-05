// =====================================================
// SHAE CLEANERS - FIREBASE.JS
// =====================================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyAQRKEMFceCbJRGgPfr3Vtt-AdbE38pwVg",
  authDomain: "shaecleaners-f6ed8.firebaseapp.com",
  projectId: "shaecleaners-f6ed8",
  storageBucket: "shaecleaners-f6ed8.firebasestorage.app",
  messagingSenderId: "839960858623",
  appId: "1:839960858623:web:1aa97b91f54924cd10e1ca"
};


// =====================================================
// INIT FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);


// =====================================================
// SIMPAN ORDER
// =====================================================

async function simpanOrder(order) {

  const ref = await addDoc(
    collection(db, "orders"),
    {
      ...order,

      status: "Menunggu",

      createdAt: serverTimestamp()
    }
  );

  return ref.id;
}


// =====================================================
// UBAH STATUS ORDER
// =====================================================

async function ubahStatusOrder(id, status) {

  await updateDoc(
    doc(db, "orders", id),
    {
      status: status,
      updatedAt: serverTimestamp()
    }
  );

}


// =====================================================
// PANTAU ORDER
// =====================================================

function pantauOrders(callback) {

  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    snapshot => {

      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      callback(data);

    }
  );

}


// =====================================================
// EXPORT
// =====================================================

export {
  simpanOrder,
  ubahStatusOrder,
  pantauOrders,

  // Firestore
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,

  // Authentication
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
};


// =====================================================
// GLOBAL
// =====================================================

window.simpanOrder = simpanOrder;
window.ubahStatusOrder = ubahStatusOrder;
window.pantauOrders = pantauOrders;