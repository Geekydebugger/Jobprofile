// ===== JOBIFY — apply.js =====

// Parse job details from URL
const params = new URLSearchParams(window.location.search);
const jobId       = params.get("id");
const jobTitle    = params.get("title") || "Job";
const jobCompany  = params.get("company") || "";
const jobLocation = params.get("location") || "";

// Show job preview card
const preview = document.getElementById("jobPreview");
if (jobTitle || jobCompany) {
  preview.classList.add("visible");
  preview.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;">
      <div style="width:40px;height:40px;border-radius:8px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🏢</div>
      <div>
        <h4>Applying for: ${jobTitle}</h4>
        <p>${jobCompany}${jobLocation ? ' · ' + jobLocation : ''}</p>
      </div>
    </div>
  `;
}

// Handle form submission
document.getElementById("applyForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name      = document.getElementById("name").value.trim();
  const email     = document.getElementById("email").value.trim();
  const phone     = document.getElementById("phone").value.trim();
  const portfolio = document.getElementById("portfolio").value.trim();
  const message   = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    alert("Please fill in all required fields.");
    return;
  }

  // Save application to localStorage
  const application = {
    id: Date.now(),
    jobId, jobTitle, jobCompany,
    name, email, phone, portfolio, message,
    appliedAt: new Date().toISOString()
  };

  const apps = JSON.parse(localStorage.getItem("applications")) || [];
  apps.push(application);
  localStorage.setItem("applications", JSON.stringify(apps));

  // Show success
  document.getElementById("applyForm").style.display = "none";
  if (preview) preview.style.display = "none";
  document.querySelector(".form-header").style.display = "none";
  document.getElementById("successMsg").style.display = "block";
});
