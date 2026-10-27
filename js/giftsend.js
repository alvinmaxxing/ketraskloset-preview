// Gift card sender: mailto, PNG download, print, optional server email (send-gift-card Edge Function, off until enabled).
(function(){
  var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  window.GiftSend={EMAIL_RE:EMAIL_RE, init:function(o){
    var root=document.getElementById(o.mount); if(!root) return;
    var last=o.prefill?o.prefill():{}; last=last||{};
    root.innerHTML='<h2 class="gs-h">Send your gift card</h2><p class="gs-p">Once you have your code from us, email it to her or download a card to attach.</p>'+
     '<form class="gs-form" novalidate>'+
     '<label for="gs-code">Gift code</label><input id="gs-code" autocomplete="off" placeholder="'+esc(o.codePh)+'" value="">'+
     '<label for="gs-amt">Amount</label><input id="gs-amt" type="number" min="1" value="'+esc(last.amount||'')+'">'+
     '<label for="gs-to">Recipient name</label><input id="gs-to" maxlength="60" value="'+esc(last.to||'')+'">'+
     '<label for="gs-email">Recipient email</label><input id="gs-email" type="email" maxlength="120" value="'+esc(last.toEmail||'')+'">'+
     '<label for="gs-from">From</label><input id="gs-from" maxlength="60" value="'+esc(last.from||'')+'">'+
     '<label for="gs-msg">Message</label><textarea id="gs-msg" rows="3" maxlength="200">'+esc(last.msg||'')+'</textarea>'+
     '<p class="gs-err" id="gs-err" role="alert"></p>'+
     '<div class="gs-acts"><a class="gs-btn gs-dark" id="gs-mail" href="#">Email this gift card</a><button type="button" class="gs-btn" id="gs-png">Download card (PNG)</button><button type="button" class="gs-btn" id="gs-print">Print</button>'+
     (o.serverEnabled?'<button type="button" class="gs-btn" id="gs-send">Send it for me</button>':'')+'</div>'+
     '<p class="gs-note">'+(o.serverEnabled?'“Send it for me” emails her directly from '+esc(o.shop)+'.':'“Email this gift card” opens your own email app with everything filled in. Automatic sending from '+esc(o.shop)+' is coming soon.')+'</p></form>';
    function v(id){return document.getElementById(id).value.trim()}
    function data(){return {code:v('gs-code').toUpperCase(),amount:+v('gs-amt')||0,to:v('gs-to'),email:v('gs-email'),from:v('gs-from'),msg:v('gs-msg')}}
    function err(t){document.getElementById('gs-err').textContent=t||''}
    function check(needCode){var d=data();
      if(!EMAIL_RE.test(d.email)) return err('Enter a valid recipient email.'),null;
      if(needCode&&!o.codeRe.test(d.code)) return err('Enter the gift code we sent you ('+o.codePh+').'),null;
      if(d.code&&!o.codeRe.test(d.code)) return err('That code doesn’t look right ('+o.codePh+').'),null;
      err(''); return d;}
    function body(d){var b=(d.to?'Dear '+d.to+',\n\n':'')+(d.msg?d.msg+'\n\n':'')+'You have a '+o.fmt(d.amount)+' gift card for '+o.shop+'.\n';
      b+= d.code ? 'Your code: '+d.code+'\nEnter it in your '+o.bagWord+' at '+o.url+'\n' : 'Your gift code will follow from '+o.shop+'.\nShop at '+o.url+'\n';
      return b+'\n'+(d.from?'With love,\n'+d.from:'');}
    function mailHref(d){return 'mailto:'+encodeURIComponent(d.email).replace(/%40/g,'@')+'?subject='+encodeURIComponent('A gift from '+o.shop)+'&body='+encodeURIComponent(body(d));}
    function upd(){var d=data(),a=document.getElementById('gs-mail'); a.href=EMAIL_RE.test(d.email)?mailHref(d):'#';}
    root.addEventListener('input',upd); upd();
    document.getElementById('gs-mail').addEventListener('click',function(e){var d=check(false); if(!d){e.preventDefault();return} this.href=mailHref(d);});
    function card(){var d=data(),c=document.createElement('canvas'),W=1200,H=720;c.width=W;c.height=H;var x=c.getContext('2d'),t=o.theme;
      x.fillStyle=t.bg;x.fillRect(0,0,W,H);x.strokeStyle=t.line;x.lineWidth=2;x.strokeRect(36,36,W-72,H-72);x.lineWidth=1;x.strokeRect(48,48,W-96,H-96);
      x.fillStyle=t.line;x.textAlign='center';x.font='500 22px '+t.sans;x.fillText((o.shop+' · GIFT CARD').toUpperCase().split('').join(String.fromCharCode(8202)),W/2,130);
      x.fillStyle=t.ink;x.font='italic 400 64px '+t.serif;x.fillText(d.to?'For '+d.to:'For someone adored',W/2,290);
      x.fillStyle=t.accent;x.font='400 96px '+t.serif;x.fillText(o.fmt(d.amount||0),W/2,420);
      x.fillStyle=t.ink;x.font='500 30px '+t.sans;x.fillText(d.code?('CODE  '+d.code):'Code to follow',W/2,500);
      if(d.msg){x.font='italic 26px '+t.serif;x.fillStyle=t.muted;x.fillText('“'+d.msg.slice(0,80)+'”',W/2,570)}
      x.fillStyle=t.muted;x.font='400 20px '+t.sans;x.fillText((d.from?'From '+d.from+'  ·  ':'')+o.url.replace(/^https?:\/\//,''),W/2,640);return c;}
    document.getElementById('gs-png').addEventListener('click',function(){var a=document.createElement('a');a.download=o.slug+'-gift-card.png';a.href=card().toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();});
    document.getElementById('gs-print').addEventListener('click',function(){var w=window.open('','_blank');if(!w)return;w.document.write('<title>'+esc(o.shop)+' gift card</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh}img{width:90%;max-width:900px}</style><img src="'+card().toDataURL('image/png')+'" onload="setTimeout(function(){print()},200)">');w.document.close();});
    var s=document.getElementById('gs-send'); if(s) s.addEventListener('click',function(){var d=check(true); if(!d) return; s.disabled=true; s.textContent='Sending…';
      fetch(o.fnUrl,{method:'POST',headers:{'Content-Type':'application/json','apikey':o.anonKey,'Authorization':'Bearer '+o.anonKey},body:JSON.stringify({code:d.code,recipient_email:d.email,recipient_name:d.to,from_name:d.from,message:d.msg})})
       .then(function(r){return r.json().then(function(j){if(!r.ok) throw new Error(j.error||'failed'); s.textContent='Sent ✓'; err('');})})
       .catch(function(){s.disabled=false; s.textContent='Send it for me'; err('We couldn’t send it automatically. Use “Email this gift card” instead.');});});
  }};
})();
