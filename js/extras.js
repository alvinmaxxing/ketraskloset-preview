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
    w.innerHTML='<div class="kk-wl-scrim" data-x></div><div class="kk-wl-card"><button type="button" class="kk-wl-x" data-x aria-label="Close">&times;</button><div class="eyebrow-script">Welcome</div><h2 id="kk-wl-t" class="kk-serif">Welcome to Ketra\'s Kloset</h2><p>Pre-loved and one-of-a-kind pieces, chosen with love. Each piece is the only one, so save your favourites early.</p><div class="kk-wl-acts"><a class="kk-btn kk-btn-dark" href="'+L.shop+'" data-go>Shop the closet</a><a class="kk-btn kk-btn-line" href="'+WA+'" target="_blank" rel="noopener" data-go>Chat on WhatsApp</a></div></div>';
    function close(){ set('kkWelcome','1'); w.remove(); document.removeEventListener('keydown',esc); }
    function esc(e){ if(e.key==='Escape') close(); }
    w.addEventListener('click',function(e){ if(e.target.closest('[data-x]')) close(); else if(e.target.closest('[data-go]')) set('kkWelcome','1'); });
    document.addEventListener('keydown',esc); document.body.appendChild(w);
  }
  // "Write a review" inside card links goes straight to the review form.
  document.addEventListener('click',function(e){ var r=e.target.closest('[data-kk-rv]'); if(!r) return; e.preventDefault(); e.stopPropagation(); location.href='piece.html?id='+encodeURIComponent(r.getAttribute('data-kk-rv'))+'#kk-reviews'; }, true);
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',cookie); else cookie();
})();
