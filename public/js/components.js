function renderHome() {
  return `
      <div class="hero">
      <div class="hero-blob hero-blob-a"></div>
      <div class="hero-blob hero-blob-b"></div>
      <div class="hero-blob hero-blob-c"></div>
      <div class="hero-word">BD</div>
      <div class="hero-inner">
        <div>
          <div class="hero-eyebrow">
            <span class="flag flag-sm" aria-label="Bangladesh flag"></span>
            <span style="color:var(--flag-green);font-size:var(--fs-md)">Citizen Reporting Platform</span>
          </div>
          <h1>
            <span class="line"><span>Report.</span></span>
            <span class="line"><span><span class="accent">Track.</span></span></span>
            <span class="line"><span><span class="outline">Improve</span> BD.</span></span>
          </h1>
          <p data-scramble>From citizen to development — report public issues, track authority responses, and drive real change in every division of Bangladesh.</p>
          <div class="hero-action-row">
            <button class="btn btn-primary btn-lg" onclick="navigate('create-report')"><span class="btn-clip">📢 Report an Issue</span></button>
            <button class="btn btn-outline btn-lg" onclick="navigate('reports')"><span class="btn-clip">Browse Reports →</span></button>
          </div>
          <div class="hero-tagline-mono">
            <span style="color:var(--flag-green)">● DIGITAL BANGLADESH</span>
            <span style="color:var(--red)">● SMART CITY</span>
          </div>
          <div class="hero-stat-strip">
            <div class="hs"><div class="hs-num"><span data-counter="100">0</span>%</div><div class="hs-lbl">Transparent</div></div>
            <div class="hs"><div class="hs-num"><span data-counter="24">0</span>/7</div><div class="hs-lbl">Reporting</div></div>
            <div class="hs"><div class="hs-num"><span data-counter="8">0</span></div><div class="hs-lbl">Divisions</div></div>
            <div class="hs"><div class="hs-num"><span data-counter="10">0</span>+</div><div class="hs-lbl">Categories</div></div>
          </div>
        </div>
      </div>
      <div class="hero-scroll">Scroll<div class="scroll-line"></div></div>
    </div>

    <div class="strip">
      <div class="marquee">
        <div class="marquee-track">
          <span>Report</span>
          <span>Track</span>
          <span>Improve Bangladesh</span>
          <span>Digital Bangladesh</span>
          <span>Smart City</span>
          <span>Report</span>
          <span>Track</span>
          <span>Improve Bangladesh</span>
          <span>Digital Bangladesh</span>
          <span>Smart City</span>
        </div>
      </div>
    </div>

    <div class="features container" style="padding-top:70px">
      <div class="section-head reveal">
        <h2>How It Works</h2>
        <span class="section-no">01 / PROCESS</span>
      </div>
      <div class="grid grid-4 stagger">
        <div class="feature-card reveal">
          <span class="feature-tag">STEP 01</span>
          <div class="icon">📝</div>
          <h3>Report</h3>
          <p>Submit a public issue with photos, location, and details</p>
        </div>
        <div class="feature-card reveal">
          <span class="feature-tag">STEP 02</span>
          <div class="icon">👁️</div>
          <h3>Track</h3>
          <p>Follow the report journey from submission to resolution</p>
        </div>
        <div class="feature-card reveal">
          <span class="feature-tag">STEP 03</span>
          <div class="icon">🏛️</div>
          <h3>Authority Response</h3>
          <p>Authorities review, assess, and update issue status</p>
        </div>
        <div class="feature-card reveal">
          <span class="feature-tag">STEP 04</span>
          <div class="icon">⭐</div>
          <h3>Feedback</h3>
          <p>Rate the resolution and help improve public services</p>
        </div>
      </div>

      <div class="section-head reveal" style="margin-top:80px">
        <h2>Categories</h2>
        <span class="section-no">02 / TOPICS</span>
      </div>
      <div class="grid grid-3 stagger" id="homeCategories"></div>

      <div class="section-head reveal" style="margin-top:80px">
        <h2>Reported Issues Map</h2>
        <span class="section-no">03 / GEO</span>
      </div>
      <div id="homeMap" style="height:440px;border:3px solid var(--ink);box-shadow:var(--sh3);" class="reveal"></div>

      <div class="section-head reveal" style="margin-top:80px">
        <h2>Live Impact</h2>
        <span class="section-no">04 / STATS</span>
      </div>
      <div class="grid grid-4" id="homeLiveStats"></div>

      <div class="section-head reveal" style="margin-top:80px">
        <h2>Most Supported Issues</h2>
        <span class="section-no">05 / COMMUNITY</span>
      </div>
      <div class="grid grid-3" id="homeSupported"></div>

      <div class="bd-band reveal" style="margin-top:90px">
        <div class="bd-band-flag"><span class="flag" style="--flag-w:200px"></span></div>
        <div class="bd-band-body">
          <span class="bd-band-kicker">THE PEOPLE'S REPUBLIC OF BANGLADESH</span>
          <h2>"<span style="color:var(--lime)">Sonar Bangla's</span> future — built one report at a time."</h2>
          <p>From the Cox's Bazar coastline to the Sundarbans, every citizen deserves functioning roads, clean water, and safe neighborhoods. FixMyBD is citizen power in action across the nation.</p>
          <div class="bd-band-stats">
            <div class="bd-stat"><div class="num"><span data-counter="8">0</span></div><div class="lbl">Divisions</div></div>
            <div class="bd-stat"><div class="num"><span data-counter="64">0</span></div><div class="lbl">Districts</div></div>
            <div class="bd-stat"><div class="num"><span data-counter="492">0</span></div><div class="lbl">Upazilas</div></div>
          </div>
        </div>
      </div>
    </div>`;
}

async function loadHomeCategories() {
  const cats = await API.get('/api/admin/categories');
  const el = document.getElementById('homeCategories');
  if (!el || !cats) return;
  el.innerHTML = cats.map((c, i) => `
    <div class="feature-card" style="cursor:pointer" onclick="navigate('reports')">
      <span class="feature-tag">CATEGORY</span>
      <h3>${c.name}</h3>
       <p>${c.description || ''}</p>
      <div class="category-meta"><span>${c.reportCount}</span><span>Active Reports</span></div>
    </div>`).join('');
}

function initHomeMap() {
  loadHomeCategories();
  loadHomeHighlights();
  setTimeout(async () => {
    const el = document.getElementById('homeMap');
    if (!el) return;
    const map = L.map('homeMap').setView([23.8103, 90.4125], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    const data = await API.get('/api/reports?limit=50');
    if (data && data.reports) {
      data.reports.forEach(r => {
        if (r.location && r.location.lat && r.location.lng) {
          L.marker([r.location.lat, r.location.lng]).addTo(map)
            .bindPopup(`<b>${r.title}</b><br>${r.status}`);
        }
      });
    }
  }, 100);
}


async function loadHomeHighlights() {
  const stats = await API.get('/api/reports/stats');
  const statsEl = document.getElementById('homeLiveStats');
  const supportedEl = document.getElementById('homeSupported');
  if (!stats) return;
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><h3>${stats.total || 0}</h3><p>Total Reports</p></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><h3>${stats.resolved || 0}</h3><p>Resolved Issues</p></div></div>
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><h3>${stats.activeCitizens || 0}</h3><p>Active Citizens</p></div></div>
      <div class="stat-card"><div class="stat-icon">👍</div><div class="stat-info"><h3>${stats.totalSupports || 0}</h3><p>Community Supports</p></div></div>`;
  }
  if (supportedEl) {
    const items = (stats.supported || []).slice(0, 3);
    supportedEl.innerHTML = items.length ? items.map(r => renderReportCard(r)).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="icon">👍</div><h3>No supported issues yet</h3><p>Community support will appear here.</p></div>';
  }
}

function renderLogin() {
  return `
    <div class="auth-container">
      <div class="auth-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
          <h2 style="margin-bottom:0">Sign In</h2>
          <span class="block-no">✕</span>
        </div>
        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" id="loginEmail" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" id="loginPassword" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Login</button>
        </form>
        <div class="text-center">Don't have an account? <a href="#" onclick="navigate('register')">Register</a></div>
      </div>
    </div>`;
}

function renderRegister() {
  return `
    <div class="auth-container">
      <div class="auth-card" style="max-width:520px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
          <h2 style="margin-bottom:0">Create Account</h2>
          <span class="block-no">✚</span>
        </div>
        <form onsubmit="handleRegister(event)">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" class="form-control" id="regName" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" id="regEmail" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" id="regPassword" required minlength="6">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" class="form-control" id="regPhone">
          </div>
          <div class="form-group">
            <label>National ID (13 digits)</label>
            <input type="text" class="form-control" id="regNationalId" inputmode="numeric" pattern="[0-9]{13}" maxlength="13" minlength="13" placeholder="Enter your 13-digit NID" required>
            <small class="form-hint">One National ID can be used for only one account.</small>
          </div>
          <div class="form-group" id="authorityPhotoField" style="display:none">
            <label>Authority Profile Picture <span style="color:#c62828">*</span></label>
            <input type="file" class="form-control" id="regAvatar" accept="image/jpeg,image/png,image/webp,image/gif">
            <small class="form-hint">Upload a clear profile photo (maximum 5 MB).</small>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select class="form-control" id="regRole">
              <option value="citizen">Citizen</option>
              <option value="authority">Authority</option>
            </select>
          </div>
          <div id="authorityFields" style="display:none">
            <div class="form-group">
              <label>Department</label>
              <input type="text" class="form-control" id="regDept" placeholder="e.g. Road & Infrastructure">
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Register</button>
        </form>
        <div class="text-center">Already have an account? <a href="#" onclick="navigate('login')">Login</a></div>
      </div>
    </div>`;
}

function renderCreateReport() {
  const el = document.getElementById('createReportForm');
  if (!window.currentUser) { showToast('Please login first', 'error'); navigate('login'); return; }
  el.innerHTML = `
    <div class="page-header">
      <div><h1>Report a Public Issue</h1><p>Fill in the details below to submit your report</p></div>
      <span class="section-no" style="font-family:var(--font-mono);color:var(--red);font-weight:600;letter-spacing:0.2em;white-space:nowrap">NEW / REPORT</span>
    </div>
    <div class="card">
      <form onsubmit="handleCreateReport(event)" enctype="multipart/form-data">
        <div class="form-block">
          <div class="form-block-head"><span class="block-no">A</span><span class="block-title">About the issue</span></div>
          <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control" id="reportTitle" required placeholder="Brief title of the issue">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" id="reportDesc" required placeholder="Describe the issue in detail"></textarea>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select class="form-control" id="reportCategory" required></select>
          </div>
        </div>
        <div class="form-block">
          <div class="form-block-head"><span class="block-no">B</span><span class="block-title">Location</span></div>
          <div class="grid grid-2">
            <div class="form-group">
              <label>Division</label>
              <select class="form-control" id="reportDivision" required onchange="loadLocations('district', this.value)"></select>
            </div>
            <div class="form-group">
              <label>District</label>
              <select class="form-control" id="reportDistrict" required onchange="loadLocations('upazila', this.value)"></select>
            </div>
          </div>
          <div class="grid grid-2">
            <div class="form-group">
              <label>Upazila</label>
              <select class="form-control" id="reportUpazila" onchange="focusReportLocation()"></select>
            </div>
            <div class="form-group">
              <label>Address</label>
              <input type="text" class="form-control" id="reportAddress" placeholder="Specific address">
            </div>
          </div>
        </div>
        <div class="form-block">
          <div class="form-block-head"><span class="block-no">C</span><span class="block-title">Evidence</span></div>
          <div class="form-group">
            <label>Photos (optional · up to 5)</label>
            <input type="file" class="form-control" id="reportPhoto" accept="image/*" multiple>
            <p class="form-hint">Add multiple photos if you want to show the issue from different angles.</p>
          </div>
          <div class="form-group">
            <label>Location on Map <span style="color:var(--red)">(auto-centers from your selected location)</span></label>
            <div id="reportMap" style="height:300px"></div>
          </div>
        </div>
        <input type="hidden" id="reportLat">
        <input type="hidden" id="reportLng">
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <button type="submit" class="btn btn-primary btn-lg">Submit Report →</button>
        </div>
      </form>
    </div>`;
  loadReportFormCategories();
  loadReportFormDivisions();
  initReportMap();
}

async function loadReportFormCategories() {
  const cats = await API.get('/api/admin/categories');
  const sel = document.getElementById('reportCategory');
  if (!sel || !cats) return;
  sel.innerHTML = '<option value="">Select Category</option>' + cats.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
}

async function loadReportFormDivisions() {
  const divs = await API.get('/api/admin/locations?type=division');
  const sel = document.getElementById('reportDivision');
  if (!sel || !divs) return;
  sel.innerHTML = '<option value="">Select Division</option>' + divs.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
}

async function loadLocations(type, parentName) {
  const selId = type === 'district' ? 'reportDistrict' : 'reportUpazila';
  const sel = document.getElementById(selId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Loading...</option>';
  const parent = await API.get(`/api/admin/locations?type=${type === 'district' ? 'division' : 'district'}`);
  const parentDoc = parent ? parent.find(p => p.name === parentName) : null;
  if (!parentDoc) { sel.innerHTML = `<option value="">Select ${type}</option>`; return; }
  const locations = await API.get(`/api/admin/locations?type=${type}&parentId=${parentDoc._id}`);
  sel.innerHTML = `<option value="">Select ${type.charAt(0).toUpperCase() + type.slice(1)}</option>` +
    (locations || []).map(l => `<option value="${l.name}">${l.name}</option>`).join('');
  if (type === 'upazila') {
    setTimeout(() => focusReportLocation(), 30);
  } else {
    setTimeout(() => focusReportLocation(), 30);
  }
}

const REPORT_LOCATION_COORDS = {
  'Dhaka': [23.8103, 90.4125], 'Dhaka|Dhaka': [23.8103, 90.4125], 'Dhaka|Gazipur': [24.0023, 90.4264], 'Dhaka|Narayanganj': [23.6238, 90.5000],
  'Chittagong': [22.3569, 91.7832], 'Chittagong|Chittagong': [22.3569, 91.7832], 'Chittagong|Cox\'s Bazar': [21.4272, 92.0058],
  'Rajshahi': [24.3745, 88.6042], 'Rajshahi|Rajshahi': [24.3745, 88.6042], 'Rajshahi|Bogura': [24.8465, 89.3770],
  'Khulna': [22.8456, 89.5403], 'Khulna|Khulna': [22.8456, 89.5403], 'Khulna|Jessore': [23.1634, 89.2182],
  'Sylhet': [24.8949, 91.8687], 'Sylhet|Sylhet': [24.8949, 91.8687],
  'Barisal': [22.7010, 90.3535], 'Barisal|Barisal': [22.7010, 90.3535],
  'Rangpur': [25.7439, 89.2752], 'Rangpur|Rangpur': [25.7439, 89.2752],
  'Mymensingh': [24.7471, 90.4203], 'Mymensingh|Mymensingh': [24.7471, 90.4203],
  'Mymensingh|Mymensingh|Mymensingh Sadar': [24.7471, 90.4203], 'Mymensingh|Mymensingh|Muktagachha': [24.7634, 90.2564], 'Mymensingh|Mymensingh|Gouripur': [24.7617, 90.5587],
  'Dhaka|Dhaka|Dhanmondi': [23.7461, 90.3742], 'Dhaka|Dhaka|Gulshan': [23.7925, 90.4078], 'Dhaka|Dhaka|Mirpur': [23.8223, 90.3654], 'Dhaka|Dhaka|Uttara': [23.8759, 90.3795], 'Dhaka|Dhaka|Mohammadpur': [23.7679, 90.3582],
  'Dhaka|Gazipur|Gazipur Sadar': [24.0023, 90.4264], 'Dhaka|Gazipur|Kaliakair': [24.0678, 90.3056], 'Dhaka|Gazipur|Kapasia': [24.1000, 90.5730],
  'Dhaka|Narayanganj|Narayanganj Sadar': [23.6238, 90.5000], 'Dhaka|Narayanganj|Sonargaon': [23.6500, 90.6000], 'Dhaka|Narayanganj|Fatullah': [23.6230, 90.4780],
  'Chittagong|Chittagong|Chittagong Sadar': [22.3569, 91.7832], 'Chittagong|Chittagong|Hathazari': [22.5088, 91.8050], 'Chittagong|Chittagong|Sandwip': [22.4850, 91.4390],
  'Chittagong|Cox\'s Bazar|Cox\'s Bazar Sadar': [21.4272, 92.0058], 'Chittagong|Cox\'s Bazar|Teknaf': [20.8624, 92.3058], 'Chittagong|Cox\'s Bazar|Ukhia': [21.1830, 92.1020],
  'Rajshahi|Rajshahi|Rajshahi Sadar': [24.3745, 88.6042], 'Rajshahi|Rajshahi|Boalia': [24.3745, 88.6042], 'Rajshahi|Rajshahi|Motihar': [24.3745, 88.6042],
  'Rajshahi|Bogura|Bogura Sadar': [24.8465, 89.3770], 'Rajshahi|Bogura|Sherpur': [24.6680, 89.4210], 'Rajshahi|Bogura|Adamdighi': [24.7833, 89.1667],
  'Khulna|Khulna|Khulna Sadar': [22.8456, 89.5403], 'Khulna|Khulna|Sonadanga': [22.8250, 89.5500], 'Khulna|Khulna|Khalishpur': [22.8580, 89.5350],
  'Khulna|Jessore|Jessore Sadar': [23.1634, 89.2182], 'Khulna|Jessore|Jhikargacha': [23.1020, 89.1080], 'Khulna|Jessore|Abhaynagar': [23.0120, 89.3970],
  'Sylhet|Sylhet|Sylhet Sadar': [24.8949, 91.8687], 'Sylhet|Sylhet|Zakiganj': [24.8680, 92.3150], 'Sylhet|Sylhet|Companiganj': [25.0740, 91.7040],
  'Barisal|Barisal|Barisal Sadar': [22.7010, 90.3535], 'Barisal|Barisal|Bakerganj': [22.5480, 90.3310], 'Barisal|Barisal|Babuganj': [22.8350, 90.3380],
  'Rangpur|Rangpur|Rangpur Sadar': [25.7439, 89.2752], 'Rangpur|Rangpur|Gangachara': [25.8530, 89.2310], 'Rangpur|Rangpur|Kaunia': [25.7700, 89.4330]
};

function focusReportLocation() {
  const map = window.fixMyReportMap;
  if (!map) return;
  const div = document.getElementById('reportDivision')?.value || '';
  const district = document.getElementById('reportDistrict')?.value || '';
  const upazila = document.getElementById('reportUpazila')?.value || '';
  const keys = [`${div}|${district}|${upazila}`, `${div}|${district}`, div];
  const coords = keys.map(k => REPORT_LOCATION_COORDS[k]).find(Boolean);
  if (!coords) return;
  map.setView(coords, upazila ? 12 : district ? 10 : 8, { animate: true });
  if (window.fixMyReportMarker) map.removeLayer(window.fixMyReportMarker);
  window.fixMyReportMarker = L.marker(coords).addTo(map).bindPopup(`<b>${upazila || district || div}</b><br>Auto-selected area`).openPopup();
  document.getElementById('reportLat').value = coords[0];
  document.getElementById('reportLng').value = coords[1];
}

function initReportMap() {
  setTimeout(() => {
    const el = document.getElementById('reportMap');
    if (!el) return;
    if (el._leaflet_id) { el._leaflet_id = null; el.innerHTML = ''; }
    const map = L.map('reportMap').setView([23.8103, 90.4125], 7);
    window.fixMyReportMap = map;
    window.fixMyReportMarker = null;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    map.on('click', (e) => {
      if (window.fixMyReportMarker) map.removeLayer(window.fixMyReportMarker);
      window.fixMyReportMarker = L.marker(e.latlng).addTo(map);
      document.getElementById('reportLat').value = e.latlng.lat;
      document.getElementById('reportLng').value = e.latlng.lng;
    });
  }, 200);
}

function renderReportCard(r) {
  const statusClass = getStatusClass(r.status);
  return `
    <div class="report-card" onclick="navigate('report-detail','${r._id}')">
      ${r.photo ? `<img src="${r.photo}" class="report-card-img" alt="">` : `<div class="report-card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--ink);color:rgba(255,255,255,0.3)">${r.category && r.category.icon ? r.category.icon : '📷'}</div>`}
      <div class="report-card-top">
        <span class="badge ${statusClass}">${r.status}</span>
        <span class="meta-cat" style="font-family:var(--font-mono);font-size:0.62rem;font-weight:700;color:var(--red);text-transform:uppercase">${r.category ? r.category.name : 'Uncategorized'}</span>
      </div>
      <div class="report-card-body">
        <h3>${r.title}</h3>
        <div class="report-card-meta">
          <span>${r.location ? (r.location.district || r.location.division || '') : ''}</span>
          <span>·</span>
          <span>${timeAgo(r.createdAt)}</span>
        </div>
        <p>${r.description ? r.description.substring(0, 90) + (r.description.length > 90 ? '…' : '') : ''}</p>
        <div class="report-card-footer">
          <span class="time">#${r._id.slice(-4).toUpperCase()}</span>
          <button class="support-btn ${r.supports && window.currentUser && r.supports.includes(window.currentUser._id) ? 'active' : ''}" onclick="event.stopPropagation();toggleSupport('${r._id}')">
            👍 ${r.supportCount || 0}
          </button>
        </div>
      </div>
    </div>`;
}

function getStatusClass(status) {
  const map = {
    'Submitted': 'badge-submitted', 'Acknowledged': 'badge-acknowledged',
    'Under Assessment': 'badge-assessment', 'Action Planned': 'badge-planned',
    'In Progress': 'badge-progress', 'Completed': 'badge-completed',
    'Citizen Feedback': 'badge-feedback', 'On Hold': 'badge-hold',
    'Rejected': 'badge-rejected', 'Reopened': 'badge-reopened'
  };
  return map[status] || 'badge-submitted';
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}


function renderProfile() {
  return `
    <div class="container">
      <div class="page-header"><div><h1>My Profile</h1><p>Your civic contribution, activity and account details</p></div><span class="section-no">PROFILE / CITIZEN</span></div>
      <div id="profileContent"><div class="card"><p>Loading profile...</p></div></div>
    </div>`;
}

function renderAdminLayout() {
  if (!window.currentUser || window.currentUser.role !== 'admin') { navigate('home'); return ''; }
  const section = currentPage.replace('admin-', '');
  return `
    <div class="container">
      <div class="admin-layout">
        <div class="admin-sidebar">
          <a href="#" onclick="navigate('admin')" class="${section === 'dashboard' ? 'active' : ''}">📊 Dashboard</a>
          <a href="#" onclick="navigate('admin-users')" class="${section === 'users' ? 'active' : ''}">👥 Users</a>
          <a href="#" onclick="navigate('admin-reports')" class="${section === 'reports' ? 'active' : ''}">📋 Reports</a>
          <a href="#" onclick="navigate('admin-categories')" class="${section === 'categories' ? 'active' : ''}">🏷️ Categories</a>
          <a href="#" onclick="navigate('admin-locations')" class="${section === 'locations' ? 'active' : ''}">📍 Locations</a>
          <a href="#" onclick="navigate('admin-analytics')" class="${section === 'analytics' ? 'active' : ''}">📈 Analytics</a>
        </div>
        <div id="adminContent"></div>
      </div>
    </div>`;
}

function renderAdminDashboard(data) {
  return `
    <div class="page-header reveal"><div><h1>Admin Dashboard</h1><p>System-wide overview & moderation control</p></div><span class="section-no">SYS / 2026</span></div>
    <div class="grid grid-4 stagger">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info"><h3><span data-counter="${data.totalUsers}">0</span></h3><p>Total Users</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info"><h3><span data-counter="${data.totalReports}">0</span></h3><p>Total Reports</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-info"><h3><span data-counter="${data.totalCategories}">0</span></h3><p>Categories</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🚩</div>
        <div class="stat-info"><h3><span data-counter="${data.flaggedReports}">0</span></h3><p>Flagged</p></div>
      </div>
    </div>
    <div class="grid grid-2" style="margin-top:28px">
      <div class="card reveal">
        <div class="card-header"><span class="card-title">Reports by Status</span></div>
        <canvas id="statusChart" height="200"></canvas>
      </div>
      <div class="card reveal">
        <div class="card-header"><span class="card-title">Reports by Division</span></div>
        <canvas id="divisionChart" height="200"></canvas>
      </div>
    </div>
    <div class="card reveal" style="margin-top:28px">
      <div class="card-header"><span class="card-title">Recent Reports</span></div>
      <div class="table-container">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Reporter</th><th>Date</th></tr></thead>
          <tbody>
            ${data.recentReports.map(r => `<tr onclick="navigate('report-detail','${r._id}')" style="cursor:pointer">
              <td><strong>${r.title}</strong></td><td>${r.category ? r.category.name : '-'}</td>
              <td><span class="badge ${getStatusClass(r.status)}">${r.status}</span></td>
              <td>${r.reportedBy ? r.reportedBy.name : '-'}</td>
              <td><span style="font-family:var(--font-mono);font-size:0.75rem">${timeAgo(r.createdAt)}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderAdminUsers(users) {
  return `
    <div class="page-header"><h1>User Management</h1></div>
    <div class="table-container">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${users.map(u => `<tr>
            <td><strong>${u.name}</strong></td><td>${u.email}</td>
            <td><span class="badge badge-${u.role === 'admin' ? 'completed' : u.role === 'authority' ? 'progress' : 'submitted'}">${u.role}</span></td>
            <td>${u.authorityDept || '-'}</td>
            <td>${u.isActive ? '✅' : '❌'}</td>
            <td>
              <select onchange="changeRole('${u._id}', this.value)" style="padding:4px;border:1px solid var(--ink)">
                <option value="citizen" ${u.role === 'citizen' ? 'selected' : ''}>Citizen</option>
                <option value="authority" ${u.role === 'authority' ? 'selected' : ''}>Authority</option>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
              <button class="btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}" onclick="toggleActive('${u._id}')">${u.isActive ? 'Deactivate' : 'Activate'}</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderAdminCategories(categories) {
  return `
    <div class="page-header">
      <div><h1>Category Management</h1><p>Organise the topics citizens can report</p></div>
      <button class="btn btn-primary" onclick="showAddCategory()">+ Add Category</button>
    </div>
    <div class="grid grid-3">
      ${categories.map((c, i) => `
        <div class="card">
          <span class="feature-no">${String(i + 1).padStart(2, '0')}</span>
          <h3 style="font-family:var(--grotesk);text-transform:uppercase;letter-spacing:-0.02em;margin:8px 0 4px">${c.name}</h3>
          <p style="color:var(--ink-2);font-size:var(--fs-sm)">${c.description || ''}</p>
          <p style="margin:14px 0;font-family:var(--font-mono);font-weight:700;color:var(--red)">${c.reportCount} REPORTS</p>
          <button class="btn btn-sm btn-danger" onclick="deleteCategory('${c._id}')">Delete</button>
        </div>`).join('')}
    </div>`;
}

function renderAdminLocations(locations) {
  return `
    <div class="page-header">
      <h1>Location Management</h1>
      <button class="btn btn-primary" onclick="showAddLocation()">+ Add Location</button>
    </div>
    <div class="card">
      <div class="table-container">
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>Parent</th></tr></thead>
          <tbody>
            ${locations.map(l => `<tr>
              <td><strong>${l.name}</strong></td>
              <td><span class="badge badge-submitted">${l.type}</span></td>
              <td>${l.parent ? l.parent.name || l.parent : '-'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
