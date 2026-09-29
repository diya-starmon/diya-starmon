const DONOR_KEY = "hemamatch-donors";
const EMERGENCY_SEEN_KEY = "hemamatch-emergency-seen";

const bloodNeeds = [
  { type: "O-", level: "Critical" },
  { type: "O+", level: "High" },
  { type: "B+", level: "High" },
  { type: "A+", level: "Moderate" },
  { type: "A-", level: "Moderate" },
  { type: "B-", level: "Low" },
  { type: "AB+", level: "Low" },
  { type: "AB-", level: "Low" },
];

function getDonors() {
  return JSON.parse(localStorage.getItem(DONOR_KEY) || "[]");
}

function saveDonors(donors) {
  localStorage.setItem(DONOR_KEY, JSON.stringify(donors));
}

function setStatus(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
}

function renderBloodNeeds() {
  const grid = document.getElementById("blood-needs");
  if (!grid) return;
  grid.innerHTML = bloodNeeds
    .map(
      (item) => `
      <article class="blood-chip ${item.level === "Critical" || item.level === "High" ? "high" : ""}">
        <h3>${item.type}</h3>
        <p>${item.level} demand</p>
      </article>
    `
    )
    .join("");
}

function renderDonorCount() {
  const el = document.getElementById("donor-count");
  if (!el) return;
  el.textContent = String(128 + getDonors().length);
}

function renderDonorList() {
  const list = document.getElementById("donor-list");
  if (!list) return;
  const donors = getDonors();
  list.innerHTML = donors.length
    ? donors
        .map(
          (donor) =>
            `<li>${donor.name} · ${donor.bloodType} · ${donor.city}${donor.available ? " · available this week" : ""}</li>`
        )
        .join("")
    : "<li>No donors registered on this device yet.</li>";
}

function openEmergency() {
  const modal = document.getElementById("emergency-modal");
  if (!modal) return;
  modal.hidden = false;
  sessionStorage.setItem(EMERGENCY_SEEN_KEY, "1");
}

function closeEmergency() {
  const modal = document.getElementById("emergency-modal");
  if (!modal) return;
  modal.hidden = true;
}

function bindEmergency() {
  document.querySelectorAll("[data-open-emergency]").forEach((btn) => {
    btn.addEventListener("click", openEmergency);
  });
  document.querySelectorAll("[data-close-emergency]").forEach((btn) => {
    btn.addEventListener("click", closeEmergency);
  });
  const overlay = document.getElementById("emergency-modal");
  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) closeEmergency();
  });

  const form = document.getElementById("emergency-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    setStatus(
      "emergency-status",
      `Thank you, ${data.name}. Coordinators will call ${data.phone} about the O- request.`
    );
    form.reset();
  });
}

function bindRegistration() {
  const form = document.getElementById("donor-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const donors = getDonors();
    donors.push({
      name: data.name,
      age: data.age,
      bloodType: data.bloodType,
      city: data.city,
      phone: data.phone,
      email: data.email,
      available: Boolean(data.available),
    });
    saveDonors(donors);
    form.reset();
    renderDonorList();
    renderDonorCount();
    setStatus("register-status", "Registration saved on this device. Thank you for joining HemaMatch.");
  });
}

renderBloodNeeds();
renderDonorCount();
renderDonorList();
bindEmergency();
bindRegistration();

if (document.getElementById("blood-needs") && !sessionStorage.getItem(EMERGENCY_SEEN_KEY)) {
  window.setTimeout(openEmergency, 800);
}
