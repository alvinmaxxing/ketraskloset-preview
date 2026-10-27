// Jewellery launch waitlist: insert-only into public.waitlist (drop_name='Jewellery') with the publishable key.
(function(){
  var f=document.getElementById('jw-form'),m=document.getElementById('jw-msg');if(!f)return;
  var A=window.SHOP_AUTH||{};
  function say(t,err){m.textContent=t;m.className='jw-msg'+(err?' err':'')}
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var email=(f.email.value||'').trim().toLowerCase(),b=f.querySelector('button');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>200){say('Please enter a valid email address.',true);return}
    b.disabled=true;b.textContent='Saving…';
    fetch(A.url+'/rest/v1/waitlist',{method:'POST',headers:{apikey:A.key,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify({name:'Jewellery launch',contact:email,drop_name:'Jewellery'})})
    .then(function(r){
      if(r.ok){say('Thank you! You’re on the list. We’ll email you the moment Ketra Jewellery launches. ✦');f.reset()}
      else if(r.status===409){say('You’re already on the list with that email. We’ll be in touch at launch. ✦')}
      else{say('Sorry, something went wrong. Please try again or message us on WhatsApp.',true)}
    }).catch(function(){say('Connection problem. Please try again.',true)})
    .finally(function(){b.disabled=false;b.textContent='Notify me'});
  });
})();
