// Ketras Kloset: wishlist (device for guests, account when logged in), WhatsApp enquiries + contact messages saved to the database.
(function(){
var A=window.ACCT;if(!A)return;
var LS='kkwish',wish=[],had=false;
function local(){try{return JSON.parse(localStorage[LS]||'[]')}catch(e){return[]}}
function save(){if(!A.user())localStorage[LS]=JSON.stringify(wish);paint()}
window.SHOP_WISH_COUNT=function(){return wish.length};
wish=local();
A.onChange(function(u){if(u){had=true;var l=local();A.wishMerge(l).then(function(){return A.wishLoad()}).then(function(db){if(db){wish=Array.from(new Set(db.concat(l,wish)));paint();savedGrid()}})}else if(had){wish=local();paint()}});
var qs=new URLSearchParams(location.search),pid=qs.get('id');
function isPiece(){return /piece(\.html)?$/.test(location.pathname)}
function paint(){var b=document.getElementById('kk-save');if(!b)return;var on=wish.indexOf(pid)>=0;b.setAttribute('aria-pressed',on);b.innerHTML=(on?'♥ Saved':'♡ Save to wishlist')}
function toggle(){var on=wish.indexOf(pid)>=0;wish=on?wish.filter(function(x){return x!==pid}):wish.concat([pid]);save();A.wishSet(pid,!on);A.toast(on?'Removed from your wishlist':'Saved to your wishlist ♥'+(A.user()?'':' · log in to keep it on every device'))}
if(isPiece()){var t=setInterval(function(){var act=document.querySelector('.detail-actions');if(!act)return;clearInterval(t);
 var b=document.createElement('button');b.type='button';b.id='kk-save';b.className='btn btn-outline btn-lg';b.onclick=toggle;act.appendChild(b);paint();
 act.addEventListener('click',function(e){var a=e.target.closest('a[href*="wa.me"]');if(!a)return;var p=window.getProduct&&window.getProduct(pid);if(!p)return;var u=A.user();
  A.placeOrder({ref:'KK-'+Date.now().toString(36).toUpperCase().slice(-6)+Math.random().toString(36).slice(2,5).toUpperCase(),channel:'whatsapp',status:'whatsapp-enquiry',method:'whatsapp',
   name:u?(u.user_metadata&&u.user_metadata.full_name)||null:null,email:u?u.email:null,total:p.price_ugx||0,items:[{key:p.id,name:p.name,colour:p.color,price:p.price_ugx||0}]})})},150);setTimeout(function(){clearInterval(t)},15000)}
document.addEventListener('submit',function(e){var f=e.target;if(f.id!=='contact-form')return;var g=function(n){var el=f.querySelector('[name='+n+']');return el?el.value:''};
 A.contact({name:g('name'),email:g('email'),piece:g('piece'),message:g('message')})},true);
function savedGrid(){if(qs.get('saved')!=='1'||!window.KETRAS_CATALOG_READY)return;window.KETRAS_CATALOG_READY.then(function(){setTimeout(function(){var g=document.getElementById('shop-grid');if(!g)return;
 var list=wish.map(function(id){return window.getProduct(id)}).filter(Boolean);
 g.innerHTML=list.length?list.map(window.renderProductCard).join(''):'<p style="grid-column:1/-1;text-align:center;color:var(--grey);padding:2rem;">No saved pieces yet. Tap “Save to wishlist” on any piece.</p>';
 var c=document.getElementById('result-count');if(c)c.textContent=list.length+' Saved';document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active')})},0)})}
savedGrid();
})();
