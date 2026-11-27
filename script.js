const form = document.getElementById("signupForm");
const fields = {
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  emailAddress: document.getElementById("emailAddress"),
  interestType: document.getElementById("interestType"),
  availability: document.getElementById("availability"),
  experience: document.getElementById("experience"),
  shortMsg: document.getElementById("shortMsg"),
};
const infoPanel = document.getElementById("infoPanel");
const counter = document.getElementById("counter");
const confirmation = document.getElementById("confirmation");
const dashboard = document.getElementById("dashboard");

const MAX_CHARS = 200;

//Each interest type has a corresponding info panel message and prompt for the Experience field
const interestTypeInfo = {
  volunteer: {
    info: "Volunteers help with walks, cleaning, and events. About 4 hours a week.",
    prompt:
      "Have you worked with animals before? If so, please describe your experience.",
    next: "We'll email you open shift times.",
  },
  foster: {
    info: "Fosters house an animal for 2-8 weeks. We provide food, supplies, and vet care.",
    prompt: "Have you fostered animals before? Any other pets at home?",
    next: "A coordinator will contact you about a home check",
  },
  adoption: {
    info: "Adopters complete an application and a meet-and-greet.",
    prompt:
      "What pets have you had in the past? What are you looking for in a pet?",
    next: "we'll send you animal's profiles that match your preferences.",
  },
};

// ---------- Helpers ----------
function todayString() {
  //returns min date to validate availability field
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseLocalDate(str) {
  // turns string date into an object
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysUntil(str) {
  // returns how many days from today a date is.
  const today = parseLocalDate(todayString());
  return Math.round((parseLocalDate(str) - today) / 86400000);
}

function escapeHTML(s) {
  // prevents XSS attacks by escaping HTML characters
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function loadSignups() {
  //reads signups from localStorage
  try {
    return JSON.parse(localStorage.getItem("signups")) || [];
  } catch {
    return [];
  }
}

// ---------- Validation ----------
// Each validator returns an error message, or "" when the value is valid.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validators = {
  firstName(v) {
    v = v.trim();
    if (!v) return "Please enter your first name.";
    if (v.length < 2) return "First name must be at least 2 characters.";
    return "";
  },
  lastName(v) {
    v = v.trim();
    if (!v) return "Please enter your last name.";
    if (v.length < 2) return "Last name must be at least 2 characters.";
    return "";
  },
  emailAddress(v) {
    v = v.trim();
    if (!v) return "Please enter your email address.";
    if (!emailPattern.test(v))
      return "Enter a valid email, like name@example.com.";
    return "";
  },
  interestType(v) {
    return v ? "" : "Please choose Volunteer, Foster, or Adoption.";
  },
  availability(v) {
    if (!v) return "Please pick the date you're available from.";
    if (v < todayString()) return "Availability can't be in the past.";
    return "";
  },
  experience(v) {
    // Optional, but if filled in it must be meaningful.
    v = v.trim();
    if (v && v.length < 10)
      return "Please add a little more detail (10+ characters) or leave blank.";
    return "";
  },
  shortMsg(v) {
    if (v.length > MAX_CHARS)
      return `Message must be ${MAX_CHARS} characters or fewer.`;
    return "";
  },
};

function showError(name, message) {
  const field = fields[name];
  const errorEl = document.getElementById(`${name}-error`);
  errorEl.textContent = message;
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateField(name) {
  const message = validators[name](fields[name].value);
  showError(name, message);
  return message === "";
}

// ---------- Dynamic behavior ----------
// Selection: update info panel + Experience placeholder.
fields.interestType.addEventListener("change", () => {
  const p = interestTypeInfo[fields.interestType.value];
  if (p) {
    infoPanel.innerHTML = `<strong>${escapeHTML(fields.interestType.value)}:</strong> ${escapeHTML(p.info)}`;
    fields.experience.placeholder = p.prompt;
  } else {
    infoPanel.innerHTML = "";
    fields.experience.placeholder = "";
  }
});

// Input: live character counter.
fields.shortMsg.addEventListener("input", () => {
  const len = fields.shortMsg.value.length;
  counter.textContent = `${len} / ${MAX_CHARS}`;
  counter.style.color = len > MAX_CHARS ? "#b00020" : "";
});

// Prevent past dates in the picker as well.
fields.availability.min = todayString();

// Validate on blur; once a field shows an error, re-check as the user types
// so they can fix it without restarting the form.
Object.keys(fields).forEach((name) => {
  const field = fields[name];
  field.addEventListener("blur", () => validateField(name));
  const liveEvent = field.tagName === "SELECT" ? "change" : "input";
  field.addEventListener(liveEvent, () => {
    if (field.classList.contains("invalid")) validateField(name);
  });
});

//---------- Dashboard ----------
function renderDashboard() {
  const all = loadSignups();
  if (!all.length) {
    dashboard.innerHTML = "";
    return;
  }
  const tally = { volunteer: 0, foster: 0, adoption: 0 };
  all.forEach((s) => {
    tally[s.interestType]++;
  });

  const max = Math.max(...Object.values(tally));

  const bars = Object.entries(tally)
    .map(
      ([k, v]) =>
        `<div class="row"><span>${k}</span>
           <div class="bar" style="width:${max ? (v / max) * 200 : 0}px"></div>
           <span>${v}</span></div>`,
    )
    .join("");

  // Soonest availability first.
  const sorted = [...all].sort((a, b) =>
    a.availability.localeCompare(b.availability),
  );
  const cards = sorted
    .map((s) => {
      const d = daysUntil(s.availability);
      const when =
        d <= 0
          ? "available now"
          : d === 1
            ? "available tomorrow"
            : `available in ${d} days`;
      return `<div class="card"><strong>${escapeHTML(s.firstName)} ${escapeHTML(s.lastName)}</strong>
                 (${escapeHTML(s.interestType)}) &ndash; ${when}</div>`;
    })
    .join("");

  dashboard.innerHTML = `<h2>Community Sign-Ups (${all.length})</h2>${bars}<h3>Who's available soonest</h3>${cards}`;
}

// ---------- Submit ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validate every field and collect the failures.
  const results = Object.keys(fields).map((name) => ({
    name,
    ok: validateField(name),
  }));
  const firstBad = results.find((r) => !r.ok);
  if (firstBad) {
    confirmation.textContent = "";
    fields[firstBad.name].focus();
    return; // invalid: stop here, nothing is saved
  }

  const entry = {
    firstName: fields.firstName.value.trim(),
    lastName: fields.lastName.value.trim(),
    email: fields.emailAddress.value.trim(),
    interestType: fields.interestType.value,
    availability: fields.availability.value,
    experience: fields.experience.value.trim(),
    shortMsg: fields.shortMsg.value.trim(),
  };

  const all = loadSignups();
  all.push(entry);
  localStorage.setItem("signups", JSON.stringify(all));

  confirmation.innerHTML = `Thanks, ${escapeHTML(entry.firstName)}! ${escapeHTML(interestTypeInfo[entry.interestType].next)}`;

  form.reset();
  Object.keys(fields).forEach((name) => showError(name, ""));
  infoPanel.innerHTML = "";
  fields.experience.placeholder = "";
  counter.textContent = `0 / ${MAX_CHARS}`;
  renderDashboard();
});

renderDashboard();
