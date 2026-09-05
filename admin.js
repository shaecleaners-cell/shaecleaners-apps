import { auth, db, onAuthStateChanged, signInWithEmailAndPassword, signOut, collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from './firebase.js';

const $=id=>document.getElementById(id);
let allOrders=[]; let unsubscribe=null;

function showError(text){$('errorBox').textContent=text;$('errorBox').hidden=false;}
function clearError(){$('errorBox').hidden=true;}
function rupiah(n){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0)}
function dateText(v){if(!v)return '-';try{return new Date(v+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}catch{return v}}

$('loginBtn').onclick=async()=>{const email=$('email').value.trim(),pass=$('password').value;if(!email||!pass){$('loginMsg').textContent='Email dan password wajib diisi.';return} $('loginBtn').disabled=true;$('loginMsg').textContent='Memproses...';try{await signInWithEmailAndPassword(auth,email,pass);$('loginMsg').textContent=''}catch(e){$('loginMsg').textContent='Login gagal: '+(e.code||e.message)}finally{$('loginBtn').disabled=false}};
$('logoutBtn').onclick=()=>signOut(auth);
$('filterStatus').onchange=renderOrders;

onAuthStateChanged(auth,user=>{if(user){$('loginBox').hidden=true;$('panel').hidden=false;startOrders()}else{$('loginBox').hidden=false;$('panel').hidden=true;if(unsubscribe){unsubscribe();unsubscribe=null}}});

function startOrders(){clearError();$('orders').innerHTML='<div class="loading">Menghubungkan ke Firebase...</div>';const q=query(collection(db,'orders'),orderBy('createdAt','desc'));unsubscribe=onSnapshot(q,snap=>{allOrders=snap.docs.map(d=>({id:d.id,...d.data()}));renderOrders()},err=>{showError('Firebase menolak akses ke orders: '+err.message);$('orders').innerHTML='<div class="empty">Tidak dapat membaca pesanan.</div>'})}

function renderOrders(){const filter=$('filterStatus').value;const orders=allOrders.filter(o=>!filter||o.status===filter);$('totalOrders').textContent=allOrders.length;$('waitingOrders').textContent=allOrders.filter(o=>o.status==='Menunggu'||o.status==='Menunggu Konfirmasi').length;$('confirmedOrders').textContent=allOrders.filter(o=>o.status==='Dikonfirmasi').length;$('doneOrders').textContent=allOrders.filter(o=>o.status==='Selesai').length;if(!orders.length){$('orders').innerHTML='<div class="empty">Belum ada pesanan.</div>';return}$('orders').innerHTML=orders.map(o=>`<article class="invoice-card"><div class="top"><div><b>${o.service||o.layanan||'Layanan'}</b><div class="muted">${o.invoice||o.id}</div></div><span class="status">${o.status||'Menunggu'}</span></div><div class="line"><span>Pelanggan</span><b>${o.name||o.nama||'-'}</b></div><div class="line"><span>WhatsApp</span><b>${o.phone||o.hp||'-'}</b></div><div class="line"><span>Jadwal</span><b>${dateText(o.date||o.tanggal)} ${o.time||o.jam||''}</b></div><div class="line"><span>Total</span><b>${rupiah(o.total)}</b></div><div class="actions"><button onclick="ubahStatus('${o.id}','Dikonfirmasi')">Konfirmasi</button><button onclick="ubahStatus('${o.id}','Diproses')">Proses</button><button onclick="ubahStatus('${o.id}','Selesai')">Selesai</button><button class="wa" onclick="wa('${(o.phone||o.hp||'').replace(/\D/g,'')}','${o.invoice||o.id}')">WhatsApp</button></div></article>`).join('')}

window.ubahStatus=async(id,status)=>{try{await updateDoc(doc(db,'orders',id),{status,updatedAt:serverTimestamp()})}catch(e){showError('Gagal mengubah status: '+e.message)}};
window.wa=(phone,inv)=>{if(!phone)return;phone=phone.startsWith('0')?'62'+phone.slice(1):phone;window.open('https://wa.me/'+phone+'?text='+encodeURIComponent('Halo, kami dari Shae Cleaners. Terkait pesanan '+inv+'.'),'_blank')};
