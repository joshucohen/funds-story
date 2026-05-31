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
/* STAGGER HELPERS */
/* ===================================================== */

function staggerChildren(parent, selector, className = "animate-rise", delay = 120) {
  if (!parent) return;

  const children = parent.querySelectorAll(selector);

  children.forEach((child, index) => {
    setTimeout(() => {
      child.classList.add(className);
    }, index * delay);
  });
}

function animateTimeline(panel) {
  if (!panel) return;

  const rows = panel.querySelectorAll(".timeline-row");

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

function animateAgreementLines(page) {
  if (!page) return;

  const lines = page.querySelectorAll(".agreement-line");

  lines.forEach((line, index) => {
    setTimeout(() => {
      line.classList.add("animate-rise");

      const note = line.querySelector(".pen-note");

      if (note) {
        setTimeout(() => {
          note.classList.add("visible");
        }, 450);
      }
    }, index * 220);
  });
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

      const popTargets = [
        "metric-card",
        "machine-card",
        "impact-metric",
        "scholarship-box",
        "fund-card",
        "restriction-panel",
        "agreement-page",
        "promise-node",
        "reality-column",
        "human-vignette"
      ];

      const shouldPop = popTargets.some(className =>
        el.classList.contains(className)
      );

      if (shouldPop) {
        el.classList.add("animate-pop");
      } else {
        el.classList.add("animate-rise");
      }

      /* --------------------------------------------- */
      /* METRIC COUNTING */
      /* --------------------------------------------- */

      const metricNumbers = el.querySelectorAll(
        ".metric-card strong, .machine-card strong, .impact-metric strong, .scholarship-box strong, .restriction-number strong"
      );

      metricNumbers.forEach(counter => {
        animateCounter(counter);
      });

      if (
        el.matches(
          ".metric-card strong, .machine-card strong, .impact-metric strong, .scholarship-box strong, .restriction-number strong"
        )
      ) {
        animateCounter(el);
      }

      /* --------------------------------------------- */
      /* TIMELINE */
      /* --------------------------------------------- */

      if (el.classList.contains("timeline-panel")) {
        animateTimeline(el);
      }

      /* --------------------------------------------- */
      /* PROCESS / ACTIVATION / STUDENT FLOW */
      /* --------------------------------------------- */

      if (el.classList.contains("process-card")) {
        staggerChildren(el, ".process-node", "animate-rise", 130);
      }

      if (el.classList.contains("activation-map")) {
        staggerChildren(el, "div", "animate-rise", 130);
      }

      if (el.classList.contains("student-flow")) {
        staggerChildren(el, ".student-row", "animate-rise", 130);
      }

      /* --------------------------------------------- */
      /* PROMISE FLOW */
      /* --------------------------------------------- */

      if (el.classList.contains("promise-flow")) {
        staggerChildren(el, ".promise-node, .promise-arrow", "animate-rise", 160);
      }

      /* --------------------------------------------- */
      /* REALITY FLOW */
      /* --------------------------------------------- */

      if (el.classList.contains("reality-grid")) {
        staggerChildren(el, ".reality-column", "animate-pop", 160);
        staggerChildren(el, ".vertical-flow div, .vertical-flow span, .complex-flow div", "animate-rise", 90);
      }

      if (el.classList.contains("complex-flow")) {
        staggerChildren(el, "div", "animate-rise", 90);
      }

      /* --------------------------------------------- */
      /* AGREEMENT LINES + RED PEN NOTES */
      /* --------------------------------------------- */

      if (el.classList.contains("agreement-page")) {
        animateAgreementLines(el);
      }

      /* --------------------------------------------- */
      /* FUTURE GRID */
      /* --------------------------------------------- */

      if (el.classList.contains("future-grid")) {
        staggerChildren(el, "div", "animate-pop", 180);
      }

      motionObserver.unobserve(el);
    });
  },
  {
    threshold: 0.22,
    rootMargin: "0px 0px -10% 0px"
  }
);

/* ===================================================== */
/* REGISTER MOTION TARGETS */
/* ===================================================== */

document.querySelectorAll(`
  .metric-card,
  .machine-card,
  .restriction-panel,
  .fund-card,
  .agreement-page,
  .timeline-panel,
  .process-card,
  .activation-map,
  .student-flow,
  .impact-metric,
  .scholarship-box,
  .promise-flow,
  .promise-node,
  .reality-grid,
  .reality-column,
  .complex-flow,
  .human-vignette,
  .future-grid,
  .future-grid div
`).forEach(el => {
  motionObserver.observe(el);
});

/* ===================================================== */
/* SCROLL-LINKED EFFECTS */
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

  /* --------------------------------------------- */
  /* HERO DRIFT */
  /* --------------------------------------------- */

  const hero = document.querySelector(".hero-inner");

  if (hero) {
    const heroShift = Math.min(scrollTop * 0.028, 70);
    hero.style.transform = `translateY(${heroShift}px)`;
  }

  /* --------------------------------------------- */
  /* MACHINE CARD DEPTH */
  /* --------------------------------------------- */

  document.querySelectorAll(".machine-card").forEach((card) => {
    const rect = card.getBoundingClientRect();
    const viewport = window.innerHeight;

    const distanceFromCenter =
      Math.abs((rect.top + rect.height / 2) - viewport / 2);

    const focus =
      clamp(1 - distanceFromCenter / viewport, 0, 1);

    card.style.transform =
      `translateY(${(1 - focus) * 12}px) scale(${0.985 + focus * 0.015})`;

    card.style.opacity =
      `${0.72 + focus * 0.28}`;
  });

  /* --------------------------------------------- */
  /* AGREEMENT IMMERSION */
  /* --------------------------------------------- */

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
      `0 ${40 + visibleProgress * 28}px ${120 + visibleProgress * 46}px rgba(16,16,16,${0.14 + visibleProgress * 0.05})`;

    agreementPage.style.transform =
      `scale(${1 + visibleProgress * 0.006})`;
  }

  /* --------------------------------------------- */
  /* HUMAN VIGNETTE EMPHASIS */
  /* --------------------------------------------- */

  const humanVignette = document.querySelector(".human-vignette");

  if (humanVignette) {
    const rect = humanVignette.getBoundingClientRect();
    const viewport = window.innerHeight;

    const focus =
      clamp(1 - Math.abs(rect.top + rect.height / 2 - viewport / 2) / viewport, 0, 1);

    humanVignette.style.boxShadow =
      `0 ${30 + focus * 24}px ${90 + focus * 40}px rgba(16,16,16,${0.10 + focus * 0.05})`;
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