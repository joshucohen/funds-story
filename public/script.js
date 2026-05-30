/* ===================================================== */
/* GLOBAL ELEMENTS */
/* ===================================================== */

const progressBar = document.getElementById("progress-bar");

let ticking = false;

/* ===================================================== */
/* HELPERS */
/* ===================================================== */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function parseMetricText(text) {
  const clean = text.trim();

  const match = clean.match(/^([^0-9.-]*)([0-9,.]+(?:\.[0-9]+)?)(.*)$/);

  if (!match) return null;

  const prefix = match[1] || "";
  const number = parseFloat(match[2].replace(/,/g, ""));
  const suffix = match[3] || "";

  if (Number.isNaN(number)) return null;

  const decimals = match[2].includes(".")
    ? match[2].split(".")[1].length
    : 0;

  return {
    prefix,
    number,
    suffix,
    decimals
  };
}

/* ===================================================== */
/* COUNTER ANIMATION */
/* ===================================================== */

function animateCounter(element) {
  if (!element || element.dataset.counted === "true") return;

  const parsed = parseMetricText(element.textContent);

  if (!parsed) return;

  element.dataset.counted = "true";

  const { prefix, number, suffix, decimals } = parsed;

  const duration = 1400;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = clamp(elapsed / duration, 0, 1);
    const eased = easeOutCubic(progress);

    const current = number * eased;

    element.textContent =
      `${prefix}${current.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent =
        `${prefix}${number.toFixed(decimals)}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}

/* ===================================================== */
/* INTERSECTION-BASED MOTION */
/* ===================================================== */

const motionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      el.classList.add("in-view");

      if (
        el.classList.contains("metric-card") ||
        el.classList.contains("impact-metric") ||
        el.classList.contains("scholarship-box") ||
        el.classList.contains("fund-card") ||
        el.classList.contains("restriction-panel") ||
        el.classList.contains("agreement-page")
      ) {
        el.classList.add("animate-pop");
      } else {
        el.classList.add("animate-rise");
      }

      const metricNumbers = el.querySelectorAll(
        ".metric-card strong, .impact-metric strong, .scholarship-box strong, .restriction-number strong"
      );

      metricNumbers.forEach(counter => {
        animateCounter(counter);
      });

      if (el.classList.contains("timeline-panel")) {
        const rows = el.querySelectorAll(".timeline-row");

        rows.forEach((row, rowIndex) => {
          setTimeout(() => {
            row.classList.add("animate-rise");

            const bars = row.querySelectorAll("i");

            bars.forEach((bar, barIndex) => {
              setTimeout(() => {
                bar.classList.add("animate-fill");
              }, barIndex * 120);
            });
          }, rowIndex * 180);
        });
      }

      if (
        el.classList.contains("process-card") ||
        el.classList.contains("activation-map") ||
        el.classList.contains("student-flow")
      ) {
        const children = el.querySelectorAll(
          ".process-node, .activation-map div, .student-row"
        );

        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add("animate-rise");
          }, index * 130);
        });
      }

      motionObserver.unobserve(el);
    });
  },
  {
    threshold: 0.25,
    rootMargin: "0px 0px -10% 0px"
  }
);

/* ===================================================== */
/* REGISTER MOTION TARGETS */
/* ===================================================== */

document.querySelectorAll(`
  .metric-card,
  .restriction-panel,
  .fund-card,
  .agreement-page,
  .timeline-panel,
  .process-card,
  .activation-map,
  .student-flow,
  .impact-metric,
  .scholarship-box
`).forEach(el => {
  motionObserver.observe(el);
});

/* ===================================================== */
/* SCROLL EFFECTS */
/* ===================================================== */

function updateScrollEffects() {
  const scrollTop = window.scrollY;

  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    docHeight > 0
      ? (scrollTop / docHeight) * 100
      : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  const hero = document.querySelector(".hero-inner");

  if (hero) {
    const heroShift = Math.min(scrollTop * 0.035, 80);
    hero.style.transform = `translateY(${heroShift}px)`;
  }

  const agreementScene = document.querySelector(".agreement-scene");
  const agreementPage = document.querySelector(".agreement-page");

  if (agreementScene && agreementPage) {
    const rect = agreementScene.getBoundingClientRect();
    const viewport = window.innerHeight;

    const visibleProgress = clamp(
      1 - Math.abs(rect.top) / viewport,
      0,
      1
    );

    agreementPage.style.boxShadow =
      `0 ${40 + visibleProgress * 25}px ${120 + visibleProgress * 40}px rgba(16,16,16,${0.14 + visibleProgress * 0.04})`;
  }

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
});

/* ===================================================== */
/* FREEZE SCENE PULSE */
/* ===================================================== */

document.querySelectorAll(".path-line.broken").forEach(line => {
  line.animate(
    [
      { opacity: 0.42 },
      { opacity: 0.95 },
      { opacity: 0.42 }
    ],
    {
      duration: 2600,
      iterations: Infinity,
      easing: "ease-in-out"
    }
  );
});

/* ===================================================== */
/* INITIALIZE */
/* ===================================================== */

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  updateScrollEffects();
});