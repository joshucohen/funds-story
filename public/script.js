/* ===================================================== */
/* GLOBAL ELEMENTS */
/* ===================================================== */

const progressBar = document.getElementById("progress-bar");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let ticking = false;
let unknownRollerStarted = false;
let unknownRollerInterval = null;

/* ===================================================== */
/* HELPERS */
/* ===================================================== */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function interpolate(a, b, t) {
  return a + ((b - a) * t);
}

function getSectionProgress(section) {
  if (!section) return 0;

  const rect = section.getBoundingClientRect();
  const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);

  return clamp(-rect.top / scrollable, 0, 1);
}

function getViewportFocus(element, center = 0.5) {
  if (!element) return 0;

  const rect = element.getBoundingClientRect();
  const viewport = window.innerHeight;

  return clamp(
    1 - Math.abs(rect.top + rect.height * center - viewport / 2) / viewport,
    0,
    1
  );
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

  return { prefix, number, suffix, decimals };
}

/* ===================================================== */
/* COUNTER ANIMATION */
/* ===================================================== */

function animateCounter(element) {
  if (!element || element.dataset.counted === "true") return;
  if (element.classList.contains("rolling-unknown")) return;

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
      `${prefix}${current.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
      })}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent =
        `${prefix}${number.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })}${suffix}`;
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

function animateAgreementLines(page) {
  if (!page || page.dataset.linesAnimated === "true") return;

  page.dataset.linesAnimated = "true";

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

function animateFacilitatorPath(path) {
  if (!path || path.dataset.animated === "true") return;

  path.dataset.animated = "true";
  path.classList.add("visible");

  staggerChildren(path, ".facilitator-node", "animate-rise", 150);

  const lines = path.querySelectorAll(".facilitator-line");

  lines.forEach((line, index) => {
    setTimeout(() => {
      line.classList.add("draw-straight-line");
    }, 250 + index * 160);
  });
}

/* ===================================================== */
/* UNKNOWN ROLLING NUMBER */
/* ===================================================== */

function startUnknownRoller() {
  const roller = document.getElementById("rolling-unknown");
  if (!roller || unknownRollerStarted) return;
  if (prefersReducedMotion) return;

  unknownRollerStarted = true;

  const values = [
    "$2.7B",
    "$18.4B",
    "$7.9B",
    "$29.1B",
    "$11.6B",
    "$4.3B",
    "$21.8B",
    "$15.2B",
    "$9.5B",
    "$31.7B",
    "$6.1B",
    "$24.4B",
    "$??.?B"
  ];

  let index = 0;

  unknownRollerInterval = window.setInterval(() => {
    roller.textContent = values[index % values.length];
    index += 1;
  }, 92);
}

/* ===================================================== */
/* CAPITAL FUNNEL */
/* ===================================================== */

function updateCapitalFunnel() {
  const section = document.querySelector(".capital-funnel-scene");
  if (!section) return;

  const progress = getSectionProgress(section);
  const stages = section.querySelectorAll(".capital-stage");
  const arrows = section.querySelectorAll(".capital-arrow");
  const copySteps = section.querySelectorAll(".capital-copy-shift");

  stages.forEach((stage, index) => {
    const start = index / stages.length;
    const end = (index + 1) / stages.length;
    const local = clamp((progress - start) / (end - start), 0, 1);

    stage.classList.toggle("active", local > 0.10 && progress < end + 0.16);
    stage.classList.toggle("passed", progress > end + 0.04);

    stage.style.setProperty("--stage-progress", local.toFixed(3));
  });

  arrows.forEach((arrow, index) => {
    arrow.classList.toggle(
      "active",
      progress > (index + 0.44) / stages.length
    );
  });

  copySteps.forEach((copy, index) => {
    copy.classList.toggle("active", progress > 0.20 + index * 0.28);
  });

  section.style.setProperty("--capital-progress", progress.toFixed(3));
}

/* ===================================================== */
/* DISTRIBUTION BREAKDOWN */
/* ===================================================== */

function updateDistributionScene() {
  const section = document.querySelector(".distribution-scene");
  if (!section) return;

  const progress = getSectionProgress(section);
  const rows = section.querySelectorAll(".distribution-row");
  const callout = section.querySelector(".distribution-callout");

  section.style.setProperty("--distribution-progress", progress.toFixed(3));

  rows.forEach((row, index) => {
    const reveal = clamp(progress * 2.1 - index * 0.16, 0, 1);
    const focusStudent = progress > 0.54;

    row.style.setProperty("--row-progress", easeOutCubic(reveal).toFixed(3));
    row.classList.toggle("revealed", reveal > 0.08);

    const isScholarship = row.classList.contains("scholarships");
    row.classList.toggle("focused", focusStudent && isScholarship);
    row.classList.toggle("dimmed", focusStudent && !isScholarship);
  });

  if (callout) {
    callout.classList.toggle("visible", progress > 0.64);
  }
}

/* ===================================================== */
/* BLIND SPOT REVEAL */
/* ===================================================== */

function updateBlindspotScene() {
  const section = document.querySelector(".blindspot-scene");
  if (!section) return;

  const focus = getViewportFocus(section, 0.45);

  section.style.setProperty("--blindspot-focus", focus.toFixed(3));

  const knownCards = section.querySelectorAll(".known-card");
  const unknownCard = section.querySelector(".unknown-card");
  const punch = section.querySelector(".blindspot-punch");

  knownCards.forEach((card, index) => {
    card.classList.toggle("revealed", focus > 0.18 + index * 0.12);
  });

  if (unknownCard) {
    unknownCard.classList.toggle("revealed", focus > 0.48);
    unknownCard.classList.toggle("pulse", focus > 0.68);

    if (focus > 0.50) {
      startUnknownRoller();
    }
  }

  if (punch) {
    punch.classList.toggle("revealed", focus > 0.62);
  }
}

/* ===================================================== */
/* REAL PATHWAY */
/* ===================================================== */

function updateRealityPathway() {
  const section = document.querySelector(".enhanced-reality-scene");
  if (!section) return;

  const focus = getViewportFocus(section, 0.45);
  const steps = section.querySelectorAll(".pathway-step");
  const connectors = section.querySelectorAll(".pathway-connector");
  const meter = section.querySelector(".pathway-friction-meter");

  section.style.setProperty("--reality-focus", focus.toFixed(3));

  steps.forEach((step, index) => {
    step.classList.toggle("revealed", focus > 0.16 + index * 0.055);
  });

  connectors.forEach((connector, index) => {
    connector.classList.toggle("revealed", focus > 0.20 + index * 0.055);
  });

  if (meter) {
    meter.classList.toggle("animate-pop", focus > 0.66);
  }
}

/* ===================================================== */
/* FUND COMPLEXITY */
/* ===================================================== */

const fundOwners = [
  "Department",
  "Financial Aid",
  "Budget Officer",
  "Foundation",
  "Advancement",
  "Committee",
  "Back to Department"
];

function updateFundComplexity() {
  const section = document.querySelector(".fund-complexity-scene");
  if (!section) return;

  const progress = getSectionProgress(section);
  const focus = getViewportFocus(section, 0.45);
  const card = section.querySelector(".fund-complexity-card");
  const details = section.querySelectorAll(".fund-detail");
  const owner = document.getElementById("fund-owner-cycle");
  const typeStrip = section.querySelector(".fund-type-strip");
  const investigationItems = section.querySelectorAll(".investigation-list div");

  section.style.setProperty("--fund-progress", progress.toFixed(3));

  if (card) {
    card.classList.toggle("complex", focus > 0.28);
    card.classList.toggle("crowded", focus > 0.58);
  }

  details.forEach((detail, index) => {
    detail.classList.toggle("revealed", focus > 0.18 + index * 0.10);
  });

  investigationItems.forEach((item, index) => {
    item.classList.toggle("revealed", focus > 0.24 + index * 0.075);
  });

  if (owner) {
    const ownerIndex = clamp(
      Math.floor(focus * fundOwners.length),
      0,
      fundOwners.length - 1
    );

    if (owner.textContent !== fundOwners[ownerIndex]) {
      owner.textContent = fundOwners[ownerIndex];
      owner.classList.remove("owner-flip");

      requestAnimationFrame(() => {
        owner.classList.add("owner-flip");
      });
    }
  }

  if (typeStrip) {
    typeStrip.classList.toggle("revealed", focus > 0.70);
  }
}

/* ===================================================== */
/* MAZE JOURNEY CONFIG */
/* ===================================================== */

const mazeJourneyStops = [
  {
    x: 90,
    y: 680,
    label: "The department has one question: can we spend this?"
  },
  {
    x: 640,
    y: 560,
    label: "The budget officer sends the question to Financial Aid."
  },
  {
    x: 390,
    y: 820,
    label: "Financial Aid can award it only if criteria and process are clear."
  },
  {
    x: 700,
    y: 430,
    label: "Back to the budget officer. Still not solved."
  },
  {
    x: 1240,
    y: 230,
    label: "Foundation AP confirms the fund exists, but not the purpose."
  },
  {
    x: 1660,
    y: 610,
    label: "Foundation needs donor-intent context."
  },
  {
    x: 920,
    y: 720,
    label: "Advancement knows the donor story, not the awarding process."
  },
  {
    x: 1020,
    y: 1030,
    label: "Back to Financial Aid. Still need owner and selection process."
  },
  {
    x: 1580,
    y: 780,
    label: "Back to Foundation. Restriction still needs interpretation."
  },
  {
    x: 1500,
    y: 1200,
    label: "Back to the department. The question still is not answered."
  },
  {
    x: 540,
    y: 1180,
    label: "Policy enters the conversation: purpose, process, authority, documentation."
  },
  {
    x: 2050,
    y: 990,
    label: "Everyone helped. No one owns the outcome."
  }
];

function updateMazeJourney() {
  const section = document.querySelector(".maze-journey");
  const viewport = document.querySelector(".maze-viewport");
  const world = document.getElementById("maze-world");
  const path = document.querySelector(".maze-world-path");
  const nodes = document.querySelectorAll(".journey-node");
  const status = document.getElementById("journey-status-text");
  const questionCard = document.getElementById("journey-question-card");

  if (!section || !viewport || !world) return;

  const rawProgress = getSectionProgress(section);
  const segmentCount = mazeJourneyStops.length - 1;
  const journeyProgress = clamp(rawProgress, 0, 1);

  const exactIndex = journeyProgress * segmentCount;
  const currentIndex = Math.min(Math.floor(exactIndex), segmentCount - 1);
  const localProgress = exactIndex - currentIndex;

  const from = mazeJourneyStops[currentIndex];
  const to = mazeJourneyStops[currentIndex + 1];

  const eased = easeOutCubic(localProgress);

  let currentX = interpolate(from.x, to.x, eased);
  let currentY = interpolate(from.y, to.y, eased);

  if (rawProgress > 0.92) {
    currentX = mazeJourneyStops[mazeJourneyStops.length - 1].x;
    currentY = mazeJourneyStops[mazeJourneyStops.length - 1].y;
  }

  const viewportWidth = viewport.offsetWidth;
  const viewportHeight = viewport.offsetHeight;

  const worldWidth = 2600;
  const worldHeight = 1700;

  const translateX = clamp(
    (viewportWidth / 2) - currentX,
    viewportWidth - worldWidth,
    0
  );

  const translateY = clamp(
    (viewportHeight / 2) - currentY,
    viewportHeight - worldHeight,
    0
  );

  const panic =
    Math.sin(rawProgress * Math.PI * 22) *
    7 *
    (1 - rawProgress * 0.72);

  world.style.transform =
    `translate3d(${translateX + panic}px, ${translateY - panic}px, 0)`;

  if (path) {
    const pathDraw = clamp(rawProgress * 1.35, 0, 1);
    path.style.strokeDashoffset = `${4200 - (4200 * pathDraw)}`;
  }

  const visibleNodeIndex = rawProgress > 0.92
    ? mazeJourneyStops.length - 1
    : clamp(Math.round(exactIndex), 0, mazeJourneyStops.length - 1);

  nodes.forEach((node) => {
    const nodeStep = Number(node.dataset.step || 0);

    node.classList.toggle("active", nodeStep === visibleNodeIndex);
    node.classList.toggle("visited", nodeStep < visibleNodeIndex);
    node.classList.toggle("revealed", nodeStep <= visibleNodeIndex);
  });

  if (status) {
    status.textContent = mazeJourneyStops[visibleNodeIndex].label;
  }

  if (questionCard) {
    questionCard.classList.toggle("visible", rawProgress > 0.06 && rawProgress < 0.42);
    questionCard.classList.toggle("faded", rawProgress >= 0.42);
  }

  section.style.setProperty("--maze-progress", rawProgress.toFixed(3));
}

/* ===================================================== */
/* FACILITATOR SCROLLY */
/* ===================================================== */

function updateFacilitatorScene() {
  const section = document.querySelector(".facilitator-scene");
  if (!section) return;

  const progress = getSectionProgress(section);
  const focus = getViewportFocus(section, 0.45);

  section.style.setProperty("--facilitator-progress", progress.toFixed(3));
  section.style.setProperty("--facilitator-focus", focus.toFixed(3));

  const before = section.querySelector(".facilitator-before");
  const after = section.querySelector(".facilitator-after");
  const center = section.querySelector(".facilitator-center");
  const networkNodes = section.querySelectorAll(".network-node");
  const path = section.querySelector(".facilitator-path");

  if (before) {
    before.classList.toggle("faded", progress > 0.44);
  }

  if (after) {
    after.classList.toggle("active", progress > 0.48);
  }

  if (center) {
    center.classList.toggle("visible", progress > 0.34);
  }

  networkNodes.forEach((node, index) => {
    node.classList.toggle("active", progress > 0.18 + index * 0.08);
  });

  if (path && progress > 0.64) {
    animateFacilitatorPath(path);
  }
}

/* ===================================================== */
/* INDUSTRY GAP + INACTIVITY */
/* ===================================================== */

function updateIndustryGapScene() {
  const section = document.querySelector(".industry-gap-scene");
  if (!section) return;

  const focus = getViewportFocus(section, 0.45);

  section.style.setProperty("--industry-focus", focus.toFixed(3));

  const stat = section.querySelector(".conference-stat");
  if (stat) stat.classList.toggle("active", focus > 0.35);
}

function updateInactivityScene() {
  const section = document.querySelector(".inactivity-scene");
  if (!section) return;

  const focus = getViewportFocus(section, 0.45);

  section.style.setProperty("--inactivity-focus", focus.toFixed(3));

  const archetypes = section.querySelectorAll(".archetype-card");
  archetypes.forEach((card, index) => {
    card.classList.toggle("revealed", focus > 0.22 + index * 0.12);
  });

  const signals = section.querySelectorAll(".risk-signal-grid div");
  signals.forEach((signal, index) => {
    signal.classList.toggle("revealed", focus > 0.38 + index * 0.045);
  });
}

/* ===================================================== */
/* DIAGNOSTIC SCROLLYTELLING */
/* ===================================================== */

const diagnosticStates = [
  {
    label: "Watchlist",
    copy: "One weak year is a prompt to watch, not enough to classify the fund.",
    status: ""
  },
  {
    label: "Inactive signal",
    copy: "Three consecutive years without expense activity moves the fund into review.",
    status: "underspent"
  },
  {
    label: "Underspent",
    copy: "Spending stayed below half of available balance for three years.",
    status: "underspent"
  },
  {
    label: "Underspent",
    copy: "Annual distributions kept arriving, but less than half was spent for three years.",
    status: "underspent"
  },
  {
    label: "Review queue",
    copy: "The next question is operational: who can interpret, approve, and move the money?",
    status: "review"
  }
];

function updateDiagnosticScene() {
  const section = document.querySelector(".diagnostic-scene");
  if (!section) return;

  const progress = getSectionProgress(section);
  const stateIndex = clamp(
    Math.floor(progress * diagnosticStates.length),
    0,
    diagnosticStates.length - 1
  );
  const activeRule = clamp(stateIndex, 0, 4);

  section.style.setProperty("--diagnostic-progress", progress.toFixed(3));

  section.querySelectorAll(".diagnostic-copy-step").forEach((copy, index) => {
    copy.classList.toggle("active", index === stateIndex);
  });

  section.querySelectorAll(".diagnostic-track").forEach((track) => {
    const rule = Number(track.dataset.diagnosticRule || 0);
    track.classList.toggle("active", rule <= activeRule && stateIndex > 0);
  });

  section.querySelectorAll(".diagnostic-rule-strip div").forEach((marker) => {
    const rule = Number(marker.dataset.diagnosticMarker || 0);
    marker.classList.toggle("active", stateIndex > 0 && rule === activeRule);
  });

  const state = diagnosticStates[stateIndex];
  const result = section.querySelector(".diagnostic-result");
  const label = document.getElementById("diagnostic-result-label");
  const copy = document.getElementById("diagnostic-result-copy");

  if (label) label.textContent = state.label;
  if (copy) copy.textContent = state.copy;

  if (result) {
    result.classList.toggle("underspent", state.status === "underspent");
    result.classList.toggle("review", state.status === "review");
  }
}

/* ===================================================== */
/* IMPACT SCROLLYTELLING */
/* ===================================================== */

function updateImpactScene() {
  const section = document.querySelector(".impact-scene");
  if (!section) return;

  const progress = getSectionProgress(section);
  const stateIndex = clamp(Math.floor(progress * 5), 0, 4);

  section.style.setProperty("--impact-progress", progress.toFixed(3));

  section.querySelectorAll(".impact-copy-step").forEach((copy, index) => {
    copy.classList.toggle("active", index === stateIndex);
  });

  section.querySelectorAll(".impact-flow-stage").forEach((stage) => {
    const step = Number(stage.dataset.impactStage || 0);
    stage.classList.toggle("active", stateIndex >= step);
  });

  const lines = section.querySelectorAll(".impact-flow-line");
  lines.forEach((line, index) => {
    line.classList.toggle("active", stateIndex >= index + 2);
  });

  const ratePanel = section.querySelector(".impact-rate-panel");
  const scholarshipPanel = section.querySelector(".impact-scholarship-panel");
  const translation = section.querySelector(".impact-translation");

  if (ratePanel) {
    ratePanel.classList.toggle("active", stateIndex >= 3);
  }

  if (scholarshipPanel) {
    scholarshipPanel.classList.toggle("active", stateIndex >= 4);
  }

  if (translation) {
    translation.classList.toggle("active", stateIndex >= 4);
  }
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
        "human-vignette",
        "known-card",
        "unknown-card",
        "fund-complexity-card",
        "fund-investigation-panel",
        "archetype-card",
        "conference-stat",
        "pathway-panel"
      ];

      const shouldPop = popTargets.some(className =>
        el.classList.contains(className)
      );

      if (shouldPop) {
        el.classList.add("animate-pop");
      } else {
        el.classList.add("animate-rise");
      }

      const metricNumbers = el.querySelectorAll(
        ".metric-card strong, .machine-card strong, .impact-metric strong, .scholarship-box strong, .restriction-number strong, .capital-stage strong, .known-card strong, .conference-stat strong, .fund-total strong, .fund-distribution strong"
      );

      metricNumbers.forEach(counter => {
        animateCounter(counter);
      });

      if (
        el.matches(
          ".metric-card strong, .machine-card strong, .impact-metric strong, .scholarship-box strong, .restriction-number strong, .capital-stage strong, .known-card strong, .conference-stat strong, .fund-total strong, .fund-distribution strong"
        )
      ) {
        animateCounter(el);
      }

      if (el.classList.contains("agreement-page")) {
        animateAgreementLines(el);
      }

      if (el.classList.contains("activation-map")) {
        staggerChildren(el, "div", "animate-rise", 130);
      }

      if (el.classList.contains("student-flow")) {
        staggerChildren(el, ".student-row", "animate-rise", 130);
      }

      if (el.classList.contains("promise-flow")) {
        staggerChildren(el, ".promise-node, .promise-arrow", "animate-rise", 160);
      }

      if (el.classList.contains("risk-signal-grid")) {
        staggerChildren(el, "div", "animate-rise", 55);
      }

      if (el.classList.contains("future-grid")) {
        staggerChildren(el, "div", "animate-pop", 180);
      }

      motionObserver.unobserve(el);
    });
  },
  {
    threshold: 0.2,
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
  .human-vignette,
  .facilitator-path,
  .future-grid,
  .future-grid div,
  .capital-stage,
  .known-card,
  .unknown-card,
  .fund-complexity-card,
  .fund-investigation-panel,
  .industry-gap-scene,
  .conference-stat,
  .archetype-card,
  .risk-signal-grid,
  .diagnostic-card,
  .diagnostic-rule-strip,
  .impact-translation,
  .pathway-panel
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

  const hero = document.querySelector(".hero-inner");

  if (hero) {
    const heroShift = Math.min(scrollTop * 0.028, 70);
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
      `0 ${40 + visibleProgress * 28}px ${120 + visibleProgress * 46}px rgba(16,16,16,${0.14 + visibleProgress * 0.05})`;

    agreementPage.style.transform =
      `scale(${1 + visibleProgress * 0.006})`;
  }

  updateCapitalFunnel();
  updateDistributionScene();
  updateBlindspotScene();
  updateRealityPathway();
  updateFundComplexity();
  updateMazeJourney();
  updateFacilitatorScene();
  updateIndustryGapScene();
  updateInactivityScene();
  updateDiagnosticScene();
  updateImpactScene();

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

if (!prefersReducedMotion) {
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
}

/* ===================================================== */
/* INITIALIZE */
/* ===================================================== */

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  updateScrollEffects();
});

window.addEventListener("resize", () => {
  updateScrollEffects();
});
