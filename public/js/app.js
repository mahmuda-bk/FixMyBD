window.currentUser = null;
let currentUser = window.currentUser;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    navigate(hash);
  } else {
    renderPage('home');
  }
});

async function checkAuth() {
  const res = await fetch('/api/auth/me');
  if (res.status === 200) {
    currentUser = await res.json();
    window.currentUser = currentUser;
  }
  updateNav();
}

function updateNav() {
  const guest = document.getElementById('guestMenu');
  const user = document.getElementById('userMenu');
  const notif = document.getElementById('notifBell');
  const navTrack = document.getElementById('navTrack');
  const navAuthority = document.getElementById('navAuthority');
  const navAdmin = document.getElementById('navAdmin');
  const navProfile = document.getElementById('navProfile');

  if (currentUser) {
    guest.style.display = 'none';
    user.style.display = 'flex';
    notif.style.display = 'block';
    document.getElementById('userName').textContent = `👤 ${currentUser.name}`;
    navTrack.style.display = 'block';
    if (navProfile) navProfile.style.display = 'block';
    if (currentUser.role === 'authority' || currentUser.role === 'admin') navAuthority.style.display = 'block';
    if (currentUser.role === 'admin') navAdmin.style.display = 'block';
    loadNotifCount();
  } else {
    guest.style.display = 'flex';
    user.style.display = 'none';
    notif.style.display = 'none';
    navTrack.style.display = 'none';
    navAuthority.style.display = 'none';
    navAdmin.style.display = 'none';
    if (navProfile) navProfile.style.display = 'none';
  }
}

async function loadNotifCount() {
  const data = await API.get('/api/notifications/unread');
  const el = document.getElementById('notifCount');
  if (el && data) { el.textContent = data.count; el.style.display = data.count > 0 ? 'block' : 'none'; }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
  fetch('/api/auth/logout').then(() => {
    window.location.hash = '';
    currentUser = null;
    window.currentUser = null;
    updateNav();
    navigate('home');
    showToast('Logged out');
  });
}

async function handleLogin(e) {
  e.preventDefault();
  try {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const data = await API.post('/api/auth/login', { email, password });
    currentUser = data.user;
    window.currentUser = currentUser;
    updateNav();
    showToast('Login successful');
    navigate('home');
  } catch (err) { showToast(err.message, 'error'); }
}

async function handleRegister(e) {
  e.preventDefault();
  try {
    const role = document.getElementById('regRole').value;
    const nid = document.getElementById('regNationalId').value.trim();
    if (!/^\d{13}$/.test(nid)) { showToast('National ID must be exactly 13 digits', 'error'); return; }
    const formData = new FormData();
    formData.append('name', document.getElementById('regName').value);
    formData.append('email', document.getElementById('regEmail').value);
    formData.append('password', document.getElementById('regPassword').value);
    formData.append('phone', document.getElementById('regPhone').value);
    formData.append('role', role);
    formData.append('nationalId', nid);
    if (role === 'authority') {
      formData.append('authorityDept', document.getElementById('regDept').value);
      const photo = document.getElementById('regAvatar').files[0];
      if (!photo) { showToast('Please upload your authority profile picture', 'error'); return; }
      formData.append('avatar', photo);
    }
    const res = await API.postForm('/api/auth/register', formData);
    currentUser = res.user; window.currentUser = currentUser; updateNav();
    showToast('Registration successful'); navigate('home');
  } catch (err) { showToast(err.message, 'error'); }
}

async function handleCreateReport(e) {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append('title', document.getElementById('reportTitle').value);
    formData.append('description', document.getElementById('reportDesc').value);
    formData.append('category', document.getElementById('reportCategory').value);
    const lat = document.getElementById('reportLat').value;
    const lng = document.getElementById('reportLng').value;
    formData.append('division', document.getElementById('reportDivision').value);
    formData.append('district', document.getElementById('reportDistrict').value);
    formData.append('upazila', document.getElementById('reportUpazila').value);
    formData.append('address', document.getElementById('reportAddress').value);
    if (lat && lng) {
      formData.append('lat', lat);
      formData.append('lng', lng);
    }
    const photos = Array.from(document.getElementById('reportPhoto').files || []).slice(0, 5);
    photos.forEach(photo => formData.append('photos', photo));

    await API.postForm('/api/reports', formData);
    showToast('Report submitted successfully!');
    navigate('my-reports');
  } catch (err) { showToast(err.message, 'error'); }
}

let reportPage = 1;
let reportSearchTimer = null;

async function loadReports(page = 1) {
  const el = document.getElementById('reportsContent');
  if (!el) return;
  reportPage = page;
  const categories = await API.get('/api/admin/categories');
  const divisions = await API.get('/api/admin/locations?type=division');
  const params = new URLSearchParams({ page: reportPage, limit: 12 });
  const q = document.getElementById('reportSearch')?.value?.trim() || '';
  const status = document.getElementById('reportStatusFilter')?.value || '';
  const category = document.getElementById('reportCategoryFilter')?.value || '';
  const division = document.getElementById('reportDivisionFilter')?.value || '';
  const district = document.getElementById('reportDistrictFilter')?.value || '';
  const upazila = document.getElementById('reportUpazilaFilter')?.value || '';
  const sort = document.getElementById('reportSortFilter')?.value || 'newest';
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (category) params.set('category', category);
  if (division) params.set('division', division);
  if (district) params.set('district', district);
  if (upazila) params.set('upazila', upazila);
  if (sort) params.set('sort', sort);

  if (!document.getElementById('reportSearch')) {
    el.innerHTML = `
      <div class="report-filter-panel card">
        <div class="report-search-row">
          <input id="reportSearch" type="search" class="form-control report-search" placeholder="Search reports by issue, location or category..." oninput="scheduleReportSearch()">
          <button class="btn btn-outline" onclick="resetReportFilters()">Reset</button>
        </div>
        <div class="filters report-filters">
          <select id="reportCategoryFilter" onchange="applyReportFilters()"><option value="">All Categories</option>${(categories || []).map(c => `<option value="${c._id}">${c.name}</option>`).join('')}</select>
          <select id="reportStatusFilter" onchange="applyReportFilters()"><option value="">All Status</option>${['Submitted','Acknowledged','Under Assessment','Action Planned','In Progress','Completed','Citizen Feedback','On Hold','Rejected','Reopened'].map(v => `<option>${v}</option>`).join('')}</select>
          <select id="reportDivisionFilter" onchange="loadReportFilterLocations('district', this.value)"><option value="">All Divisions</option>${(divisions || []).map(d => `<option value="${d.name}">${d.name}</option>`).join('')}</select>
          <select id="reportDistrictFilter" onchange="loadReportFilterLocations('upazila', this.value)"><option value="">All Districts</option></select>
          <select id="reportUpazilaFilter" onchange="applyReportFilters()"><option value="">All Upazilas</option></select>
          <select id="reportSortFilter" onchange="applyReportFilters()">
            <option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="supported">Most Supported</option><option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>
      <div id="reportResults"></div>`;
  }

  const data = await API.get(`/api/reports?${params.toString()}`);
  const results = document.getElementById('reportResults');
  if (!results || !data) return;
  if (!data.reports || data.reports.length === 0) {
    results.innerHTML = `<div class="empty-state"><div class="icon">🔎</div><h3>No matching reports</h3><p>Try a different keyword, location or filter.</p></div>`;
    return;
  }
  results.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
      <span style="font-family:var(--font-mono);font-size:var(--fs-xs);font-weight:700;color:var(--ink-2)">${data.total} REPORT${data.total === 1 ? '' : 'S'} FOUND</span>
      <span style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--red)">PAGE ${data.page} / ${Math.max(data.pages,1)}</span>
    </div>
    <div class="grid grid-3 stagger" id="reportsGrid">${data.reports.map(r => renderReportCard(r)).join('')}</div>
    ${renderReportPagination(data.page, data.pages)}`;
}

function scheduleReportSearch() {
  clearTimeout(reportSearchTimer);
  reportSearchTimer = setTimeout(() => loadReports(1), 300);
}

function applyReportFilters() { loadReports(1); }

async function loadReportFilterLocations(type, parentName) {
  const districtSel = document.getElementById('reportDistrictFilter');
  const upaSel = document.getElementById('reportUpazilaFilter');
  if (!districtSel || !upaSel) return;
  if (type === 'district') {
    upaSel.innerHTML = '<option value="">All Upazilas</option>';
    if (!parentName) { districtSel.innerHTML = '<option value="">All Districts</option>'; applyReportFilters(); return; }
    districtSel.innerHTML = '<option value="">Loading...</option>';
    const parents = await API.get('/api/admin/locations?type=division');
    const parent = (parents || []).find(x => x.name === parentName);
    const locs = parent ? await API.get(`/api/admin/locations?type=district&parentId=${parent._id}`) : [];
    districtSel.innerHTML = '<option value="">All Districts</option>' + (locs || []).map(l => `<option value="${l.name}">${l.name}</option>`).join('');
  } else {
    if (!parentName) { upaSel.innerHTML = '<option value="">All Upazilas</option>'; applyReportFilters(); return; }
    upaSel.innerHTML = '<option value="">Loading...</option>';
    const parents = await API.get('/api/admin/locations?type=district');
    const parent = (parents || []).find(x => x.name === parentName);
    const locs = parent ? await API.get(`/api/admin/locations?type=upazila&parentId=${parent._id}`) : [];
    upaSel.innerHTML = '<option value="">All Upazilas</option>' + (locs || []).map(l => `<option value="${l.name}">${l.name}</option>`).join('');
  }
  applyReportFilters();
}

function resetReportFilters() {
  ['reportSearch','reportCategoryFilter','reportStatusFilter','reportDivisionFilter','reportDistrictFilter','reportUpazilaFilter'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
  const sort=document.getElementById('reportSortFilter'); if(sort) sort.value='newest';
  if(document.getElementById('reportDistrictFilter')) document.getElementById('reportDistrictFilter').innerHTML='<option value="">All Districts</option>';
  if(document.getElementById('reportUpazilaFilter')) document.getElementById('reportUpazilaFilter').innerHTML='<option value="">All Upazilas</option>';
  loadReports(1);
}

function renderReportPagination(page, pages) {
  if (!pages || pages <= 1) return '';
  let html = '<div class="pagination">';
  html += `<button class="btn btn-sm btn-outline" ${page <= 1 ? 'disabled' : ''} onclick="loadReports(${page-1})">← Previous</button>`;
  for (let i = Math.max(1, page-2); i <= Math.min(pages, page+2); i++) html += `<button class="page-number ${i===page?'active':''}" onclick="loadReports(${i})">${i}</button>`;
  html += `<button class="btn btn-sm btn-outline" ${page >= pages ? 'disabled' : ''} onclick="loadReports(${page+1})">Next →</button>`;
  return html + '</div>';
}

function filterReports(text) { scheduleReportSearch(); }
function filterByStatus(status) { applyReportFilters(); }

async function loadReportDetail(id) {
  const el = document.getElementById('reportDetail');
  const r = await API.get(`/api/reports/${id}`);
  const comments = await API.get(`/api/comments/${id}`);
  if (!el || !r) return;

  let authOptions = '<option value="">Select authority...</option><option value="" disabled>— none available —</option>';
  if (currentUser && currentUser.role === 'admin') {
    try {
      const d = await API.get('/api/admin/users?role=authority&limit=100');
      const auths = (d && d.users) ? d.users.filter(u => u.isActive) : [];
      authOptions = '<option value="">Select authority...</option>' +
        auths.map(a => `<option value="${a._id}" ${r.assignedAuthority && r.assignedAuthority._id === a._id ? 'selected' : ''}>${a.name}${a.authorityDept ? ' (' + a.authorityDept + ')' : ''}</option>`).join('') +
        (auths.length ? '' : '<option value="">— no authority accounts —</option>');
    } catch (e) { /* non-admin-safe */ }
  }

  const statusClass = getStatusClass(r.status);
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin:40px 0 24px">
      <button class="btn btn-sm btn-ghost" onclick="history.back()">← Back</button>
      <div style="height:2px;flex:1;background:var(--ink)"></div>
      <span class="section-no" style="font-family:var(--font-mono);color:var(--red);font-weight:600;letter-spacing:0.2em">REPORT / ${r._id.slice(-6).toUpperCase()}</span>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="background:var(--ink);color:var(--white);padding:36px 34px;border-bottom:4px solid var(--red)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap">
          <h1 style="font-family:var(--grotesk);font-size:clamp(1.8rem,4vw,3rem);font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:1;max-width:16ch">${r.title}</h1>
          <span class="badge ${statusClass}" style="font-size:0.75rem;background:var(--white)">${r.status}</span>
        </div>
        <div style="display:flex;gap:28px;flex-wrap:wrap;margin-top:28px;font-family:var(--font-mono);font-size:var(--fs-xs);color:rgba(255,255,255,0.7)">
          <span>CATEGORY / <b style="color:var(--white)">${r.category ? r.category.name : '-'}</b></span>
          <span>DISTRICT / <b style="color:var(--white)">${r.location ? r.location.district || r.location.division : '-'}</b></span>
          <span>SUPPORT / <b style="color:var(--white)">${r.supportCount || 0}</b></span>
        </div>
      </div>
      <div class="status-progress">
        ${['Submitted','Acknowledged','Under Assessment','Action Planned','In Progress','Completed'].map((st, i) => {
          const statuses = ['Submitted','Acknowledged','Under Assessment','Action Planned','In Progress','Completed'];
          const current = statuses.indexOf(r.status);
          const active = i <= current && current >= 0;
          return `<div class="status-step ${active ? 'active' : ''} ${r.status === st ? 'current' : ''}"><span>${active ? '✓' : i + 1}</span><small>${st}</small></div>`;
        }).join('')}
      </div>
      ${(r.photos && r.photos.length ? r.photos : (r.photo ? [r.photo] : [])).length ? `<div class="report-gallery">${(r.photos && r.photos.length ? r.photos : [r.photo]).map((photo, i) => `<img src="${photo}" alt="Report evidence ${i+1}" onclick="window.open('${photo}','_blank')">`).join('')}</div>` : ''}
      <div style="padding:30px 34px">
        <p style="font-size:var(--fs-md);line-height:1.6;margin-bottom:24px">${r.description}</p>
        <div class="grid grid-2" style="gap:0;border:2px solid var(--ink)">
          <div style="padding:20px;border-right:2px solid var(--ink)">
            <div style="font-family:var(--font-mono);font-size:var(--fs-xxs);letter-spacing:0.18em;color:var(--red);font-weight:600;margin-bottom:10px">DETAILS</div>
            <div class="kv"><span>Reported by</span><b>${r.reportedBy ? r.reportedBy.name : '-'}</b></div>
            <div class="kv"><span>Date</span><b>${new Date(r.createdAt).toLocaleDateString()}</b></div>
            <div class="kv"><span>Assigned to</span><b>${r.assignedAuthority ? r.assignedAuthority.name + (r.assignedAuthority.authorityDept ? ' (' + r.assignedAuthority.authorityDept + ')' : '') : 'Not yet assigned'}</b></div>
          </div>
          <div style="padding:20px">
            <div style="font-family:var(--font-mono);font-size:var(--fs-xxs);letter-spacing:0.18em;color:var(--red);font-weight:600;margin-bottom:10px">LOCATION</div>
            <div class="kv"><span>Hierarchy</span><b>${r.location ? `${r.location.division} → ${r.location.district}${r.location.upazila ? ' → ' + r.location.upazila : ''}` : '-'}</b></div>
            <div class="kv"><span>Address</span><b>${r.location && r.location.address ? r.location.address : '-'}</b></div>
          </div>
        </div>
        ${r.authorityResponse ? `<div class="authority-response"><div class="authority-response-label">🏛️ AUTHORITY RESPONSE</div><p>${r.authorityResponse}</p>${r.estimatedResolutionDate ? `<span>Estimated resolution: <b>${new Date(r.estimatedResolutionDate).toLocaleDateString()}</b></span>` : ''}</div>` : ''}
        <div style="margin-top:20px;display:flex;justify-content:flex-end">
          <button class="support-btn ${r.supports && currentUser && r.supports.includes(currentUser._id) ? 'active' : ''}" onclick="toggleSupport('${r._id}')">👍 Support ${r.supportCount || 0}</button>
        </div>
      </div>
    </div>

    <div class="section-head" style="margin-top:48px">
      <h2>Progress Timeline</h2><span class="section-no">STATUS / LOG</span>
    </div>
    <div class="card">
      ${r.timeline && r.timeline.length ? `
        <div class="timeline">
          ${r.timeline.map(t => `
            <div class="timeline-item ${t.status === 'Completed' ? 'completed' : ''}">
              <div class="timeline-date">${new Date(t.date).toLocaleString()}</div>
              <div class="timeline-content"><strong>${t.status}</strong> ${t.note ? '— ' + t.note : ''}</div>
              ${t.updatedBy ? `<div class="timeline-by">BY ${t.updatedBy.name || 'SYSTEM'}</div>` : ''}
            </div>`).join('')}
        </div>` : '<p style="color:var(--ink-2)">No timeline available yet</p>'}
    </div>

    ${r.status === 'Completed' && r.reportedBy && currentUser && r.reportedBy._id === currentUser._id && !r.citizenFeedback ? `
      <div class="section-head" style="margin-top:48px">
        <h2>Provide Feedback</h2><span class="section-no">FEEDBACK</span>
      </div>
      <div class="card">
        <form onsubmit="submitFeedback(event,'${r._id}')">
          <div class="form-group">
            <label>Rating</label>
            <select class="form-control" id="fbRating">
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Very Poor</option>
            </select>
          </div>
          <div class="form-group"><label>Comment</label><textarea class="form-control" id="fbComment"></textarea></div>
          <div class="form-group">
            <label>Is the issue resolved?</label>
            <select class="form-control" id="fbAccepted">
              <option value="true">Yes, resolved</option>
              <option value="false">No, still unresolved</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Submit Feedback</button>
        </form>
      </div>` : ''}

    ${r.citizenFeedback ? `
      <div class="section-head" style="margin-top:48px">
        <h2>Citizen Feedback</h2><span class="section-no">RESULT</span>
      </div>
      <div class="card">
        <p><strong>Rating: ${'⭐'.repeat(r.citizenFeedback.rating)} (${r.citizenFeedback.rating}/5)</strong></p>
        <p style="margin-top:8px">${r.citizenFeedback.comment || ''}</p>
        <p style="margin-top:12px"><span class="badge ${r.citizenFeedback.accepted ? 'badge-completed' : 'badge-reopened'}">${r.citizenFeedback.accepted ? '✅ Accepted' : '🔄 Requested Further Attention'}</span></p>
      </div>` : ''}

    <div class="section-head" style="margin-top:48px">
      <h2>Comments</h2><span class="section-no">COMMUNITY</span>
    </div>
    <div class="card">
      <div id="commentsList">
        ${comments && comments.length ? comments.map(c => `
          <div class="comment">
            <div class="comment-avatar">${c.user ? c.user.name.charAt(0).toUpperCase() : '?'}</div>
            <div class="comment-body">
              <div class="comment-author">${c.user ? c.user.name : 'User'} <span class="role-badge">${c.user ? c.user.role : ''}</span></div>
              <div class="comment-text">${c.text}</div>
              <div class="comment-time">${timeAgo(c.createdAt)}</div>
            </div>
          </div>`).join('') : '<p style="color:var(--ink-2)">No comments yet</p>'}
      </div>
      ${currentUser ? `
        <form onsubmit="addComment(event,'${r._id}')" style="margin-top:16px">
          <div class="form-group"><textarea class="form-control" id="commentText" placeholder="Write a comment..."></textarea></div>
          <button type="submit" class="btn btn-primary btn-sm">Add Comment</button>
        </form>` : '<p style="margin-top:16px"><a href="#" onclick="navigate(\'login\')">Login</a> to comment</p>'}
    </div>

    ${currentUser && currentUser.role === 'admin' ? `
      <div class="section-head" style="margin-top:48px">
        <h2>Admin Actions</h2><span class="section-no">MODERATION</span>
      </div>
      <div class="card">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:14px">
          <label style="font-family:var(--font-mono);font-size:var(--fs-xs);letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:var(--red)">Assign to Authority</label>
          <select class="form-control" id="assignAuthority" style="max-width:320px">${authOptions}</select>
          <button class="btn btn-sm btn-primary" onclick="assignReport('${r._id}')">${r.assignedAuthority ? 'Reassign' : 'Assign'}</button>
        </div>
        <button class="btn btn-sm btn-warning" onclick="flagReport('${r._id}')">🚩 Flag Inappropriate</button>
      </div>` : ''}

    ${currentUser && (currentUser.role === 'admin' || (currentUser.role === 'authority' && r.assignedAuthority && String(r.assignedAuthority._id || r.assignedAuthority) === String(currentUser._id))) ? `
      <div class="section-head" style="margin-top:48px">
        <h2>Authority Actions</h2><span class="section-no">RESPONSE</span>
      </div>
      <div class="card">
        <div class="form-group">
          <label>Update Status</label>
          <select class="form-control" id="updateStatus">
            <option value="Acknowledged" ${r.status === 'Acknowledged' ? 'selected' : ''}>Acknowledged</option>
            <option value="Under Assessment" ${r.status === 'Under Assessment' ? 'selected' : ''}>Under Assessment</option>
            <option value="Action Planned" ${r.status === 'Action Planned' ? 'selected' : ''}>Action Planned</option>
            <option value="In Progress" ${r.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${r.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="On Hold" ${r.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
            <option value="Rejected" ${r.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>
        <div class="form-group"><label>Estimated Resolution Date <span style="color:var(--ink-2);font-weight:400">(optional)</span></label><input type="date" class="form-control" id="estimatedResolutionDate" value="${r.estimatedResolutionDate ? new Date(r.estimatedResolutionDate).toISOString().slice(0,10) : ''}"></div>
        <div class="form-group"><label>Authority Response</label><textarea class="form-control" id="authorityResponse" placeholder="A helpful response will be generated automatically if you leave this blank."></textarea></div>
        <div class="form-group"><label>Internal / Timeline Note</label><textarea class="form-control" id="statusNote" placeholder="Optional timeline note..."></textarea></div>
        <button class="btn btn-primary" onclick="updateStatusNow('${r._id}')">Update Status</button>
      </div>` : ''}
  `;
}

async function loadMyReports() {
  const el = document.getElementById('myReportsContent');
  if (!currentUser) { showToast('Please login', 'error'); navigate('login'); return; }
  const data = await API.get('/api/reports/my');
  if (!data || data.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <h3>No reports yet</h3>
        <p>Report your first public issue</p>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navigate('create-report')">Report Issue</button>
      </div>`;
    return;
  }
  el.innerHTML = `<div class="grid grid-2 stagger">${data.map(r => renderReportCard(r)).join('')}</div>`;
}

async function loadAuthorityDashboard(view = 'assigned') {
  const el = document.getElementById('authorityContent');
  if (!currentUser) { showToast('Please login', 'error'); navigate('login'); return; }
  const reports = await API.get('/api/reports/authority?view=assigned');
  const assigned = reports || [];
  const visibleReports = view === 'all-public' ? await API.get('/api/reports/authority?view=all-public') : assigned;
  const completed = assigned.filter(r => r.status === 'Completed').length;
  const pending = assigned.filter(r => !['Completed','Rejected'].includes(r.status)).length;
  const priority = assigned.filter(r => !['Completed','Rejected'].includes(r.status)).slice(0, 6);
  el.innerHTML = `
    <div class="grid grid-4">
      <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><h3>${assigned.length}</h3><p>Assigned</p></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><h3>${completed}</h3><p>Completed</p></div></div>
      <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-info"><h3>${pending}</h3><p>Pending</p></div></div>
      <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-info"><h3>${priority.length}</h3><p>Needs Attention</p></div></div>
    </div>
    <div class="section-head" style="margin-top:48px"><h2>Priority Reports</h2><span class="section-no">ACTION / QUEUE</span></div>
    <div class="grid grid-2">${priority.length ? priority.map(r => `<div class="card priority-report"><div style="display:flex;justify-content:space-between;gap:12px"><span class="badge ${getStatusClass(r.status)}">${r.status}</span><span class="priority-label">NEEDS ATTENTION</span></div><h3 style="margin-top:16px">${r.title}</h3><p style="color:var(--ink-2);margin-top:8px">📍 ${r.location ? [r.location.upazila,r.location.district].filter(Boolean).join(', ') : 'Location unavailable'}</p><p style="margin-top:8px">${r.description ? r.description.substring(0,120) : ''}${r.description && r.description.length>120?'…':''}</p><div style="margin-top:18px;display:flex;justify-content:space-between;align-items:center"><span class="support-count">👍 ${r.supportCount || 0} supports</span><button class="btn btn-sm btn-primary" onclick="navigate('report-detail','${r._id}')">View Report →</button></div></div>`).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="icon">✅</div><h3>All caught up</h3><p>No reports for your department need attention.</p></div>'}</div>
    <div class="section-head" style="margin-top:56px"><h2>Reports</h2><span class="section-no">AUTHORITY</span></div>
    <div class="card" style="margin-bottom:18px"><label for="authorityReportView">Choose reports</label><select id="authorityReportView" class="form-control" style="max-width:340px" onchange="loadAuthorityDashboard(this.value)"><option value="all-public" ${view === 'all-public' ? 'selected' : ''}>All Public Reports</option><option value="assigned" ${view === 'assigned' ? 'selected' : ''}>Assigned Reports</option></select><p class="form-hint" style="margin-top:8px">Only reports assigned to your account can be edited.</p></div>
    <div class="grid grid-2">${visibleReports && visibleReports.length ? visibleReports.map(r => renderReportCard(r)).join('') : '<p style="color:var(--ink-2);font-family:var(--font-mono)">No reports found.</p>'}</div>`;
}

function renderAdminPage(content) {
  document.getElementById('adminContent').innerHTML = content;
}

async function loadAdminSection(section) {
  const el = document.getElementById('adminContent');
  if (!el) return;
  switch (section) {
    case 'dashboard': {
      const data = await API.get('/api/admin/dashboard');
      el.innerHTML = renderAdminDashboard(data);
      renderCharts(data);
      break;
    }
    case 'users': {
      const data = await API.get('/api/admin/users');
      el.innerHTML = renderAdminUsers(data.users || []);
      break;
    }
    case 'categories': {
      const cats = await API.get('/api/admin/categories');
      el.innerHTML = renderAdminCategories(cats || []);
      break;
    }
    case 'locations': {
      const order = ['division', 'district', 'upazila'];
      let all = [];
      for (const type of order) {
        const locs = await API.get(`/api/admin/locations?type=${type}`);
        all = all.concat(locs || []);
      }
      let content = `<div class="page-header"><h1>Location Management</h1><p>Hierarchy: Division → District → Upazila</p></div>`;
      for (const type of order) {
        const locs = await API.get(`/api/admin/locations?type=${type}`);
        content += `<div class="card"><h3 style="text-transform:capitalize;margin-bottom:12px">${type}s</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${(locs || []).map(l => `<span style="background:var(--line);padding:6px 12px;font-size:0.78rem;font-weight:600">${l.name}</span>`).join('')}
          </div></div>`;
      }
      el.innerHTML = content;
      break;
    }
    case 'reports': {
      const data = await API.get('/api/reports?limit=50');
      el.innerHTML = `
        <div class="page-header"><h1>Report Monitoring</h1></div>
        <div class="grid grid-3">${data.reports.map(r => renderReportCard(r)).join('')}</div>`;
      break;
    }
    case 'analytics': {
      const data = await API.get('/api/admin/dashboard');
      el.innerHTML = `
        <div class="page-header"><h1>Analytics</h1></div>
        <div class="grid grid-2">
          <div class="card"><h3>Users by Role</h3><canvas id="roleChart" height="200"></canvas></div>
          <div class="card"><h3>Reports by Category</h3><canvas id="catChart" height="200"></canvas></div>
        </div>
        <div class="card" style="margin-top:16px"><h3>Reports by Division</h3><canvas id="divChart" height="200"></canvas></div>`;
      renderAnalyticsCharts(data);
      break;
    }
  }
}

function renderCharts(data) {
  setTimeout(() => {
    if (document.getElementById('statusChart')) drawBarChart('statusChart', data.byStatus);
    if (document.getElementById('divisionChart')) drawBarChart('divisionChart', data.byDivision);
  }, 100);
}

function renderAnalyticsCharts(data) {
  setTimeout(() => {
    if (document.getElementById('roleChart')) drawBarChart('roleChart', data.usersByRole);
    if (document.getElementById('catChart')) drawBarChart('catChart', data.byCategory);
    if (document.getElementById('divChart')) drawBarChart('divChart', data.byDivision);
  }, 100);
}

function drawBarChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const palette = ['#F42A41', '#2563EB', '#006A4E', '#FFC300', '#00B97F', '#00C2A8', '#FF4FA3', '#FF7A00', '#B8F135', '#0B0B0F'];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const items = (data || []).slice(0, 10);
  const max = Math.max(...items.map(i => i.count), 1);
  const barWidth = (canvas.width - 120) / items.length;
  const chartHeight = canvas.height - 40;
  const colorMap = {};
  let catColors = 0;
  items.forEach((item, i) => {
    let label = item._id || 'N/A';
    colorMap[label] = palette[i % palette.length];
    const h = (item.count / max) * (chartHeight - 20);
    const x = 60 + i * barWidth;
    const y = canvas.height - 40 - h;
    ctx.fillStyle = colorMap[label];
    ctx.fillRect(x, y, barWidth - 8, h);
    ctx.fillStyle = '#374151';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const shortLabel = label.length > 12 ? label.substring(0, 10) + '..' : label;
    ctx.fillText(shortLabel, x + (barWidth - 8) / 2, canvas.height - 20);
    ctx.fillText(item.count, x + (barWidth - 8) / 2, y - 5);
  });
}

async function loadProfile() {
  const el = document.getElementById('profileContent');
  if (!el || !currentUser) return;
  const [user, stats, reports] = await Promise.all([API.get('/api/auth/me'), API.get('/api/auth/profile-stats'), API.get('/api/reports/my')]);
  if (!user || !stats) return;
  const recent = (reports || []).slice(0, 4);
  el.innerHTML = `
    <div class="profile-hero card">
      <div class="profile-avatar">${user.avatar ? `<img src="${user.avatar}" alt="Profile picture" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.style.display='none'">` : (user.name || '?').charAt(0).toUpperCase()}</div>
      <div class="profile-main"><span class="profile-kicker">${stats.level}</span><h2>${user.name}</h2><p>${user.email}</p><p>${user.phone || 'No phone added'}</p></div>
      <div class="profile-score"><strong>${stats.score}</strong><span>CIVIC SCORE</span></div>
    </div>
    <div class="grid grid-4" style="margin-top:24px">
      <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-info"><h3>${stats.reports}</h3><p>Reports</p></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><h3>${stats.resolved}</h3><p>Resolved</p></div></div>
      <div class="stat-card"><div class="stat-icon">👍</div><div class="stat-info"><h3>${stats.supports}</h3><p>Supports Given</p></div></div>
      <div class="stat-card"><div class="stat-icon">💬</div><div class="stat-info"><h3>${stats.comments}</h3><p>Comments</p></div></div>
    </div>
    <div class="grid grid-2" style="margin-top:28px">
      <div class="card"><div class="card-header"><span class="card-title">Contribution</span></div><div class="profile-badges"><span class="profile-badge">🇧🇩 ${stats.level}</span><span class="profile-badge">⭐ ${stats.avgRating ? stats.avgRating + '/5 rating' : 'No rating yet'}</span></div><p style="margin-top:18px;color:var(--ink-2)">Keep reporting, supporting and following issues to grow your civic contribution.</p></div>
      <div class="card"><div class="card-header"><span class="card-title">Account Details</span></div>
        <form onsubmit="updateProfile(event)">
          <div class="form-group"><label>Name</label><input id="profileName" class="form-control" value="${user.name || ''}" required></div>
          <div class="form-group"><label>Phone</label><input id="profilePhone" class="form-control" value="${user.phone || ''}"></div>
          <button class="btn btn-primary btn-sm">Save Changes</button>
        </form>
      </div>
    </div>
    <div class="section-head" style="margin-top:48px"><h2>Recent Reports</h2><span class="section-no">MY / ACTIVITY</span></div>
    <div class="grid grid-2">${recent.length ? recent.map(r => renderReportCard(r)).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="icon">📝</div><h3>No reports yet</h3><p>Start by reporting a public issue.</p></div>'}</div>`;
}

async function updateProfile(e) {
  e.preventDefault();
  try {
    const user = await API.put('/api/auth/profile', { name: document.getElementById('profileName').value, phone: document.getElementById('profilePhone').value });
    currentUser = { ...currentUser, ...user }; window.currentUser = currentUser; updateNav(); showToast('Profile updated'); loadProfile();
  } catch (err) { showToast(err.message, 'error'); }
}

async function toggleSupport(reportId) {
  if (!currentUser) { showToast('Please login to support', 'error'); navigate('login'); return; }
  await API.post(`/api/reports/${reportId}/support`, {});
  showToast('Updated');
  renderPage('report-detail', reportId);
}

async function addComment(e, reportId) {
  e.preventDefault();
  const text = document.getElementById('commentText').value;
  if (!text.trim()) return;
  await API.post(`/api/comments/${reportId}`, { text });
  renderPage('report-detail', reportId);
}

async function submitFeedback(e, reportId) {
  e.preventDefault();
  const data = {
    rating: parseInt(document.getElementById('fbRating').value),
    comment: document.getElementById('fbComment').value,
    accepted: document.getElementById('fbAccepted').value === 'true'
  };
  await API.post(`/api/reports/${reportId}/feedback`, data);
  showToast('Feedback submitted');
  renderPage('report-detail', reportId);
}

async function updateStatusNow(reportId) {
  const status = document.getElementById('updateStatus').value;
  const note = document.getElementById('statusNote').value;
  const estimatedResolutionDate = document.getElementById('estimatedResolutionDate')?.value || '';
  const authorityResponse = document.getElementById('authorityResponse')?.value || '';
  try {
    await API.put(`/api/reports/${reportId}/status`, { status, note, estimatedResolutionDate, authorityResponse });
    showToast('Status and authority response updated');
    renderPage('report-detail', reportId);
  } catch (err) { showToast(err.message, 'error'); }
}

async function flagReport(reportId) {
  await API.post(`/api/reports/${reportId}/flag`, {});
  showToast('Report flagged');
}

async function assignReport(reportId) {
  const authorityId = document.getElementById('assignAuthority').value;
  if (!authorityId) { showToast('Please select an authority', 'error'); return; }
  await API.put(`/api/admin/assign/${reportId}`, { authorityId });
  showToast('Report assigned to authority');
  renderPage('report-detail', reportId);
}

async function changeRole(userId, role) {
  await API.put(`/api/admin/users/${userId}/role`, { role });
  showToast('Role updated');
  loadAdminSection('users');
  navigate('admin-users');
}

async function toggleActive(userId) {
  await API.put(`/api/admin/users/${userId}/toggle`, {});
  showToast('User status updated');
  navigate('admin-users');
}

async function deleteCategory(catId) {
  if (!confirm('Delete this category?')) return;
  await API.delete(`/api/admin/categories/${catId}`);
  showToast('Category deleted');
  navigate('admin-categories');
}

function showAddCategory() {
  const modal = document.getElementById('modal');
  document.getElementById('modalContent').innerHTML = `
    <h2>Add Category</h2>
    <form onsubmit="createCategory(event)">
      <div class="form-group"><label>Name</label><input class="form-control" id="catName" required></div>
      <div class="form-group"><label>Description</label><textarea class="form-control" id="catDesc"></textarea></div>
      <div class="form-group"><label>Icon (emoji)</label><input class="form-control" id="catIcon"></div>
      <button type="submit" class="btn btn-primary">Add</button>
      <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
    </form>`;
  modal.style.display = 'flex';
}

async function createCategory(e) {
  e.preventDefault();
  await API.post('/api/admin/categories', {
    name: document.getElementById('catName').value,
    description: document.getElementById('catDesc').value,
    icon: document.getElementById('catIcon').value || '📋'
  });
  showToast('Category added');
  closeModal();
  navigate('admin-categories');
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

async function loadNotifications() {
  const el = document.getElementById('notifContent');
  const data = await API.get('/api/notifications');
  if (!el || !data) return;
  el.innerHTML = `
    <button class="btn btn-sm btn-outline" style="margin-bottom:16px" onclick="markAllRead()">Mark all as read</button>
    <div class="card">
      ${data.length === 0 ? '<p style="color:var(--ink-2);font-family:var(--font-mono)">No notifications</p>' : `
        <ul class="notif-list">
          ${data.map(n => `
            <li class="notif-item ${n.isRead ? '' : 'unread'}" onclick="${n.report ? `navigate('report-detail','${n.report._id}')` : ''}">
              <span class="notif-icon">${getNotifIcon(n.type)}</span>
              <div>
                <div class="notif-text">${n.message}</div>
                <div class="notif-time">${timeAgo(n.createdAt)}</div>
              </div>
            </li>`).join('')}
        </ul>`}
    </div>`;
  await API.put('/api/notifications/read-all', {});
  loadNotifCount();
}

function getNotifIcon(type) {
  const map = {
    report_received: '📨', status_update: '🔄', authority_response: '🏛️',
    feedback_request: '💬', comment: '💬', system: '⚙️'
  };
  return map[type] || '🔔';
}

async function markAllRead() {
  await API.put('/api/notifications/read-all', {});
  loadNotifCount();
}

document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'regRole') {
    const isAuthority = e.target.value === 'authority';
    const auth = document.getElementById('authorityFields');
    const photo = document.getElementById('authorityPhotoField');
    const photoInput = document.getElementById('regAvatar');
    if (auth) auth.style.display = isAuthority ? 'block' : 'none';
    if (photo) photo.style.display = isAuthority ? 'block' : 'none';
    if (photoInput) photoInput.required = isAuthority;
  }
});
