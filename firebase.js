// firebase.js
// GANTI bagian firebaseConfig dengan konfigurasi project Firebase Anda.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
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
export const db = getFirestore(app);

async function simpanOrder(order) {
  const ref = await addDoc(collection(db, "orders"), {
    ...order,
    status: "Menunggu",
    createdAt: serverTimestamp()
  });
  return ref.id;
}

async function ubahStatusOrder(id, status) {
  await updateDoc(doc(db, "orders", id), { status });
}

function pantauOrders(callback) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snapshot => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}


// Customer app uses window.simpanOrder; admin app uses ES module imports.
window.simpanOrder = simpanOrder;
window.ubahStatusOrder = ubahStatusOrder;
window.pantauOrders = pantauOrders;
export { simpanOrder, ubahStatusOrder, pantauOrders };
