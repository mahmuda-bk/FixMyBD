(function(){
  var COL={'Submitted':'#8a9a92','Acknowledged':'#3D7BFF','Under Assessment':'#FFC300','Action Planned':'#7C3AED','In Progress':'#00C2A8','Completed':'#0FA958','Citizen Feedback':'#FF4FA3','On Hold':'#8a858f','Rejected':'#06231A','Reopened':'#FF7A00'};
  var BANNER={reports:'paddy','my-reports':'rickshaw',profile:'paddy',authority:'minar',admin:'skyline',notifications:'paddy','create-report':'rickshaw',dashboard:'skyline','report-detail':'minar'};
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var ICON={road:'🛣️',water:'💧',electric:'⚡',waste:'🗑️',safety:'🚨',environment:'🌳',education:'🎓',health:'🏥',transport:'🚌',other:'📌'};

  // ---- hook renderPage: add dashboard page + per-page theme/banner ----
  var _r=window.renderPage;
  window.renderPage=async function(page,data){
    var app=document.getElementById('app');app.dataset.page=page;
    if(page==='dashboard'){
      app.classList.remove('page-enter');void app.offsetWidth;app.classList.add('page-enter');
      app.innerHTML='<div class="container"><div class="page-header"><div><h1>Dashboard</h1></div><span class="section-no" style="font-family:var(--font-mono);color:var(--red);font-weight:600;letter-spacing:.2em">OVERVIEW / INSIGHTS</span></div><div id="dashRoot"><div class="empty-state"><span class="icon">⏳</span><p>Loading…</p></div></div></div>';
      if(typeof updateNav==='function')updateNav();
      await loadDash();banner(page);return;
    }
    var r=await _r.apply(this,arguments);banner(page);return r;
  };
  function banner(page){
    var a=document.getElementById('app');if(!a||!BANNER[page])return;
    var h=a.querySelector('.page-header');if(!h||a.querySelector('.pg-banner'))return;
    var b=document.createElement('div');b.className='pg-banner';b.style.backgroundImage='url(/img/'+BANNER[page]+'.svg)';h.insertAdjacentElement('afterend',b);
  }

  // ---- dashboard ----
  async function loadDash(){
    var u=window.currentUser,root=document.getElementById('dashRoot');
    if(!u){root.innerHTML='<div class="empty-state"><span class="icon">🔒</span><h3>Login required</h3><button class="btn btn-primary" onclick="navigate(\'login\')">Login</button></div>';return;}
    try { var freshUser = await API.get('/api/auth/me'); if (freshUser) { u=freshUser; window.currentUser=u; } } catch(e) {}
    var role=u.role,reports=[],extra={};
    try{
      if(role==='admin'){var s=await API.get('/api/admin/dashboard');extra=s||{};reports=(s&&s.recentReports)||[];}
      else if(role==='authority'){reports=(await API.get('/api/reports/authority'))||[];}
      else{reports=(await API.get('/api/reports/my'))||[];}
    }catch(e){}
    if(!Array.isArray(reports))reports=[];
    var by={};reports.forEach(function(r){by[r.status]=(by[r.status]||0)+1});
    if(role==='admin'&&extra.byStatus){by={};extra.byStatus.forEach(function(x){by[x._id]=x.count});}
    var total=role==='admin'?extra.totalReports:reports.length;
    var done=by['Completed']||0,prog=(by['In Progress']||0)+(by['Under Assessment']||0)+(by['Action Planned']||0),pend=(by['Submitted']||0)+(by['Acknowledged']||0);
    var cards=[['📋',role==='admin'?'Total Reports':role==='authority'?'Department Reports':'My Reports',total||0,'g'],['⏳','Pending',pend,'o'],['🛠️','In Progress',prog,'b'],['✅','Resolved',done,'g']];
    if(role==='admin')cards[1]=['👥','Users',extra.totalUsers||0,'o'],cards[2]=['🚩','Flagged',extra.flaggedReports||0,'r'];
    var tag={citizen:'CITIZEN',authority:'AUTHORITY',admin:'ADMIN'}[role]||'USER';
    var sum=Object.keys(by).reduce(function(a,k){return a+by[k]},0)||1,acc=0;
    var grad=Object.keys(by).map(function(k){var s=acc/sum*100;acc+=by[k];return (COL[k]||'#999')+' '+s+'% '+(acc/sum*100)+'%'}).join(',')||'#ddd 0 100%';
    var legend=Object.keys(by).map(function(k){return '<div class="lg"><i style="background:'+(COL[k]||'#999')+'"></i><span>'+esc(k)+'</span><b>'+by[k]+'</b></div>'}).join('')||'<p class="form-hint">No data yet</p>';
    var open=reports.filter(function(r){return r.status!=='Completed'&&r.status!=='Rejected'});
    var pri=open.slice().sort(function(a,b){return (b.supportCount||0)-(a.supportCount||0)}).slice(0,4);
    var recent=reports.slice().sort(function(a,b){return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)}).slice(0,5);
    var act={citizen:'<button class="btn btn-primary btn-sm" onclick="navigate(\'create-report\')">＋ New Report</button> <button class="btn btn-outline btn-sm" onclick="navigate(\'my-reports\')">My Reports</button>',authority:'<button class="btn btn-primary btn-sm" onclick="navigate(\'authority\')">Open Department Desk</button>',admin:'<button class="btn btn-primary btn-sm" onclick="navigate(\'admin\')">Admin Panel</button> <button class="btn btn-outline btn-sm" onclick="navigate(\'admin-reports\')">Manage Reports</button> <button class="btn btn-outline btn-sm" onclick="navigate(\'admin-users\')">Users</button>'}[role]||'';
    window.__dashRows=reports;
    root.innerHTML='<div class="dash dash-'+role+'"><div class="dash-hello"><div class="dash-identity">'+(role==='authority'&&u.avatar?'<img class="dash-profile-photo" src="'+esc(u.avatar)+'" alt="Authority profile picture" onerror="this.style.display=\'none\'">':'')+'<div><span class="dash-tag">'+tag+' DASHBOARD</span><h2>Welcome, '+esc(u.name)+'</h2><p>'+(role==='authority'?'Here are the reports for your registered department.':'Here is the latest snapshot of issues across your workspace.')+'</p></div></div><div class="dash-actions">'+act+'</div></div>'+
    '<div class="grid grid-4 dash-cards stagger">'+cards.map(function(c){return '<div class="dcard '+c[3]+'"><span class="di">'+c[0]+'</span><div><b data-counter="'+c[2]+'">0</b><small>'+c[1]+'</small></div></div>'}).join('')+'</div>'+
    '<div class="dash-grid"><div class="card dpanel"><div class="card-header"><span class="card-title">Status Distribution</span></div><div class="donut-wrap"><div class="donut" style="background:conic-gradient('+grad+')"><span>'+(role==='admin'?total:reports.length)+'<small>reports</small></span></div><div class="legend">'+legend+'</div></div>'+
    '<div class="bars">'+Object.keys(by).map(function(k){return '<div class="bar"><span>'+esc(k)+'</span><div><i style="width:'+Math.round(by[k]/sum*100)+'%;background:'+(COL[k]||'#999')+'"></i></div></div>'}).join('')+'</div></div>'+
    '<div class="card dpanel"><div class="card-header"><span class="card-title">🔥 Priority Issues</span></div>'+(pri.length?pri.map(function(r){return '<div class="prio" onclick="navigate(\'report-detail\',\''+r._id+'\')"><div><b>'+esc(r.title)+'</b><small>'+esc(r.status)+'</small></div><span class="pcount">👍 '+(r.supportCount||0)+'</span></div>'}).join(''):'<p class="form-hint">No open priority issues 🎉</p>')+'</div>'+
    '<div class="card dpanel"><div class="card-header"><span class="card-title">Recent Activity</span></div><div class="timeline">'+(recent.length?recent.map(function(r){return '<div class="timeline-item'+(r.status==='Completed'?' completed':'')+'"><div class="timeline-date">'+new Date(r.updatedAt||r.createdAt).toLocaleDateString()+'</div><div class="timeline-content">'+esc(r.title)+'</div><div class="timeline-note">'+esc(r.status)+'</div></div>'}).join(''):'<p class="form-hint">No activity yet</p>')+'</div></div></div>'+
    '<div class="card dpanel dtable"><div class="card-header"><span class="card-title">Reports</span><input id="dashQ" class="form-control" placeholder="🔍 Search reports…" style="max-width:280px;padding:10px 14px"></div><div class="table-container"><table><thead><tr><th>Title</th><th>Status</th><th>Supports</th><th>Date</th><th>Action</th></tr></thead><tbody id="dashRows"></tbody></table></div></div></div>';
    var draw=function(q){q=(q||'').toLowerCase();document.getElementById('dashRows').innerHTML=reports.filter(function(r){return (r.title||'').toLowerCase().indexOf(q)>-1||(r.status||'').toLowerCase().indexOf(q)>-1}).map(function(r){return '<tr><td><b>'+esc(r.title)+'</b></td><td><span class="badge" style="background:'+(COL[r.status]||'#999')+';color:#fff">'+esc(r.status)+'</span></td><td>'+(r.supportCount||0)+'</td><td>'+new Date(r.createdAt).toLocaleDateString()+'</td><td><button class="btn btn-sm btn-primary" onclick="navigate(\'report-detail\',\''+r._id+'\')">'+(role==='citizen'?'View':'Open')+'</button></td></tr>'}).join('')||'<tr><td colspan="5" style="text-align:center">No reports found</td></tr>'};
    draw('');document.getElementById('dashQ').addEventListener('input',function(e){draw(e.target.value)});
    if(window.__rearm)window.__rearm();
  }

  // ---- hidden-until-login smart nav pill + category emoji ----
  setInterval(function(){
    var n=document.getElementById('navDash');if(n)n.style.display=window.currentUser?'inline-flex':'none';
    document.querySelectorAll('#homeCategories .feature-card:not([data-ic])').forEach(function(c){
      c.dataset.ic='1';var t=(c.querySelector('h3')||{}).textContent||'';t=t.toLowerCase();var k=Object.keys(ICON).find(function(x){return t.indexOf(x)>-1})||'other';
      var s=document.createElement('span');s.className='cat-ic';s.textContent=ICON[k];c.insertBefore(s,c.firstChild.nextSibling);
    });
  },400);
})();
