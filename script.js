const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-links a")];
const trackedActions = [...document.querySelectorAll("[data-track]")];

function trackRecruiterAction(eventName, label) {
  if (typeof gtag !== "function") return;

  gtag("event", eventName, {
    event_category: "recruiter_action",
    event_label: label
  });
}

const observer = new IntersectionObserver(
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

sections.forEach((section) => observer.observe(section));

trackedActions.forEach((action) => {
  action.addEventListener("click", () => {
    trackRecruiterAction(action.dataset.track, action.dataset.trackLabel);
  });
});
