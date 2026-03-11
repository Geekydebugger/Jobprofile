// ===== JOBIFY — script.js (index page) =====

const COMPANY_EMOJIS = {
  default: ['🏢','🚀','💡','🔷','⚡','🌐','🎯','🔵'],
  google: '🔵', amazon: '📦', microsoft: '🪟', meta: '🌀',
  apple: '🍎', netflix: '🎬', twitter: '🐦', uber: '🚗'
};

function getCompanyEmoji(company) {
  const key = company.toLowerCase().split(' ')[0];
  return COMPANY_EMOJIS[key] || COMPANY_EMOJIS.default[Math.floor(Math.random() * COMPANY_EMOJIS.default.length)];
}

function getJobTypeLabel(type) {
  const map = { fulltime: 'Full-Time', parttime: 'Part-Time', remote: 'Remote', contract: 'Contract' };
  return map[type] || 'Full-Time';
}

// Seed default jobs if none exist
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

if (jobs.length === 0) {
  jobs = [
    {
      id: Date.now() + 1,
      title: "Frontend Developer",
      company: "Google",
      location: "Bangalore",
      salary: "₹12L – ₹18L",
      skills: ["React", "JavaScript", "CSS"],
      description: "Build modern, accessible UI applications that reach billions of users worldwide.",
      type: "fulltime"
    },
    {
      id: Date.now() + 2,
      title: "Backend Developer",
      company: "Amazon",
      location: "Hyderabad",
      salary: "₹15L – ₹22L",
      skills: ["Node.js", "MongoDB", "AWS"],
      description: "Design scalable distributed backend systems that power global e-commerce.",
      type: "fulltime"
    },
    {
      id: Date.now() + 3,
      title: "Product Designer",
      company: "Figma",
      location: "Remote",
      salary: "₹18L – ₹28L",
      skills: ["Figma", "User Research", "Prototyping"],
      description: "Craft delightful product experiences for millions of designers across the globe.",
      type: "remote"
    },
    {
      id: Date.now() + 4,
      title: "DevOps Engineer",
      company: "Microsoft",
      location: "Pune",
      salary: "₹14L – ₹20L",
      skills: ["Docker", "Kubernetes", "CI/CD"],
      description: "Manage cloud infrastructure and build reliable deployment pipelines at scale.",
      type: "fulltime"
    }
  ];
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

const jobList = document.getElementById("jobList");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const jobCountEl = document.getElementById("jobCount");
const emptyState = document.getElementById("emptyState");

function renderJobs(filteredJobs) {
  jobList.innerHTML = "";
  emptyState.style.display = "none";

  if (filteredJobs.length === 0) {
    emptyState.style.display = "block";
    jobCountEl.textContent = "0 roles";
    return;
  }

  jobCountEl.textContent = `${filteredJobs.length} role${filteredJobs.length !== 1 ? 's' : ''}`;

  filteredJobs.forEach((job, i) => {
    const div = document.createElement("div");
    div.className = "job-card";
    div.style.animationDelay = `${i * 0.06}s`;

    const skills = Array.isArray(job.skills)
      ? job.skills
      : job.skills.split(",").map(s => s.trim());

    const emoji = getCompanyEmoji(job.company);
    const typeLabel = getJobTypeLabel(job.type);

    div.innerHTML = `
      <div class="card-top">
        <div class="company-logo">${emoji}</div>
        <span class="job-type-badge">${typeLabel}</span>
      </div>
      <h3>${job.title}</h3>
      <div class="job-meta">
        <span>${job.company}</span>
        <span class="dot"></span>
        <span>${job.location}</span>
      </div>
      ${job.salary ? `<div class="job-salary">${job.salary}</div>` : ''}
      <div class="job-skills">
        ${skills.map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')}
      </div>
      <p class="job-desc">${job.description}</p>
      <div class="card-actions">
        <a href="apply.html?id=${job.id}&title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}" class="btn-apply">Apply Now</a>
        <span class="btn-save" title="Save job">♡</span>
      </div>
    `;

    // Save toggle
    div.querySelector('.btn-save').addEventListener('click', function() {
      this.textContent = this.textContent === '♡' ? '♥' : '♡';
      this.style.color = this.textContent === '♥' ? 'var(--accent)' : '';
    });

    jobList.appendChild(div);
  });
}

function filterAndRender() {
  const query = searchInput.value.toLowerCase().trim();
  const type = filterType.value;

  const filtered = jobs.filter(job => {
    const matchesSearch = !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      (Array.isArray(job.skills) ? job.skills : job.skills.split(","))
        .some(s => s.toLowerCase().includes(query));

    const matchesType = !type || job.type === type;
    return matchesSearch && matchesType;
  });

  renderJobs(filtered);
}

searchInput.addEventListener("input", filterAndRender);
filterType.addEventListener("change", filterAndRender);

// Initial render
renderJobs(jobs);
