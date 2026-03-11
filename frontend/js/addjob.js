// ===== JOBIFY — addjob.js =====

document.getElementById("addJobForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title       = document.getElementById("title").value.trim();
  const company     = document.getElementById("company").value.trim();
  const location    = document.getElementById("location").value.trim();
  const salary      = document.getElementById("salary").value.trim();
  const type        = document.getElementById("type").value;
  const skillsRaw   = document.getElementById("skills").value;
  const description = document.getElementById("description").value.trim();

  const skills = skillsRaw.split(",").map(s => s.trim()).filter(Boolean);

  if (!title || !company || !location || !description || skills.length === 0) {
    alert("Please fill in all required fields.");
    return;
  }

  const newJob = {
    id: Date.now(),
    title, company, location, salary, type, skills, description
  };

  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  jobs.unshift(newJob); // add to front
  localStorage.setItem("jobs", JSON.stringify(jobs));

  // Show brief success then redirect
  const btn = document.querySelector(".btn-primary[type=submit]");
  btn.textContent = "✓ Job Published!";
  btn.style.background = "var(--success)";
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
});
