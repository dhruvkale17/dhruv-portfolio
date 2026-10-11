const root = document.documentElement;
const header = document.querySelector(".site-header");
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-links a")];
const trackedActions = [...document.querySelectorAll("[data-track]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function trackRecruiterAction(eventName, label) {
  if (typeof gtag !== "function") return;

  gtag("event", eventName, {
    event_category: "recruiter_action",
    event_label: label
  });
}

trackedActions.forEach((action) => {
  action.addEventListener("click", () => {
    trackRecruiterAction(action.dataset.track, action.dataset.trackLabel);
  });
});

// Header border once the page scrolls
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Active nav link
const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] }
);

sections.forEach((section) => navObserver.observe(section));

// Count-up numbers
function countUp(el) {
  const target = Number(el.dataset.count);
  if (reduceMotion || !target) return;

  const start = performance.now();
  const duration = 1100;

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

// Reveal on scroll
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      entry.target.querySelectorAll("[data-count]").forEach(countUp);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Theme toggle
const themeToggle = document.querySelector(".theme-toggle");

themeToggle.addEventListener("click", () => {
  const current =
    root.dataset.theme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";

  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch (e) {}
});

// Copy email
const copyButton = document.querySelector(".copy-email");

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.email);
    copyButton.textContent = "Copied!";
  } catch (e) {
    window.location.href = `mailto:${copyButton.dataset.email}`;
    return;
  }

  trackRecruiterAction("email_copy", "contact_copy_email");
  setTimeout(() => {
    copyButton.textContent = "Copy email";
  }, 1800);
});

document.querySelector(".year").textContent = new Date().getFullYear();
