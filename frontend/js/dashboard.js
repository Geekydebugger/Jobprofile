// ===== JOBIFY — dashboard.js =====

let currentView = "jobs"; // "jobs" | "applications"

function loadData() {
  return {
    jobs: JSON.parse(localStorage.getItem("jobs")) || [],
    apps: JSON.parse(localStorage.getItem("applications")) || []
  };
}

function updateStats() {
  const { jobs, apps } = loadData();
  const companies = [...new Set(jobs.map(j => j.company))];

  document.getElementById("statJobs").textContent = jobs.length;
  document.getElementById("statApps").textContent = apps.length;
  document.getElementById("statCompanies").textContent = companies.length;
}

function getJobTypeLabel(type) {
  const map = { fulltime: 'Full-Time', parttime: 'Part-Time', remote: 'Remote', contract: 'Contract' };
  return map[type] || 'Full-Time';
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderJobsTable() {
  const { jobs, apps } = loadData();
  const wrapper = document.getElementById("dashJobList");

  // Show jobs panel, hide apps panel
  document.getElementById("appsSection").style.display = "none";
  document.getElementById("dashJobList").closest(".dash-card").style.display = "block";

  if (jobs.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-table">
        No jobs posted yet. <a href="addjob.html" style="color:var(--accent);">Post your first job →</a>
      </div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "dash-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Title</th>
        <th>Company</th>
        <th>Location</th>
        <th>Type</th>
        <th>Applications</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  jobs.forEach(job => {
    const appCount = apps.filter(a => a.jobId == job.id).length;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-title">${job.title}</td>
      <td>${job.company}</td>
      <td>${job.location}</td>
      <td>${getJobTypeLabel(job.type)}</td>
      <td>
        ${appCount > 0
          ? `<button class="btn-view-apps" data-id="${job.id}" data-title="${job.title}">${appCount} application${appCount !== 1 ? 's' : ''}</button>`
          : '<span style="color:var(--text-faint)">—</span>'
        }
      </td>
      <td>
        <button class="btn-delete-job" data-id="${job.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  wrapper.innerHTML = "";
  wrapper.appendChild(table);

  // View apps buttons
  wrapper.querySelectorAll(".btn-view-apps").forEach(btn => {
    btn.addEventListener("click", () => {
      renderApplicationsTable(btn.dataset.id, btn.dataset.title);
    });
  });

  // Delete buttons
  wrapper.querySelectorAll(".btn-delete-job").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!confirm("Delete this job posting?")) return;
      let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
      jobs = jobs.filter(j => j.id != btn.dataset.id);
      localStorage.setItem("jobs", JSON.stringify(jobs));
      updateStats();
      renderJobsTable();
    });
  });
}

function renderApplicationsTable(jobId, jobTitle) {
  const { apps } = loadData();
  const jobApps = apps.filter(a => a.jobId == jobId);

  const appsSection = document.getElementById("appsSection");
  const appsList = document.getElementById("appsList");
  document.getElementById("appsTitle").textContent = `Applications — ${jobTitle}`;

  appsSection.style.display = "block";
  appsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (jobApps.length === 0) {
    appsList.innerHTML = `<div class="empty-table">No applications yet for this role.</div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "dash-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Portfolio</th>
        <th>Applied On</th>
        <th>Cover Letter</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  jobApps.forEach(app => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-title">${app.name}</td>
      <td><a href="mailto:${app.email}" style="color:var(--accent)">${app.email}</a></td>
      <td>${app.phone || '—'}</td>
      <td>${app.portfolio ? `<a href="${app.portfolio}" target="_blank" style="color:var(--accent)">View →</a>` : '—'}</td>
      <td>${formatDate(app.appliedAt)}</td>
      <td style="max-width:240px;white-space:normal;font-size:0.8rem;color:var(--text-muted)">${app.message.slice(0, 100)}${app.message.length > 100 ? '…' : ''}</td>
    `;
    tbody.appendChild(tr);
  });

  appsList.innerHTML = "";
  appsList.appendChild(table);
}

// Clear all jobs
document.getElementById("clearJobs").addEventListener("click", () => {
  if (!confirm("Clear ALL job postings? This cannot be undone.")) return;
  localStorage.removeItem("jobs");
  localStorage.removeItem("applications");
  updateStats();
  renderJobsTable();
});

// Back to jobs
document.getElementById("backToJobs").addEventListener("click", () => {
  document.getElementById("appsSection").style.display = "none";
});

// Init
updateStats();
renderJobsTable();
