/* Shop accounts: email/password, Google, Face ID (passkeys), password reset, wishlist sync, orders.
   Needs window.SHOP_AUTH = {url, key, name, currency, google:false, theme:{...}} set before this file.
   Only the PUBLISHABLE key goes in the website. Never put a service/secret key here. */
(function(){
const C=window.SHOP_AUTH;if(!C||!window.supabase)return;
const sb=window.supabase.createClient(C.url,C.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
const FN=C.url+'/functions/v1/shop-auth';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const G='<svg class="sa-g" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const FACE='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2M9 9v1M15 9v1M12 9v4h-1M9 16c1.7 1.3 4.3 1.3 6 0"/></svg>';
const USER='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
const T=C.theme||{};
const css=`.sa-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid currentColor;border-radius:99px;padding:8px 14px;font:500 13px inherit;font-family:inherit;color:inherit;cursor:pointer;white-space:nowrap}
.sa-btn .sa-lbl{max-width:110px;overflow:hidden;text-overflow:ellipsis}@media(max-width:600px){.sa-btn{padding:8px}.sa-btn .sa-lbl{display:none}}
.sa-ov{position:fixed;inset:0;z-index:1000;background:rgba(17,17,17,.45);display:none;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px)}.sa-ov.open{display:flex}
.sa-box{background:${T.bg||'#fff'};color:${T.ink||'#111'};width:100%;max-width:420px;max-height:92vh;overflow:auto;border-radius:${T.radius||'20px'};padding:30px 26px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.25);font-family:${T.sans||'inherit'}}
.sa-box h2{font-family:${T.serif||'inherit'};font-weight:400;font-size:28px;margin:0 0 6px}.sa-box p.sa-sub{opacity:.7;font-size:14px;margin:0 0 20px}
.sa-x{position:absolute;top:10px;right:12px;background:none;border:0;font-size:28px;line-height:1;cursor:pointer;color:inherit;padding:6px}
.sa-box label{display:block;font-size:12px;font-weight:600;letter-spacing:.04em;margin:12px 0 6px}.sa-box input{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #0002;border-radius:12px;font:15px inherit;font-family:inherit;background:#fff;color:#111}
.sa-main{width:100%;margin-top:18px;padding:14px;border:0;border-radius:99px;background:${T.accent||'#111'};color:${T.onAccent||'#fff'};font:600 15px inherit;font-family:inherit;cursor:pointer}.sa-main[disabled]{opacity:.6}
.sa-gbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:12px;height:44px;margin-top:10px;background:#fff;color:#1f1f1f;border:1px solid #747775;border-radius:99px;font:500 14px Roboto,Arial,sans-serif;cursor:pointer;letter-spacing:.25px}.sa-gbtn:hover{background:#f8f8f8}
.sa-fbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;height:44px;margin-top:10px;background:none;color:inherit;border:1px solid #0003;border-radius:99px;font:500 14px inherit;font-family:inherit;cursor:pointer}
.sa-or{display:flex;align-items:center;gap:10px;margin:18px 0 4px;font-size:12px;opacity:.6}.sa-or:before,.sa-or:after{content:"";flex:1;height:1px;background:currentColor;opacity:.3}
.sa-links{display:flex;justify-content:space-between;gap:10px;margin-top:16px;font-size:13px}.sa-links a{color:inherit;cursor:pointer;text-decoration:underline}
.sa-msg{font-size:13px;margin-top:12px;min-height:1em}.sa-msg.err{color:#b3261e}.sa-msg.ok{color:#1e7b3a}
.sa-card{border:1px solid #0001;background:#fff8;border-radius:14px;padding:14px;margin-top:12px;font-size:14px}.sa-card b{display:block;margin-bottom:4px}
.sa-ord{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-top:1px solid #0001}.sa-ord:first-of-type{border:0}
.sa-ghost{background:none;border:1px solid #0003;border-radius:99px;padding:10px 16px;font:500 13px inherit;font-family:inherit;color:inherit;cursor:pointer;margin-top:10px}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const ov=document.createElement('div');ov.className='sa-ov';ov.id='sa-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.innerHTML='<div class="sa-box"><button class="sa-x" aria-label="Close">×</button><div id="sa-body"></div></div>';document.body.appendChild(ov);
const body=ov.querySelector('#sa-body');ov.querySelector('.sa-x').onclick=()=>close();ov.onclick=e=>{if(e.target==ov)close()};document.addEventListener('keydown',e=>{if(e.key=='Escape')close()});
function close(){ov.classList.remove('open')}
let user=null,profile=null;const subs=[];
const passkeysOK=()=>!!(window.PublicKeyCredential&&window.SimpleWebAuthnBrowser);
async function call(action,data={},auth=false){const h={'Content-Type':'application/json',apikey:C.key};if(auth){const {data:s}=await sb.auth.getSession();if(s.session)h.Authorization='Bearer '+s.session.access_token}
 const r=await fetch(FN,{method:'POST',headers:h,body:JSON.stringify({action,...data})});const j=await r.json().catch(()=>({error:'Network error'}));if(!r.ok&&!j.error)j.error='Something went wrong';return j}
const msg=(t,k='err')=>{const m=body.querySelector('.sa-msg');if(m){m.className='sa-msg '+k;m.textContent=t}};
const busy=(b,on,t)=>{b.disabled=on;if(t)b.textContent=t};
const gBtn=t=>`<button type="button" class="sa-gbtn" data-g>${G}<span>${t}</span></button>`;
const fBtn=()=>passkeysOK()?`<button type="button" class="sa-fbtn" data-face>${FACE}<span>Sign in with Face ID / fingerprint</span></button>`:'';
function view(v){
 if(v=='login'){body.innerHTML=`<h2>Welcome back</h2><p class="sa-sub">Log in to your ${esc(C.name)} account.</p>${gBtn('Sign in with Google')}${fBtn()}<div class="sa-or">or</div>
 <form data-f="login"><label for="sa-e">Email</label><input id="sa-e" name="email" type="email" autocomplete="username webauthn" required><label for="sa-p">Password</label><input id="sa-p" name="password" type="password" autocomplete="current-password" required minlength="8"><button class="sa-main">Log in</button></form>
 <p class="sa-msg"></p><div class="sa-links"><a data-v="forgot">Forgot password?</a><a data-v="signup">Create an account</a></div>`}
 if(v=='signup'){body.innerHTML=`<h2>Join ${esc(C.name)}</h2><p class="sa-sub">Save your wishlist, check out faster and track orders.</p>${gBtn('Sign up with Google')}<div class="sa-or">or</div>
 <form data-f="signup"><label for="sa-n">Name</label><input id="sa-n" name="name" autocomplete="name" required maxlength="120"><label for="sa-e">Email</label><input id="sa-e" name="email" type="email" autocomplete="email" required><label for="sa-p">Password</label><input id="sa-p" name="password" type="password" autocomplete="new-password" required minlength="8" placeholder="At least 8 characters"><button class="sa-main">Create account</button><p class="pol-agree">By creating an account you agree to our <a href="returns.html">Returns</a> and <a href="privacy.html">Privacy</a> policies.</p></form>
 <p class="sa-msg"></p><div class="sa-links"><span></span><a data-v="login">I already have an account</a></div>`}
 if(v=='forgot'){body.innerHTML=`<h2>Reset password</h2><p class="sa-sub">Enter your email and we'll send you a link to choose a new password.</p>
 <form data-f="forgot"><label for="sa-e">Email</label><input id="sa-e" name="email" type="email" autocomplete="email" required><button class="sa-main">Send reset link</button></form><p class="sa-msg"></p><div class="sa-links"><a data-v="login">Back to log in</a></div>`}
 if(v=='account')return renderAccount();
 wire();
}
function wire(){
 body.querySelectorAll('[data-v]').forEach(a=>a.onclick=()=>view(a.dataset.v));
 body.querySelectorAll('[data-g]').forEach(b=>b.onclick=google);
 body.querySelectorAll('[data-face]').forEach(b=>b.onclick=faceLogin);
 const f=body.querySelector('form');if(!f)return;
 f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f)),b=f.querySelector('.sa-main'),lbl=b.textContent;busy(b,true,'Please wait…');msg('','');
  try{
   if(f.dataset.f=='login'){const {error}=await sb.auth.signInWithPassword({email:d.email.trim(),password:d.password});if(error)throw new Error(/invalid/i.test(error.message)?'Wrong email or password.':error.message);close();toast('Welcome back ✦')}
   if(f.dataset.f=='signup'){const j=await call('signup',d);if(j.error)throw new Error(j.error);const {error}=await sb.auth.signInWithPassword({email:d.email.trim().toLowerCase(),password:d.password});if(error)throw error;close();toast('Account created ✦ Welcome, '+d.name.split(' ')[0])}
   if(f.dataset.f=='forgot'){const j=await call('recover',d);if(j.error)throw new Error(j.error);
    if(j.reason=='email-not-configured')msg('Password-reset emails are switching on soon. For now, message us on WhatsApp and we\'ll help you get back in.','err');else msg('If an account exists for '+d.email+', a reset link is on its way. Check your inbox and spam.','ok')}
  }catch(err){msg(err.message||String(err))}busy(b,false,lbl)}
}
async function google(){if(!C.google){msg('Google sign-in is being switched on. Please use email for now.');return}
 const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:C.redirect||(location.origin+location.pathname)}});if(error)msg(error.message)}
async function faceLogin(){msg('','');try{const o=await call('passkey-login-options');if(o.error)throw new Error(o.error);
 const resp=await SimpleWebAuthnBrowser.startAuthentication({optionsJSON:o.options});const v=await call('passkey-login-verify',{challengeId:o.challengeId,response:resp});if(v.error)throw new Error(v.error);
 const {error}=await sb.auth.verifyOtp({token_hash:v.token_hash,type:'magiclink'});if(error)throw error;close();toast('Signed in with Face ID ✦')}
 catch(e){msg(e.name=='NotAllowedError'?'Face ID was cancelled.':(e.message||String(e)))}}
async function enableFace(btn){const m=body.querySelector('.sa-msg');try{btn.disabled=true;const o=await call('passkey-register-options',{},true);if(o.error)throw new Error(o.error);
 const resp=await SimpleWebAuthnBrowser.startRegistration({optionsJSON:o.options});const v=await call('passkey-register-verify',{challengeId:o.challengeId,response:resp,deviceName:navigator.platform||''},true);if(v.error)throw new Error(v.error);
 msg('Face ID / fingerprint is on. Next time tap "Sign in with Face ID".','ok');renderAccount(true)}catch(e){msg(e.name=='NotAllowedError'?'Cancelled.':e.name=='InvalidStateError'?'This device is already set up.':(e.message||String(e)))}btn.disabled=false}
async function renderAccount(keepMsg){if(!user)return view('login');const old=keepMsg?body.querySelector('.sa-msg')?.outerHTML:'';
 const [{data:ords},{data:pks}]=await Promise.all([sb.from('orders').select('ref,total,currency,status,channel,created_at').order('created_at',{ascending:false}).limit(10),sb.from('passkeys').select('id,created_at')]);
 const nm=(profile&&profile.full_name)||user.user_metadata?.full_name||user.email;
 body.innerHTML=`<h2>Hi, ${esc(String(nm).split(' ')[0])}</h2><p class="sa-sub">${esc(user.email)}</p>
 <div class="sa-card"><b>Your orders</b>${ords&&ords.length?ords.map(o=>`<div class="sa-ord"><span>${esc(o.ref)} · ${new Date(o.created_at).toLocaleDateString()}${o.channel=='whatsapp'?' · WhatsApp':''}</span><span>${esc(o.currency)} ${Number(o.total).toLocaleString()}</span></div>`).join(''):'<span style="opacity:.6">No orders yet.</span>'}</div>
 <div class="sa-card"><b>Saved pieces</b><span id="sa-wc">${(window.SHOP_WISH_COUNT&&SHOP_WISH_COUNT())||0}</span> in your wishlist${C.onWishOpen?' · <a style="text-decoration:underline;cursor:pointer" id="sa-wo">View</a>':''}</div>
 <div class="sa-card"><b>Face ID / fingerprint</b>${pks&&pks.length?`On for ${pks.length} device${pks.length>1?'s':''}.`:'Sign in with one touch next time.'}${passkeysOK()?`<br><button class="sa-ghost" id="sa-ef">${FACE.replace('aria-hidden','style="vertical-align:-4px" aria-hidden')} ${pks&&pks.length?'Add this device':'Enable Face ID'}</button>`:'<br><small style="opacity:.6">Not supported in this browser.</small>'}</div>
 ${old||'<p class="sa-msg"></p>'}<button class="sa-main" id="sa-lo">Log out</button>`;
 body.querySelector('#sa-lo').onclick=async()=>{await sb.auth.signOut();close();toast('Logged out')};
 const ef=body.querySelector('#sa-ef');if(ef)ef.onclick=()=>enableFace(ef);const wo=body.querySelector('#sa-wo');if(wo)wo.onclick=()=>{close();C.onWishOpen()}}
function toast(t){if(window.SHOP_TOAST)return SHOP_TOAST(t);let el=document.getElementById('sa-toast');if(!el){el=document.createElement('div');el.id='sa-toast';el.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#111;color:#fff;padding:12px 20px;border-radius:99px;font:14px sans-serif;z-index:1001;transition:opacity .3s';document.body.appendChild(el)}el.textContent=t;el.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>el.style.opacity=0,2600)}
function open(v){view(v||(user?'account':'login'));ov.classList.add('open');setTimeout(()=>{const i=body.querySelector('input');if(i&&matchMedia('(min-width:700px)').matches)i.focus()},50)}
// header button
const btn=document.createElement('button');btn.type='button';btn.className='sa-btn '+(C.btnClass||'');btn.id='sa-acct';btn.setAttribute('aria-label','Account');btn.innerHTML=USER+'<span class="sa-lbl">Log in</span>';btn.onclick=()=>open();
const slot=document.querySelector(C.mount);if(slot){C.mountFirst?slot.prepend(btn):slot.appendChild(btn)}
function paintBtn(){btn.querySelector('.sa-lbl').textContent=user?(((profile&&profile.full_name)||user.user_metadata?.full_name||'Account').split(' ')[0]):'Log in'}
async function setUser(u){const was=user&&user.id;user=u;profile=null;
 if(u){const {data}=await sb.from('profiles').select('full_name,phone').eq('id',u.id).maybeSingle();profile=data}
 paintBtn();if((was||null)!==(u&&u.id||null))subs.forEach(f=>{try{f(user)}catch(e){console.error(e)}})}
sb.auth.onAuthStateChange((ev,s)=>{setTimeout(()=>setUser(s?s.user:null),0)});
// wishlist + data API for the shop pages
window.ACCT={sb,open,user:()=>user,onChange:f=>{subs.push(f);if(user)f(user)},toast,
 async wishLoad(){if(!user)return null;const {data,error}=await sb.from('wishlists').select('product_key');if(error){console.error(error);return null}return data.map(r=>r.product_key)},
 async wishMerge(keys){if(!user||!keys.length)return;await sb.from('wishlists').upsert(keys.map(k=>({user_id:user.id,product_key:k})),{onConflict:'user_id,product_key',ignoreDuplicates:true})},
 async wishSet(k,on){if(!user)return;if(on)await sb.from('wishlists').upsert({user_id:user.id,product_key:k},{onConflict:'user_id,product_key',ignoreDuplicates:true});else await sb.from('wishlists').delete().eq('user_id',user.id).eq('product_key',k)},
 async placeOrder(o){const {data,error}=await sb.rpc('place_order',{o:{currency:C.currency,...o}});if(error){console.error(error);return null}call('order-email',{ref:data}).catch(()=>{});return data},
 async waitlist(d){const {error}=await sb.from('waitlist').insert({name:d.name,contact:d.contact,drop_name:d.drop_name||null,user_id:user?user.id:null});if(error){console.error(error);return false}call('signup-email',{to:d.contact,kind:'waitlist'}).catch(()=>{});return true},
 async restock(d){const {error}=await sb.from('restock_alerts').insert({name:d.name,contact:d.contact,product_key:d.product_key,user_id:user?user.id:null});if(error){console.error(error);return false}call('signup-email',{to:d.contact,kind:'restock'}).catch(()=>{});return true},
 async newsletter(email){const {error}=await sb.from('newsletter').insert({email:email.trim().toLowerCase()});return !error||error.code=='23505'},
 async contact(d){const {error}=await sb.from('contact_messages').insert({name:d.name,email:d.email||null,piece:d.piece||null,message:d.message||null,user_id:user?user.id:null});if(error)console.error(error);return !error}};
if(/[#&](error_description)=/.test(location.hash)){const p=new URLSearchParams(location.hash.slice(1));setTimeout(()=>{open('login');msg(p.get('error_description')||'Sign-in failed')},300)}
})();
