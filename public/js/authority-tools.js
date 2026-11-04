(function(){
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var FALLBACK=['Road & Infrastructure','Water & Drainage','Electricity','Waste Management','Public Safety','Environment','Education','Healthcare','Public Transport','Other'];
  var REPLIES=[
    ['🔁','Already received','Rejected','Thank you for reporting. This issue has already been reported and is being handled under an earlier report. Please follow that report for updates.'],
    ['🚫','Report looks fake','Rejected','After review, we could not verify this report. It appears to be inaccurate or not genuine, so it is being closed. If you believe this is a mistake, please resubmit with clear photos and an exact location.'],
    ['⏸️','Cannot work now','On Hold','Thank you for reporting. We cannot start work on this right now because other urgent work is ongoing in this area. It is on hold and will be taken up as soon as possible.'],
    ['🔍','Needs site visit','Under Assessment','Your report has been received. Our team will visit the location shortly to inspect and assess the issue.'],
    ['📞','Need more info','On Hold','We need a little more information (clearer photos or exact location) to proceed. Please add a comment with the details.'],
    ['🏛️','Other department','Acknowledged','This issue falls under another department. We have forwarded it to the concerned authority for action.'],
    ['🗓️','Work scheduled','Action Planned','Your report is verified. The repair work has been scheduled and will start soon.'],
    ['⛈️','Weather delay','On Hold','Work is currently delayed due to weather conditions. It will resume once conditions improve.'],
    ['✅','Resolved','Completed','The issue has been fixed. Thank you for reporting. Please share your feedback on the resolution.']
  ];
  function reportTools(){
    var sel=document.getElementById('updateStatus');
    if(!sel||document.getElementById('authTools'))return;
    var card=sel.closest('.card');if(!card)return;
    var btn=card.querySelector('button[onclick^="updateStatusNow"]');
    var m=btn&&btn.getAttribute('onclick').match(/'([^']+)'/);if(!m)return;
    var box=document.createElement('div');box.id='authTools';
    box.innerHTML='<div class="at-label">📍 PINNED LOCATION</div><div id="authMap" class="at-map"><p class="form-hint" style="padding:20px">Loading map…</p></div><div class="at-label" style="margin-top:22px">⚡ QUICK RESPONSE <small>(click to fill status &amp; reply — you can edit before updating)</small></div><div class="at-chips">'+REPLIES.map(function(r,i){return '<button type="button" class="at-chip" data-i="'+i+'"><span>'+r[0]+'</span>'+esc(r[1])+'</button>'}).join('')+'</div>';
    card.insertBefore(box,card.firstChild);
    box.querySelector('.at-chips').addEventListener('click',function(e){
      var c=e.target.closest('.at-chip');if(!c)return;var r=REPLIES[+c.dataset.i];
      var s=document.getElementById('updateStatus'),t=document.getElementById('authorityResponse');
      s.value=r[2];t.value=r[3];
      box.querySelectorAll('.at-chip').forEach(function(x){x.classList.remove('on')});c.classList.add('on');
      [s,t].forEach(function(el){el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')});
    });
    fetch('/api/reports/'+m[1]).then(function(r){return r.json()}).then(function(r){
      var el=document.getElementById('authMap');if(!el)return;
      var loc=r&&r.location;
      if(!loc||!loc.lat||!loc.lng||typeof L==='undefined'){el.innerHTML='<p class="form-hint" style="padding:20px">No pinned location was added to this report.</p>';return;}
      el.innerHTML='';var map=L.map(el).setView([loc.lat,loc.lng],15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
      L.marker([loc.lat,loc.lng]).addTo(map).bindPopup('<b>'+esc(r.title)+'</b>').openPopup();
      setTimeout(function(){map.invalidateSize()},300);
    }).catch(function(){var el=document.getElementById('authMap');if(el)el.innerHTML='<p class="form-hint" style="padding:20px">Could not load the map.</p>'});
  }
  function deptChips(){
    var inp=document.getElementById('regDept');
    if(!inp||document.getElementById('deptChips'))return;
    var wrap=document.createElement('div');wrap.id='deptChips';wrap.className='at-chips dept';
    inp.insertAdjacentElement('afterend',wrap);
    var draw=function(list){wrap.innerHTML=list.map(function(n){return '<button type="button" class="at-chip" data-n="'+esc(n)+'">'+esc(n)+'</button>'}).join('')};
    draw(FALLBACK);
    fetch('/api/admin/categories').then(function(r){return r.json()}).then(function(c){if(Array.isArray(c)&&c.length)draw(c.map(function(x){return x.name}))}).catch(function(){});
    var mark=function(){wrap.querySelectorAll('.at-chip').forEach(function(x){x.classList.toggle('on',x.dataset.n===inp.value.trim())})};
    wrap.addEventListener('click',function(e){var c=e.target.closest('.at-chip');if(!c)return;inp.value=c.dataset.n;mark();});
    inp.addEventListener('input',mark);
  }
  setInterval(function(){reportTools();deptChips();},400);
})();
