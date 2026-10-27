// Ketra's Kloset: basket, favourites, gift cards, Kloset Circle points, reviews.
(function () {
  var BK = 'kkbasket', FV = 'kkwish';
  window.KK_POINTS_PER_UGX = 1000;      // 1 point per UGX 1,000 spent
  window.KK_POINT_VALUE_UGX = 50;       // 100 points = UGX 5,000
  var WA_NUM = (window.KETRAS_WHATSAPP || 'https://wa.me/256700929189');
  function ld(k){try{var v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}}
  function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function fmt(n){return window.formatPrice ? window.formatPrice(n) : 'UGX '+Number(n).toLocaleString('en-US')}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  var state = { gift: null, giftBal: 0, pts: null, usePts: false };

  function sb(){ if (window.ACCT && window.ACCT.sb) return window.ACCT.sb;
    if (!state._sb && window.supabase && window.SHOP_AUTH) state._sb = window.supabase.createClient(window.SHOP_AUTH.url, window.SHOP_AUTH.key, {auth:{persistSession:false}});
    return state._sb; }

  var B = window.KK_BASKET = {
    items: function(){ return ld(BK); },
    has: function(id){ return ld(BK).some(function(i){return i.type==='piece'&&i.id===id}); },
    addPiece: function(id){ if (B.has(id)) return false; var l=ld(BK); l.push({type:'piece',id:id}); sv(BK,l); paint(); return true; },
    addGift: function(amount,to,msg,x){ x=x||{}; var l=ld(BK); l.push({type:'gift',gid:'G'+Date.now().toString(36),amount:amount,to:to||'',msg:msg||'',toEmail:x.toEmail||'',from:x.from||'',fromEmail:x.fromEmail||''}); sv(BK,l); paint(); },
    remove: function(key){ sv(BK, ld(BK).filter(function(i){return (i.id||i.gid)!==key})); paint(); },
    favs: function(){ return ld(FV); },
    isFav: function(id){ return ld(FV).indexOf(id)>=0; },
    toggleFav: function(id){ var l=ld(FV), on=l.indexOf(id)>=0; l=on?l.filter(function(x){return x!==id}):l.concat([id]); sv(FV,l);
      try{ if(window.ACCT&&window.ACCT.user()&&window.ACCT.wishSet) window.ACCT.wishSet(id,!on) }catch(e){} paint(); return !on; },
    open: open
  };

  function lines(){ return ld(BK).map(function(i){
    if (i.type==='gift') return {key:i.gid, gift:true, name:'Gift card'+(i.to?' for '+i.to:''), sub:(i.toEmail?'Email to '+i.toEmail+(i.msg?' · ':''):'')+(i.msg?'“'+i.msg+'”':(i.toEmail?'':'Digital code sent on WhatsApp')), raw:i, price:+i.amount, img:null};
    var p = window.getProduct && window.getProduct(i.id); if (!p) return null;
    var t = window.productThumbs ? window.productThumbs(p)[0] : p.image;
    return {key:p.id, id:p.id, name:p.name, sub:p.category+' · '+p.color, price:+(p.price_ugx||0), img:t, sold:p.available===false};
  }).filter(Boolean); }

  function totals(){ var L=lines(), sub=L.reduce(function(s,l){return s+(l.price||0)},0);
    var pieces=L.filter(function(l){return !l.gift}).reduce(function(s,l){return s+l.price},0);
    var gift = state.gift ? Math.min(state.giftBal, pieces) : 0;
    var ptsOff = (state.usePts && state.pts) ? Math.min(Math.floor(state.pts/100)*100*window.KK_POINT_VALUE_UGX, Math.max(0,sub-gift)) : 0;
    return {L:L, sub:sub, gift:gift, ptsOff:ptsOff, ptsUsed: ptsOff/window.KK_POINT_VALUE_UGX, total:Math.max(0,sub-gift-ptsOff)}; }

  function waLink(){ var t=totals(); if(!t.L.length) return WA_NUM;
    var m = "Hi Ketra's Kloset! I'd like to order:\n";
    t.L.forEach(function(l,i){ m += (i+1)+'. '+l.name+(l.id?' ('+l.id+')':'')+(l.gift&&l.raw.msg?' “'+l.raw.msg+'”':'')+' — '+fmt(l.price)+'\n'+(l.gift&&l.raw.toEmail?'   Recipient email: '+l.raw.toEmail+'\n':'')+(l.gift&&(l.raw.from||l.raw.fromEmail)?'   From: '+[l.raw.from,l.raw.fromEmail].filter(Boolean).join(', ')+'\n':''); });
    m += 'Subtotal: '+fmt(t.sub)+'\n';
    if (t.gift) m += 'Gift card '+state.gift+': −'+fmt(t.gift)+' (please confirm balance)\n';
    if (t.ptsOff) m += 'Kloset Circle: redeem '+t.ptsUsed+' points −'+fmt(t.ptsOff)+' (please confirm)\n';
    m += 'Total: '+fmt(t.total)+'\n\nI\'ll pay by Airtel Money to +256 700 929 189. Please confirm availability and delivery.';
    if (window.ACCT && window.ACCT.user()) m += '\nAccount: '+window.ACCT.user().email;
    return WA_NUM + '?text=' + encodeURIComponent(m); }

  var ICON_BAG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8V6.5a3 3 0 016 0V8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  var ICON_HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" fill="var(--kk-hf,none)" stroke="currentColor" stroke-width="1.3"/></svg>';
  window.KK_ICON_HEART = ICON_HEART;

  function mountHeader(){ var h=document.querySelector('.header-actions'); if(!h||document.getElementById('kk-bag-btn')) return;
    var f=document.createElement('button'); f.type='button'; f.id='kk-fav-btn'; f.className='icon-btn kk-hbtn'; f.setAttribute('aria-label','Favourites');
    f.innerHTML=ICON_HEART+'<span class="kk-count" id="kk-fav-count" hidden>0</span>'; f.onclick=function(){open('fav')};
    var b=document.createElement('button'); b.type='button'; b.id='kk-bag-btn'; b.className='icon-btn kk-hbtn kk-bagbtn'; b.setAttribute('aria-label','Basket');
    b.innerHTML=ICON_BAG+'<span class="kk-blabel">Basket</span><span class="kk-count" id="kk-bag-count" hidden>0</span>'; b.onclick=function(){open('bag')};
    h.appendChild(f); h.appendChild(b);
    var d=document.createElement('div'); d.id='kk-drawer'; d.setAttribute('hidden','');
    d.innerHTML='<div class="kk-scrim" data-kk-close></div><aside class="kk-panel" role="dialog" aria-modal="true" aria-label="Basket">'+
      '<div class="kk-tabs"><button type="button" data-tab="bag">Basket <span id="kk-t-bag"></span></button><button type="button" data-tab="fav">Favourites <span id="kk-t-fav"></span></button><button type="button" class="kk-x" data-kk-close aria-label="Close">&times;</button></div>'+
      '<div class="kk-body" id="kk-body"></div></aside>';
    document.body.appendChild(d);
    d.addEventListener('click', onDrawer); document.addEventListener('keydown',function(e){if(e.key==='Escape')close()}); }

  var tab='bag';
  function open(t){ tab=t||'bag'; var d=document.getElementById('kk-drawer'); if(!d) return; d.removeAttribute('hidden'); requestAnimationFrame(function(){d.classList.add('on')}); document.documentElement.classList.add('kk-lock'); loadPts(); paint(); }
  function close(){ var d=document.getElementById('kk-drawer'); if(!d||d.hidden) return; d.classList.remove('on'); document.documentElement.classList.remove('kk-lock'); setTimeout(function(){d.setAttribute('hidden','')},300); }

  function loadPts(){ var A=window.ACCT; if(!A||!A.user()||state.ptsLoaded) return; state.ptsLoaded=true;
    A.sb.from('loyalty_accounts').select('points').maybeSingle().then(function(r){ state.pts = r.data ? r.data.points : 0; paint(); }); }

  function body(){ var t=totals();
    if (tab==='fav'){ var F=B.favs().map(function(id){return window.getProduct&&window.getProduct(id)}).filter(Boolean);
      if(!F.length) return '<div class="kk-empty"><p class="kk-serif">No favourites yet</p><p>Tap the heart on any piece to keep it here.</p><a class="kk-btn kk-btn-line" href="shop.html">Browse the closet</a></div>';
      return '<ul class="kk-list">'+F.map(function(p){ var inB=B.has(p.id), sold=p.available===false;
        return '<li><a href="piece.html?id='+encodeURIComponent(p.id)+'" class="kk-th"><img src="'+window.productThumbs(p)[0]+'" alt=""></a><div class="kk-li"><a class="kk-nm" href="piece.html?id='+encodeURIComponent(p.id)+'">'+esc(p.name)+'</a><div class="kk-pr">'+fmt(p)+'</div>'+
          '<div class="kk-row">'+(sold?'<span class="kk-muted">Sold out</span>':'<button type="button" class="kk-mini'+(inB?' is-in':'')+'" data-kk-add="'+esc(p.id)+'"'+(inB?' disabled':'')+'>'+(inB?'In basket':'Add to basket')+'</button>')+
          '<button type="button" class="kk-rm" data-kk-unfav="'+esc(p.id)+'">Remove</button></div></div></li>'; }).join('')+'</ul>'; }
    if(!t.L.length) return '<div class="kk-empty"><p class="kk-serif">Your basket is empty</p><p>Every piece is one of a kind. Add yours before someone else does.</p><a class="kk-btn kk-btn-line" href="shop.html">Shop the closet</a></div>';
    var h='<ul class="kk-list">'+t.L.map(function(l){
      return '<li><div class="kk-th'+(l.gift?' kk-gift-th':'')+'">'+(l.img?'<img src="'+l.img+'" alt="">':'<span>KK</span>')+'</div><div class="kk-li"><div class="kk-nm">'+esc(l.name)+'</div><div class="kk-sub">'+esc(l.sub)+'</div><div class="kk-row"><span class="kk-pr">'+fmt(l.price)+'</span><button type="button" class="kk-rm" data-kk-rm="'+esc(l.key)+'">Remove</button></div></div></li>'; }).join('')+'</ul>';
    h+='<div class="kk-foot">';
    h+='<details class="kk-gc"'+(state.gift||state.gcMsg?' open':'')+'><summary>Have a gift card? Enter code</summary><div class="kk-gc-row"><input id="kk-gc-in" placeholder="KK-XXXXXXXXXX" autocomplete="off" value="'+esc(state.gift||'')+'"><button type="button" class="kk-mini" data-kk-gc>Apply</button></div><p class="kk-note" id="kk-gc-msg">'+(state.gcMsg?esc(state.gcMsg):state.gift?'Code '+esc(state.gift)+' has '+fmt(state.giftBal)+' available. The shop confirms the balance on WhatsApp.':'Gift card credit applies to pieces, not to other gift cards. The shop confirms the balance on WhatsApp.')+'</p></details>';
    if (window.ACCT && window.ACCT.user()) {
      if (state.pts==null) h+='<p class="kk-note">Kloset Circle: loading your points…</p>';
      else if (state.pts>=100) h+='<label class="kk-pts"><input type="checkbox" data-kk-pts'+(state.usePts?' checked':'')+'> Redeem Kloset Circle points <span>('+state.pts+' pts, up to '+fmt(Math.floor(state.pts/100)*100*window.KK_POINT_VALUE_UGX)+')</span></label>';
      else h+='<p class="kk-note">Kloset Circle: '+state.pts+' points. Redeem from 100 points. <a href="loyalty.html">How it works</a></p>';
    } else h+='<p class="kk-note"><a href="loyalty.html">Kloset Circle</a>: sign in to earn points on this order.</p>';
    h+='<dl class="kk-sum"><dt>Subtotal</dt><dd>'+fmt(t.sub)+'</dd>'+(t.gift?'<dt>Gift card</dt><dd>−'+fmt(t.gift)+'</dd>':'')+(t.ptsOff?'<dt>Points ('+t.ptsUsed+')</dt><dd>−'+fmt(t.ptsOff)+'</dd>':'')+'<dt class="kk-tot">Total</dt><dd class="kk-tot">'+fmt(t.total)+'</dd></dl>';
    h+='<a class="kk-btn kk-btn-dark" id="kk-wa-order" href="'+waLink()+'" target="_blank" rel="noopener">Order on WhatsApp</a>';
    h+='<p class="kk-note kk-center">Pay by Airtel Money to <b>+256 700 929 189</b>. We confirm availability and delivery in the chat.</p></div>';
    return h; }

  function paint(){ var bc=ld(BK).length, fc=ld(FV).length;
    [['kk-bag-count',bc],['kk-fav-count',fc]].forEach(function(x){var e=document.getElementById(x[0]); if(e){e.textContent=x[1]; e.hidden=!x[1];}});
    var tb=document.getElementById('kk-t-bag'), tf=document.getElementById('kk-t-fav'); if(tb) tb.textContent=bc?'('+bc+')':''; if(tf) tf.textContent=fc?'('+fc+')':'';
    document.querySelectorAll('#kk-drawer [data-tab]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab)});
    var bd=document.getElementById('kk-body'), d=document.getElementById('kk-drawer'); if(bd&&d&&!d.hidden) bd.innerHTML=body();
    document.querySelectorAll('[data-kk-addcard]').forEach(function(b){ var id=b.getAttribute('data-kk-addcard'), on=B.has(id); b.classList.toggle('is-in',on); b.textContent=on?'In basket':'Add to basket'; });
    document.querySelectorAll('[data-kk-fav]').forEach(function(b){ var on=B.isFav(b.getAttribute('data-kk-fav')); b.classList.toggle('on',on); b.setAttribute('aria-pressed',on); b.setAttribute('aria-label',on?'Remove from favourites':'Save to favourites'); }); }
  B.paint = paint;

  function toast(msg){ if(window.ACCT&&window.ACCT.toast) return window.ACCT.toast(msg); }

  function onDrawer(e){ var t=e.target;
    if (t.closest('[data-kk-close]')) return close();
    var tb=t.closest('[data-tab]'); if(tb){ tab=tb.getAttribute('data-tab'); return paint(); }
    var a=t.closest('[data-kk-add]'); if(a){ B.addPiece(a.getAttribute('data-kk-add')); return; }
    var r=t.closest('[data-kk-rm]'); if(r){ B.remove(r.getAttribute('data-kk-rm')); return; }
    var u=t.closest('[data-kk-unfav]'); if(u){ B.toggleFav(u.getAttribute('data-kk-unfav')); return; }
    if (t.closest('[data-kk-pts]')) { state.usePts=t.checked; return paint(); }
    if (t.closest('[data-kk-gc]')) return applyGift(); }

  function applyGift(){ var inp=document.getElementById('kk-gc-in'), msg=document.getElementById('kk-gc-msg'); var code=(inp.value||'').trim().toUpperCase();
    if(!code){ state.gift=null; state.gcMsg=null; return paint(); }
    var c=sb(); if(!c){ msg.textContent='Could not check codes right now. Add the code in your WhatsApp message instead.'; return; }
    msg.textContent='Checking…';
    c.rpc('check_gift_card',{p_code:code}).then(function(r){
      if(r.error||r.data==null){ state.gift=null; state.giftBal=0; state.gcMsg='That code isn’t valid or has no balance left.'; paint(); var i=document.getElementById('kk-gc-in'); if(i) i.value=code; return; }
      state.gcMsg=null; state.gift=code; state.giftBal=+r.data; paint(); }); }

  // product-card buttons (delegated)
  document.addEventListener('click', function(e){
    var a=e.target.closest('[data-kk-addcard]'); if(a){ e.preventDefault(); var id=a.getAttribute('data-kk-addcard');
      if(B.addPiece(id)){ toast('Added to your basket'); open('bag'); } else open('bag'); return; }
    var f=e.target.closest('[data-kk-fav]'); if(f){ e.preventDefault(); var on=B.toggleFav(f.getAttribute('data-kk-fav')); toast(on?'Saved to favourites':'Removed from favourites'); }
  });
  window.addEventListener('storage', function(e){ if(e.key===BK||e.key===FV) paint(); });

  // ---------- Reviews ----------
  var RV = window.KK_REVIEWS = { all:null };
  function stars(n){ var s=''; for(var i=1;i<=5;i++) s+='<i class="'+(i<=Math.round(n)?'on':'')+'">★</i>'; return '<span class="kk-stars" aria-label="'+(Math.round(n*10)/10)+' out of 5">'+s+'</span>'; }
  RV.load = function(){ if (RV.p) return RV.p; var c=sb(); if(!c) return Promise.resolve([]);
    RV.p = c.from('product_reviews').select('product_id,name,rating,body,created_at').order('created_at',{ascending:false}).limit(1000)
      .then(function(r){ RV.all = r.data||[]; return RV.all; }, function(){ RV.all=[]; return []; }); return RV.p; };
  RV.paintCards = function(){ RV.load().then(function(all){ document.querySelectorAll('[data-kk-rating]').forEach(function(el){ var id=el.getAttribute('data-kk-rating');
    var mine=all.filter(function(x){return x.product_id===id}); if(!mine.length){ el.innerHTML=''; return; }
    var avg=mine.reduce(function(s,x){return s+x.rating},0)/mine.length; el.innerHTML=stars(avg)+'<span class="kk-rc">('+mine.length+')</span>'; }); }); };
  RV.mountPiece = function(pid){ var root=document.getElementById('piece-root'); var det=root&&root.querySelector('.detail'); if(!det||document.getElementById('kk-reviews')) return;
    var sec=document.createElement('section'); sec.id='kk-reviews'; sec.className='kk-reviews';
    det.parentNode.insertBefore(sec, det.nextSibling);
    function draw(){ var mine=(RV.all||[]).filter(function(x){return x.product_id===pid}); var avg=mine.length?mine.reduce(function(s,x){return s+x.rating},0)/mine.length:0;
      sec.innerHTML='<div class="kk-rv-head"><div class="eyebrow-script">Reviews</div><h2 class="display-title">What she said</h2>'+(mine.length?'<p class="kk-rv-sum">'+stars(avg)+' <span>'+avg.toFixed(1)+' · '+mine.length+' review'+(mine.length>1?'s':'')+'</span></p>':'<p class="kk-rv-sum kk-muted">Be the first to review this piece.</p>')+'</div>'+
        '<div class="kk-rv-grid"><div class="kk-rv-list">'+(mine.length?mine.map(function(r){return '<article>'+stars(r.rating)+'<p>'+esc(r.body)+'</p><span>'+esc(r.name)+' · '+new Date(r.created_at).toLocaleDateString('en-GB',{month:'short',year:'numeric'})+'</span></article>'}).join(''):'<p class="kk-muted">No reviews yet.</p>')+'</div>'+
        '<form class="kk-rv-form" id="kk-rv-form"><h3>Write a review</h3><div class="kk-star-in" role="radiogroup" aria-label="Your rating">'+[1,2,3,4,5].map(function(i){return '<button type="button" data-r="'+i+'" aria-label="'+i+' star'+(i>1?'s':'')+'">★</button>'}).join('')+'</div>'+
        '<input name="name" maxlength="60" placeholder="Your name" required><textarea name="body" maxlength="1000" rows="3" placeholder="How did it fit and feel?" required></textarea>'+
        '<button class="kk-btn kk-btn-dark" type="submit">Submit review</button><p class="kk-note" id="kk-rv-msg">Reviews appear after a quick check by the shop.</p></form></div>'; 
      var f=sec.querySelector('form'), rating=0;
      f.querySelectorAll('[data-r]').forEach(function(b){ b.onclick=function(){ rating=+b.getAttribute('data-r'); f.querySelectorAll('[data-r]').forEach(function(x){x.classList.toggle('on',+x.getAttribute('data-r')<=rating)}); }; });
      if (window.ACCT&&window.ACCT.user()){ var md=window.ACCT.user().user_metadata||{}; if(md.full_name) f.name.value=md.full_name; }
      f.onsubmit=function(e){ e.preventDefault(); var m=document.getElementById('kk-rv-msg');
        if(!rating){ m.textContent='Please choose a star rating.'; return; }
        var c=sb(); if(!c){ m.textContent='Reviews are unavailable right now.'; return; }
        m.textContent='Sending…';
        c.from('product_reviews').insert({product_id:pid,name:f.name.value.trim().slice(0,60),rating:rating,body:f.body.value.trim().slice(0,1000),approved:false}).then(function(r){
          if(r.error){ m.textContent='Sorry, that didn’t send. Please try again.'; return; }
          f.reset(); rating=0; f.querySelectorAll('[data-r]').forEach(function(x){x.classList.remove('on')}); m.textContent='Thank you. Your review will appear once the shop approves it.'; }); }; }
    RV.load().then(draw); };

  function piecePage(){ if(!/piece(\.html)?$/.test(location.pathname)) return; var pid=new URLSearchParams(location.search).get('id')||'KK-001';
    var t=setInterval(function(){ var act=document.querySelector('.detail-actions'); if(!act) return; clearInterval(t);
      var p=window.getProduct&&window.getProduct(pid); if(p&&p.available!==false&&!document.getElementById('kk-piece-add')){ var b=document.createElement('button'); b.type='button'; b.id='kk-piece-add'; b.className='kk-btn kk-btn-dark btn-lg'; b.setAttribute('data-kk-addcard',pid); b.textContent='Add to basket'; act.insertBefore(b, act.firstChild); paint(); }
      RV.mountPiece(pid); },150); setTimeout(function(){clearInterval(t)},15000); }
  function init(){ mountHeader(); paint(); piecePage(); if (window.KETRAS_CATALOG_READY) window.KETRAS_CATALOG_READY.then(function(){ paint(); setTimeout(function(){paint(); RV.paintCards();},50); }); }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
