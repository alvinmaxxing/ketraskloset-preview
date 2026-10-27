// Ketra's Kloset: cookie notice + first-visit welcome + card review links.
(function(){
  var L = window.KK_LINKS || {privacy:'privacy.html', shop:'shop.html'};
  var WA = 'https://wa.me/256700929189?text=' + encodeURIComponent("Hello Ketra's Kloset, I'd like to ask about a piece.");
  function get(k){ try{return localStorage.getItem(k)}catch(e){return null} }
  function set(k,v){ try{localStorage.setItem(k,v)}catch(e){} }
  function cookie(){
    if (get('kkCookie')) return welcome();
    var d=document.createElement('div'); d.className='kk-cookie'; d.setAttribute('role','region'); d.setAttribute('aria-label','Cookie notice');
    d.innerHTML='<p>We use essential storage for your basket, favourites and sign-in. <a href="'+L.privacy+'">Privacy policy</a></p><div><button type="button" class="kk-btn kk-btn-line" data-c="declined">Decline</button><button type="button" class="kk-btn kk-btn-dark" data-c="accepted">Accept</button></div>';
    d.addEventListener('click',function(e){ var b=e.target.closest('[data-c]'); if(!b) return; set('kkCookie',b.getAttribute('data-c')); d.remove(); setTimeout(welcome,400); });
    document.body.appendChild(d);
    setTimeout(welcome, 1200);
  }
  var shown=false;
  function welcome(){
    if (shown || get('kkWelcome')) return; shown=true;
    var w=document.createElement('div'); w.className='kk-welcome'; w.setAttribute('role','dialog'); w.setAttribute('aria-modal','true'); w.setAttribute('aria-labelledby','kk-wl-t');
    w.innerHTML='<div class="kk-wl-scrim" data-x></div><div class="kk-wl-card"><button type="button" class="kk-wl-x" data-x aria-label="Close">&times;</button><div class="eyebrow-script">Welcome</div><h2 id="kk-wl-t" class="kk-serif">Welcome to Ketra\'s Kloset</h2><p>Join our email list for <b>10% off your first order</b>, plus first look at new pieces.</p>'+(get('kkSignup')?'<p class="kk-wl-code">Your code: <b>KLOSET10</b></p>':'<form class="kk-wl-form" novalidate><label for="kk-wl-em" class="sr-only">Email address</label><input id="kk-wl-em" type="email" placeholder="Your email address" autocomplete="email" required><button type="submit" class="kk-btn kk-btn-dark">Get 10% off</button></form><p class="kk-wl-msg" role="status"></p>')+'<p class="kk-wl-small">One use per customer, new orders only; the shop confirms your code.</p><div class="kk-wl-acts"><a class="kk-btn kk-btn-dark" href="'+L.shop+'" data-go>Shop the closet</a><a class="kk-btn kk-btn-line" href="'+WA+'" target="_blank" rel="noopener" data-go>Chat on WhatsApp</a></div></div>';
    function close(){ set('kkWelcome','1'); w.remove(); document.removeEventListener('keydown',esc); }
    function esc(e){ if(e.key==='Escape') close(); }
    w.addEventListener('click',function(e){ if(e.target.closest('[data-x]')) close(); else if(e.target.closest('[data-go]')) set('kkWelcome','1'); });
    var fm=w.querySelector('.kk-wl-form'); if(fm) fm.addEventListener('submit',function(e){ e.preventDefault();
      var em=(fm.querySelector('input').value||'').trim().toLowerCase(), m=w.querySelector('.kk-wl-msg');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)||em.length>254){ m.textContent='Please enter a valid email address.'; return; }
      var c=null; try{ c=window.supabase.createClient(window.SHOP_AUTH.url,window.SHOP_AUTH.key,{auth:{persistSession:false,autoRefreshToken:false,storageKey:'kk-signup'}}); }catch(x){}
      if(!c){ m.textContent='Sorry, sign-up is unavailable right now.'; return; }
      var bt=fm.querySelector('button'); bt.disabled=true; m.textContent='Saving…';
      c.from('email_signups').insert({email:em,source:'ketraskloset-welcome'}).then(function(r){ bt.disabled=false;
        if(r.error && r.error.code!=='23505'){ m.textContent='Sorry, that didn’t go through. Please try again.'; return; }
        set('kkSignup','1'); set('kkWelcome','1');
        fm.outerHTML='<p class="kk-wl-code">Thank you. Your code: <b>KLOSET10</b></p><p class="kk-wl-small" style="margin-top:-.4rem">Enter it in your basket for 10% off pieces.</p>'; m.textContent=''; }); });
    document.addEventListener('keydown',esc); document.body.appendChild(w);
  }
  // "Write a review" inside card links goes straight to the review form.
  document.addEventListener('click',function(e){ var r=e.target.closest('[data-kk-rv]'); if(!r) return; e.preventDefault(); e.stopPropagation(); location.href='piece.html?id='+encodeURIComponent(r.getAttribute('data-kk-rv'))+'#kk-reviews'; }, true);
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',cookie); else cookie();
})();
