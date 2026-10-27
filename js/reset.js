(async function(){const C=window.SHOP_AUTH,sb=window.supabase.createClient(C.url,C.key,{auth:{persistSession:true,detectSessionInUrl:false}});
const q=new URLSearchParams(location.search),f=document.getElementById('rf'),m=document.getElementById('rmsg');const say=(t,k)=>{m.textContent=t;m.className='sa-msg '+(k||'err')};
let ok=false;const th=q.get('token_hash');
if(th){const {error}=await sb.auth.verifyOtp({token_hash:th,type:'recovery'});ok=!error;if(error)say('This reset link has expired or was already used. Request a new one from Log in → Forgot password.');else history.replaceState(null,'',location.pathname)}
else{const {data}=await sb.auth.getSession();ok=!!data.session;if(!ok)say('Open this page from the link in your reset email.')}
f.hidden=!ok;f.onsubmit=async e=>{e.preventDefault();const a=f.p1.value,b=f.p2.value;if(a!==b)return say('The two passwords don\'t match.');
 const {error}=await sb.auth.updateUser({password:a});if(error)return say(error.message);say('Password updated. Taking you back to the shop…','ok');setTimeout(()=>location.href=C.home||'./',1800)}})();
