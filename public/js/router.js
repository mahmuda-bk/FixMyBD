let currentPage = 'home';

function navigate(page, data) {
  currentPage = page;
  renderPage(page, data);
  window.scrollTo(0, 0);
  history.pushState({ page, data }, '', `#${page}`);
}

window.addEventListener('popstate', (e) => {
  if (e.state) {
    currentPage = e.state.page;
    renderPage(e.state.page, e.state.data);
  }
});

async function renderPage(page, data) {
  const app = document.getElementById('app');
  app.classList.remove('page-enter');
  void app.offsetWidth; // restart transition
  app.classList.add('page-enter');
  switch (page) {
    case 'home': app.innerHTML = renderHome(); initHomeMap(); break;
    case 'login': app.innerHTML = renderLogin(); break;
    case 'register': app.innerHTML = renderRegister(); break;
    case 'reports': app.innerHTML = '<div class="container"><div class="page-header"><div><h1>Public Reports</h1></div><span class="section-no" style="font-family:var(--font-mono);color:var(--red);font-weight:600;letter-spacing:0.2em;white-space:nowrap">ALL / ISSUES</span></div><div id="reportsContent"></div></div>'; loadReports(); break;
    case 'report-detail': app.innerHTML = '<div class="container" id="reportDetail"></div>'; loadReportDetail(data); break;
    case 'create-report': app.innerHTML = '<div class="container" id="createReportForm"></div>'; renderCreateReport(); break;
    case 'profile': app.innerHTML = renderProfile(); loadProfile(); break;
    case 'my-reports': app.innerHTML = '<div class="container"><div class="page-header"><div><h1>My Reports</h1></div><span class="section-no" style="font-family:var(--font-mono);color:var(--red);font-weight:600;letter-spacing:0.2em;white-space:nowrap">MY / TRACKING</span></div><div id="myReportsContent"></div></div>'; loadMyReports(); break;
    case 'authority': app.innerHTML = '<div class="container"><div class="page-header"><div><h1>Authority Dashboard</h1></div><span class="section-no" style="font-family:var(--font-mono);color:var(--red);font-weight:600;letter-spacing:0.2em;white-space:nowrap">RESPONSE / DESK</span></div><div id="authorityContent"></div></div>'; loadAuthorityDashboard(); break;
    case 'admin': app.innerHTML = renderAdminLayout(); loadAdminSection('dashboard'); break;
    case 'admin-users': app.innerHTML = renderAdminLayout(); loadAdminSection('users'); break;
    case 'admin-categories': app.innerHTML = renderAdminLayout(); loadAdminSection('categories'); break;
    case 'admin-locations': app.innerHTML = renderAdminLayout(); loadAdminSection('locations'); break;
    case 'admin-reports': app.innerHTML = renderAdminLayout(); loadAdminSection('reports'); break;
    case 'admin-analytics': app.innerHTML = renderAdminLayout(); loadAdminSection('analytics'); break;
    case 'notifications': app.innerHTML = '<div class="container"><div class="page-header"><div><h1>Notifications</h1></div><span class="section-no" style="font-family:var(--font-mono);color:var(--red);font-weight:600;letter-spacing:0.2em;white-space:nowrap">INBOX / ALERTS</span></div><div id="notifContent"></div></div>'; loadNotifications(); break;
    default: app.innerHTML = renderHome();
  }
  updateNav();
}
