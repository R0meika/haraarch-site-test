const projectNavItems = [
  {
    href: "kushchevka.html",
    title: "Частный жилой дом",
    meta: "350 м² | Ростов-на-Дону",
    status: "В реализации",
  },
  {
    href: "voronezh.html",
    title: "Частный жилой дом",
    meta: "150 м² | Воронеж",
    status: "В реализации",
  },
  {
    href: "sydney-city.html",
    title: "Квартира ЖК Сидней Сити",
    meta: "65 м² | Москва",
    status: "В разработке",
  },
  {
    href: "dacha-shale.html",
    title: "Загородный дом",
    meta: "200 м² | Истра",
    status: "В разработке",
  },
  {
    href: "dom.html",
    title: "Эскизный проект дома",
    meta: "170 м² | Московская область",
    status: "В реализации",
  },
  {
    href: "almaty-reconstruction.html",
    title: "Реконструкция кафе",
    meta: "140 м² | Алматы",
    status: "В разработке",
  },
];

const buildIntroOverlay = () => {
  const isHomePage = Boolean(document.getElementById("home")) && !document.querySelector(".project-page-main");
  const params = new URLSearchParams(window.location.search);
  const forceIntro = params.get("intro") === "1";
  const skipIntro = params.get("intro") === "0";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const storageKey = "haraIntroSeen";
  let introSeen = false;

  try {
    introSeen = sessionStorage.getItem(storageKey) === "true";
  } catch (error) {
    introSeen = false;
  }

  if (!isHomePage || skipIntro || (!forceIntro && (reducedMotion || introSeen))) {
    return;
  }

  const createIntroSvg = (layout) => {
    const greekLetters = ["χ", "α", "ρ", "ά"];
    const russianLetters = ["Х", "А", "Р", "А"];
    const rowDelayStart = 90;
    const columnDelayStart = 900;
    const rowDelayStep = 160;
    const columnDelayStep = 170;
    const axisSegmentStep = 34;
    const greekCircleDelayBase = 9;
    const russianCircleDelayBase = 13;
    const greekLetterDelayBase = 17;
    const russianLetterDelayBase = 21;
    const dimensionDelay = 25;
    const captionDelay = 27;

    const axisLine = (className, x1, y1, x2, y2, delay) =>
      `<line class="intro-line intro-axis ${className}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="animation-delay: ${delay}ms" />`;
    const axisDot = (cx, cy, delay) =>
      `<circle class="intro-axis-dot" cx="${cx}" cy="${cy}" r="${layout.dotR}" style="animation-delay: ${delay}ms" />`;
    const makeAxisStepper = (startDelay) => {
      let step = 0;
      const nextDelay = () => startDelay + step++ * axisSegmentStep;

      return {
        line: (className, x1, y1, x2, y2) => axisLine(className, x1, y1, x2, y2, nextDelay()),
        dot: (cx, cy) => axisDot(cx, cy, nextDelay()),
      };
    };
    const segmentedRange = (start, end, fixed, next, orientation) => {
      const mid = (start + end) / 2;
      const firstEnd = mid - layout.dotGap;
      const secondStart = mid + layout.dotGap;

      if (orientation === "h") {
        return [
          next.line("intro-h", start, fixed, firstEnd, fixed),
          next.dot(mid, fixed),
          next.line("intro-h", secondStart, fixed, end, fixed),
        ].join("");
      }

      return [
        next.line("intro-v", fixed, start, fixed, firstEnd),
        next.dot(fixed, mid),
        next.line("intro-v", fixed, secondStart, fixed, end),
      ].join("");
    };
    const buildHorizontalAxis = (y, index) => {
      const next = makeAxisStepper(rowDelayStart + index * rowDelayStep);
      const parts = [next.line("intro-h", layout.leftX, y, layout.cols[0] - layout.nodeArm, y)];

      layout.cols.forEach((x, columnIndex) => {
        parts.push(next.line("intro-h intro-axis-node", x - layout.nodeArm, y, x + layout.nodeArm, y));

        if (columnIndex < layout.cols.length - 1) {
          parts.push(segmentedRange(x + layout.nodeArm, layout.cols[columnIndex + 1] - layout.nodeArm, y, next, "h"));
        }
      });
      parts.push(next.line("intro-h", layout.cols[layout.cols.length - 1] + layout.nodeArm, y, layout.gridEndX, y));

      return parts.join("");
    };
    const buildVerticalAxis = (x, index) => {
      const next = makeAxisStepper(columnDelayStart + index * columnDelayStep);
      const parts = [next.line("intro-v", x, layout.gridTopY, x, layout.rows[0] - layout.nodeArm)];

      layout.rows.forEach((y, rowIndex) => {
        parts.push(next.line("intro-v intro-axis-node", x, y - layout.nodeArm, x, y + layout.nodeArm));

        if (rowIndex < layout.rows.length - 1) {
          parts.push(segmentedRange(y + layout.nodeArm, layout.rows[rowIndex + 1] - layout.nodeArm, x, next, "v"));
        }
      });
      parts.push(next.line("intro-v", x, layout.rows[layout.rows.length - 1] + layout.nodeArm, x, layout.bottomY));

      return parts.join("");
    };

    const horizontalAxes = layout.rows.map(buildHorizontalAxis).join("");
    const verticalAxes = layout.cols.map(buildVerticalAxis).join("");

    const greekMarks = layout.rows
      .map(
        (y, index) => `
          <g class="intro-mark intro-greek-mark" transform="translate(${layout.leftX} ${y})">
            <g>
              <circle class="intro-axis-bubble intro-delay-${greekCircleDelayBase + index}" r="${layout.r}" />
              <text class="intro-greek-letter intro-greek-letter-${index} intro-delay-${greekLetterDelayBase + index}">${greekLetters[index]}</text>
            </g>
          </g>`
      )
      .join("");

    const russianMarks = layout.cols
      .map((x, index) => {
        const delay = russianLetterDelayBase + index;
        const letter =
          index === 3
            ? `
              <text class="intro-brand-letter intro-brand-letter-main intro-delay-${delay}">А</text>
              <line class="intro-brand-prime intro-delay-${delay}" x1="${layout.primeX}" y1="${layout.primeY1}" x2="${layout.primeX}" y2="${layout.primeY2}" />`
            : `<text class="intro-brand-letter intro-delay-${delay}">${russianLetters[index]}</text>`;

        return `
          <g class="intro-mark intro-russian-mark" transform="translate(${x} ${layout.bottomY})">
            <circle class="intro-axis-bubble intro-delay-${russianCircleDelayBase + index}" r="${layout.r}" />
            ${letter}
          </g>`;
      })
      .join("");

    return `
      <svg class="hara-intro-drawing" viewBox="0 0 ${layout.width} ${layout.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="ХАРА">
        <g class="intro-composition">
          <g class="intro-grid">
            ${horizontalAxes}
            ${verticalAxes}
          </g>

          <g class="intro-left-marks">
            ${greekMarks}
          </g>

          <g class="intro-bottom-marks">
            ${russianMarks}
          </g>

          <g class="intro-dimension">
            <line class="intro-line intro-dim intro-dim-main intro-delay-${dimensionDelay}" x1="${layout.cols[0]}" y1="${layout.dimY}" x2="${layout.cols[3]}" y2="${layout.dimY}" />
            <line class="intro-line intro-dim intro-dim-vertical intro-delay-${dimensionDelay}" x1="${layout.cols[0]}" y1="${layout.dimY - layout.extension}" x2="${layout.cols[0]}" y2="${layout.dimY + layout.extension}" />
            <line class="intro-line intro-dim intro-dim-vertical intro-delay-${dimensionDelay}" x1="${layout.cols[3]}" y1="${layout.dimY - layout.extension}" x2="${layout.cols[3]}" y2="${layout.dimY + layout.extension}" />
            <line class="intro-line intro-dim intro-dim-tick intro-delay-${dimensionDelay + 1}" x1="${layout.cols[0] - layout.tick}" y1="${layout.dimY + layout.tick}" x2="${layout.cols[0] + layout.tick}" y2="${layout.dimY - layout.tick}" />
            <line class="intro-line intro-dim intro-dim-tick intro-delay-${dimensionDelay + 1}" x1="${layout.cols[3] - layout.tick}" y1="${layout.dimY + layout.tick}" x2="${layout.cols[3] + layout.tick}" y2="${layout.dimY - layout.tick}" />
            <rect class="intro-caption-mask intro-delay-${captionDelay - 1}" x="${layout.captionMaskX}" y="${layout.captionMaskY}" width="${layout.captionMaskWidth}" height="${layout.captionMaskHeight}" />
            <text class="intro-caption intro-delay-${captionDelay}" x="${layout.captionX}" y="${layout.captionY}"${layout.captionLength ? ` textLength="${layout.captionLength}" lengthAdjust="spacingAndGlyphs"` : ""}>Архитектурная и дизайн-практика</text>
          </g>
        </g>
      </svg>
    `;
  };

  const intro = document.createElement("div");
  intro.className = `hara-intro${reducedMotion ? " is-reduced" : ""}`;
  intro.setAttribute("role", "dialog");
  intro.setAttribute("aria-label", "Вход на сайт ХАРА");
  const isCompactIntro = window.matchMedia("(max-width: 760px)").matches;
  const desktopLayout = {
    width: 1000,
    height: 650,
    rows: [132, 232, 332, 432],
    cols: [310, 460, 610, 760],
    leftX: 168,
    gridTopY: 78,
    gridEndX: 850,
    bottomY: 578,
    dimY: 500,
    captionY: 486,
    captionX: 535,
    captionLength: 338,
    captionMaskX: 362,
    captionMaskY: 470,
    captionMaskWidth: 346,
    captionMaskHeight: 26,
    r: 32,
    nodeArm: 22,
    dotGap: 7,
    dotR: 0.85,
    extension: 18,
    tick: 7,
    primeX: 16,
    primeY1: -29,
    primeY2: -15,
  };
  const mobileLayout = {
    width: 470,
    height: 470,
    rows: [92, 145, 198, 251],
    cols: [121, 197, 273, 349],
    leftX: 70,
    gridTopY: 58,
    gridEndX: 412,
    bottomY: 342,
    dimY: 303,
    captionY: 291,
    captionX: 235,
    captionLength: 198,
    captionMaskX: 133,
    captionMaskY: 277,
    captionMaskWidth: 204,
    captionMaskHeight: 20,
    r: 18,
    nodeArm: 10,
    dotGap: 4,
    dotR: 0.55,
    extension: 11,
    tick: 4.5,
    primeX: 9,
    primeY1: -16,
    primeY2: -8,
  };

  intro.innerHTML = `
    ${createIntroSvg(isCompactIntro ? mobileLayout : desktopLayout)}
    <div class="intro-final" aria-hidden="true">
      <div class="intro-final-lockup">
        <p class="intro-final-brand" aria-label="ХАРА́">
          <span class="intro-final-word" aria-hidden="true">ХАРА<span class="intro-final-accent"></span></span>
        </p>
        <p class="intro-final-practice">архитектурная и дизайн-практика</p>
        <span class="intro-final-measure" aria-hidden="true">
          <span class="intro-final-measure-line"></span>
          <span class="intro-final-measure-tick intro-final-measure-tick-left"></span>
          <span class="intro-final-measure-tick intro-final-measure-tick-right"></span>
        </span>
        <p class="intro-final-greek">χαρά</p>
      </div>
    </div>
    <button class="intro-enter" type="button">Войти</button>
  `;

  document.body.classList.add("hara-intro-active");
  document.body.append(intro);

  let isClosed = false;
  let removeTimer = null;

  const closeIntro = () => {
    if (isClosed) {
      return;
    }

    isClosed = true;
    window.clearTimeout(removeTimer);
    try {
      sessionStorage.setItem(storageKey, "true");
    } catch (error) {
      // Private browsing or locked storage should not block the site.
    }
    intro.classList.add("is-exiting");
    document.body.classList.remove("hara-intro-active");
    removeTimer = window.setTimeout(() => intro.remove(), 720);
  };

  const consumeIntroTap = (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeIntro();
  };

  const blockIntroClickThrough = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  intro.addEventListener("pointerdown", consumeIntroTap, { capture: true });
  intro.addEventListener("click", blockIntroClickThrough, { capture: true });
  window.addEventListener("keydown", closeIntro, { once: true });
  window.addEventListener("wheel", closeIntro, { once: true, passive: true });
  window.addEventListener("touchmove", closeIntro, { once: true, passive: true });
};

const buildProjectIndex = () => {
  const projectMain = document.querySelector(".project-page-main");
  const shell = document.querySelector(".site-shell");

  if (!projectMain || !shell) {
    return;
  }

  document.body.classList.add("has-project-index");

  const currentFile = window.location.pathname.split("/").pop() || "";
  const projectIndex = document.createElement("aside");
  projectIndex.className = "project-index";
  projectIndex.setAttribute("aria-label", "Навигация по проектам");
  projectIndex.innerHTML = `
    <div class="project-index-block project-index-block--primary">
      <p class="project-index-title">Другие проекты</p>
      <nav class="project-index-list">
        ${projectNavItems
          .filter((item) => item.href !== currentFile)
          .map((item) => {
            const isCurrent = item.href === currentFile;
            return `
              <a class="project-index-link${isCurrent ? " is-current" : ""}" href="${item.href}"${isCurrent ? ' aria-current="page"' : ""}>
                <span>
                  ${item.title}
                  <small>${item.meta} | ${item.status}</small>
                </span>
              </a>
            `;
          })
          .join("")}
      </nav>
    </div>
    <nav class="project-index-block project-index-menu" aria-label="Разделы бюро">
      <a href="../index.html#works">Все проекты</a>
      <a href="#practice">Практика</a>
      <a href="../index.html#contact">Контакт</a>
    </nav>
  `;

  shell.insertBefore(projectIndex, projectMain);

  const list = projectIndex.querySelector(".project-index-list");
  const currentLink = projectIndex.querySelector(".project-index-link.is-current");

  if (list && currentLink) {
    const centerCurrentProject = () => {
      list.scrollLeft = currentLink.offsetLeft - (list.clientWidth - currentLink.clientWidth) / 2;
    };

    window.requestAnimationFrame(centerCurrentProject);
    window.addEventListener("load", centerCurrentProject, { once: true });
  }

  const projectSwitcher = document.createElement("nav");
  projectSwitcher.className = "project-switcher";
  projectSwitcher.setAttribute("aria-label", "Другие проекты");
  projectSwitcher.innerHTML = `
    <p class="project-switcher-title">Другие проекты</p>
    <div class="project-switcher-list">
      ${projectNavItems
        .filter((item) => item.href !== currentFile)
        .map(
          (item) => `
            <a class="project-switcher-link" href="${item.href}">
              <span>${item.title}</span>
              <small>${item.meta} | ${item.status}</small>
            </a>
          `
        )
        .join("")}
    </div>
  `;

  projectMain.append(projectSwitcher);
};

const buildMobileServiceNav = () => {
  const shell = document.querySelector(".site-shell");
  const topbar = document.querySelector(".topbar");
  const projectMain = document.querySelector(".project-page-main");

  if (!shell || !topbar || projectMain || document.querySelector(".mobile-service-nav")) {
    return;
  }

  const serviceNav = document.createElement("nav");
  serviceNav.className = "mobile-service-nav";
  serviceNav.setAttribute("aria-label", "Разделы практики");
  serviceNav.innerHTML = `
    <span>Архитектура</span>
    <span>Дизайн</span>
  `;

  topbar.insertAdjacentElement("afterend", serviceNav);
};

const buildPracticePanel = () => {
  const projectMain = document.querySelector(".project-page-main");
  const footer = document.querySelector(".footer");

  if (!projectMain || !footer || document.querySelector(".practice-panel")) {
    return;
  }

  const panel = document.createElement("section");
  panel.className = "practice-panel";
  panel.id = "practice";
  panel.setAttribute("aria-label", "Информация о практике");
  panel.innerHTML = `
    <div>
      <p class="practice-panel-label">Практика</p>
      <p>ХАРА работает с частными домами, жилыми интерьерами и камерными общественными пространствами.</p>
    </div>
    <div>
      <p class="practice-panel-label">Подход</p>
      <p>В основе проекта - пропорция, ясная структура, свет и сдержанная материальность.</p>
    </div>
    <div>
      <p class="practice-panel-label">Контакт</p>
      <p>Москва<br><a href="tel:+79281181850">+7 928 118 18 50</a></p>
    </div>
  `;

  footer.parentNode.insertBefore(panel, footer);
};

buildIntroOverlay();
buildMobileServiceNav();
buildProjectIndex();
buildPracticePanel();

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const yearNode = document.getElementById("current-year");
const topbar = document.querySelector(".topbar");
const infoBar = document.querySelector(".info-bar");
const projectGalleries = document.querySelectorAll(".project-gallery");
const lightboxGalleries = document.querySelectorAll(".project-gallery, .realization-gallery, .realization-gallery--single");
const draggableGalleries = document.querySelectorAll(".project-gallery, .realization-gallery, .realization-gallery--single");

const syncStickyHeights = () => {
  const root = document.documentElement;
  root.style.setProperty("--topbar-height", `${topbar?.offsetHeight || 0}px`);
  root.style.setProperty("--info-bar-height", `${infoBar?.offsetHeight || 0}px`);
};

let stickyHeightsFrame = null;

const queueStickyHeights = () => {
  if (stickyHeightsFrame !== null) {
    return;
  }

  stickyHeightsFrame = window.requestAnimationFrame(() => {
    stickyHeightsFrame = null;
    syncStickyHeights();
  });
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, progress) => start + (end - start) * progress;
const easeScrollProgress = (progress) => progress * progress * (3 - 2 * progress);

const resetMobileTopbarVars = () => {
  if (!topbar) {
    return;
  }

  [
    "--topbar-progress",
    "--topbar-brand-size",
    "--topbar-brand-scale-x",
    "--topbar-brand-line-height",
    "--topbar-padding-top",
    "--topbar-padding-bottom",
    "--topbar-gap",
    "--topbar-bg-alpha",
  ].forEach((property) => topbar.style.removeProperty(property));
};

const syncTopbarState = () => {
  if (!topbar) {
    return;
  }

  const isMobile = window.matchMedia("(max-width: 760px)").matches;

  if (!isMobile) {
    topbar.classList.toggle("is-compact", window.scrollY > 28);
    resetMobileTopbarVars();
    queueStickyHeights();
    return;
  }

  const rawProgress = clamp((window.scrollY - 8) / 130, 0, 1);
  const progress = easeScrollProgress(rawProgress);
  const viewportWidth = Math.min(window.innerWidth || 375, document.documentElement.clientWidth || 375);
  const startSize = clamp(viewportWidth * 0.082, 30, 36);
  const endSize = clamp(viewportWidth * 0.19, 64, 80);

  topbar.classList.toggle("is-compact", progress > 0.98);
  topbar.style.setProperty("--topbar-progress", progress.toFixed(4));
  topbar.style.setProperty("--topbar-brand-size", `${lerp(startSize, endSize, progress).toFixed(2)}px`);
  topbar.style.setProperty("--topbar-brand-scale-x", lerp(1, 1.14, progress).toFixed(4));
  topbar.style.setProperty("--topbar-brand-line-height", lerp(0.9, 0.8, progress).toFixed(4));
  topbar.style.setProperty("--topbar-padding-top", `${lerp(12, 6, progress).toFixed(2)}px`);
  topbar.style.setProperty("--topbar-padding-bottom", `${lerp(10, 7, progress).toFixed(2)}px`);
  topbar.style.setProperty("--topbar-gap", `${lerp(5, 0, progress).toFixed(2)}px`);
  topbar.style.setProperty("--topbar-bg-alpha", lerp(0.62, 0.86, progress).toFixed(3));
  queueStickyHeights();
};

const classifyGalleryItems = () => {
  projectGalleries.forEach((gallery) => {
    gallery.querySelectorAll("figure").forEach((item) => {
      const image = item.querySelector("img");

      if (!image?.naturalWidth || !image?.naturalHeight) {
        return;
      }

      const ratio = image.naturalWidth / image.naturalHeight;
      item.classList.remove("gallery-item--landscape", "gallery-item--portrait", "gallery-item--square");

      if (ratio > 1.15) {
        item.classList.add("gallery-item--landscape");
      } else if (ratio < 0.9) {
        item.classList.add("gallery-item--portrait");
      } else {
        item.classList.add("gallery-item--square");
      }
    });
  });
};

const ensureGalleryShell = (gallery) => {
  if (gallery.classList.contains("project-gallery--single") || gallery.dataset.controlsReady === "true") {
    return;
  }

  const shell = document.createElement("div");
  shell.className = "project-gallery-shell";

  const controls = document.createElement("div");
  controls.className = "project-gallery-controls";

  const prevButton = document.createElement("button");
  prevButton.className = "project-gallery-control";
  prevButton.type = "button";
  prevButton.textContent = "<";
  prevButton.setAttribute("aria-label", "Предыдущий рендер");

  const nextButton = document.createElement("button");
  nextButton.className = "project-gallery-control";
  nextButton.type = "button";
  nextButton.textContent = ">";
  nextButton.setAttribute("aria-label", "Следующий рендер");

  controls.append(prevButton, nextButton);
  gallery.parentNode.insertBefore(shell, gallery);
  shell.append(controls, gallery);

  const scrollStep = () => Math.max(gallery.clientWidth * 0.82, 320);

  prevButton.addEventListener("click", () => {
    gallery.scrollBy({ left: -scrollStep(), behavior: "smooth" });
  });

  nextButton.addEventListener("click", () => {
    gallery.scrollBy({ left: scrollStep(), behavior: "smooth" });
  });

  gallery.dataset.controlsReady = "true";
};

const enableDragScroll = (gallery) => {
  if (gallery.dataset.dragReady === "true") {
    return;
  }

  let isPointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let hasMoved = false;

  gallery.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
      return;
    }

    isPointerDown = true;
    hasMoved = false;
    startX = event.clientX;
    startScrollLeft = gallery.scrollLeft;
    gallery.classList.add("is-dragging");
  });

  gallery.addEventListener("mousemove", (event) => {
    if (!isPointerDown) {
      return;
    }

    const delta = event.clientX - startX;

    if (Math.abs(delta) > 6) {
      hasMoved = true;
      gallery.scrollLeft = startScrollLeft - delta;
    }
  });

  const stopDragging = () => {
    if (!isPointerDown) {
      return;
    }

    isPointerDown = false;
    gallery.classList.remove("is-dragging");

    if (hasMoved) {
      gallery.dataset.dragMoved = "true";
      window.setTimeout(() => {
        gallery.dataset.dragMoved = "false";
      }, 0);
    }
  };

  gallery.addEventListener("mouseup", stopDragging);
  gallery.addEventListener("mouseleave", stopDragging);
  gallery.addEventListener("dragstart", (event) => event.preventDefault());

  gallery.dataset.dragReady = "true";
};

const createLightbox = () => {
  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="gallery-lightbox-stage">
      <div class="gallery-lightbox-top">
        <button class="gallery-lightbox-button gallery-lightbox-close" type="button" aria-label="Закрыть">x</button>
      </div>
      <div class="gallery-lightbox-frame">
        <button class="gallery-lightbox-button gallery-lightbox-prev" type="button" aria-label="Предыдущий рендер"><</button>
        <img class="gallery-lightbox-image" alt="">
        <button class="gallery-lightbox-button gallery-lightbox-next" type="button" aria-label="Следующий рендер">></button>
      </div>
      <p class="gallery-lightbox-caption"></p>
    </div>
  `;

  document.body.append(lightbox);
  return lightbox;
};

const lightbox = createLightbox();
const lightboxImage = lightbox.querySelector(".gallery-lightbox-image");
const lightboxCaption = lightbox.querySelector(".gallery-lightbox-caption");
const lightboxClose = lightbox.querySelector(".gallery-lightbox-close");
const lightboxPrev = lightbox.querySelector(".gallery-lightbox-prev");
const lightboxNext = lightbox.querySelector(".gallery-lightbox-next");
const lightboxFrame = lightbox.querySelector(".gallery-lightbox-frame");

let activeGalleryItems = [];
let activeGalleryIndex = 0;
let lightboxPointerId = null;
let lightboxStartX = 0;
let lightboxStartY = 0;
let lightboxTouchId = null;
let lightboxTouchStartX = 0;
let lightboxTouchStartY = 0;

const renderLightboxItem = () => {
  const current = activeGalleryItems[activeGalleryIndex];

  if (!current) {
    return;
  }

  const image = current.querySelector("img");

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || "";
  lightboxCaption.textContent = "";
};

const openLightbox = (items, index) => {
  activeGalleryItems = items;
  activeGalleryIndex = index;
  renderLightboxItem();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

const stepLightbox = (direction) => {
  if (!activeGalleryItems.length) {
    return;
  }

  activeGalleryIndex = (activeGalleryIndex + direction + activeGalleryItems.length) % activeGalleryItems.length;
  renderLightboxItem();
};

const stepLightboxFromSwipe = (deltaX, deltaY) => {
  if (Math.abs(deltaX) < 46 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
    return false;
  }

  stepLightbox(deltaX < 0 ? 1 : -1);
  return true;
};

const startLightboxSwipe = (event) => {
  if (!lightbox.classList.contains("is-open") || event.pointerType !== "pen") {
    return;
  }

  lightboxPointerId = event.pointerId;
  lightboxStartX = event.clientX;
  lightboxStartY = event.clientY;
  lightboxFrame.setPointerCapture?.(event.pointerId);
};

const finishLightboxSwipe = (event) => {
  if (lightboxPointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - lightboxStartX;
  const deltaY = event.clientY - lightboxStartY;
  lightboxPointerId = null;

  stepLightboxFromSwipe(deltaX, deltaY);
};

const startLightboxTouchSwipe = (event) => {
  if (!lightbox.classList.contains("is-open")) {
    return;
  }

  const touch = event.changedTouches[0];

  if (!touch) {
    return;
  }

  lightboxTouchId = touch.identifier;
  lightboxTouchStartX = touch.clientX;
  lightboxTouchStartY = touch.clientY;
};

const finishLightboxTouchSwipe = (event) => {
  if (lightboxTouchId === null) {
    return;
  }

  const touch = Array.from(event.changedTouches).find((item) => item.identifier === lightboxTouchId);

  if (!touch) {
    return;
  }

  const deltaX = touch.clientX - lightboxTouchStartX;
  const deltaY = touch.clientY - lightboxTouchStartY;
  lightboxTouchId = null;

  if (stepLightboxFromSwipe(deltaX, deltaY)) {
    event.preventDefault();
  }
};

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

syncStickyHeights();
syncTopbarState();
classifyGalleryItems();
window.addEventListener("resize", syncStickyHeights);
window.addEventListener("resize", syncTopbarState);
window.addEventListener("resize", classifyGalleryItems);
window.addEventListener("load", syncStickyHeights);
window.addEventListener("load", syncTopbarState);
window.addEventListener("load", classifyGalleryItems);
window.addEventListener("scroll", syncTopbarState, { passive: true });

if (document.fonts?.ready) {
  document.fonts.ready.then(syncStickyHeights);
  document.fonts.ready.then(classifyGalleryItems);
}

projectGalleries.forEach((gallery) => {
  ensureGalleryShell(gallery);

  gallery.querySelectorAll("img").forEach((image) => {
    if (image.complete) {
      classifyGalleryItems();
      return;
    }

    image.addEventListener("load", classifyGalleryItems, { once: true });
  });
});

lightboxGalleries.forEach((gallery) => {
  const items = Array.from(gallery.querySelectorAll("figure"));

  items.forEach((item, index) => {
    item.tabIndex = 0;

    item.addEventListener("click", (event) => {
      if (gallery.dataset.dragMoved === "true") {
        event.preventDefault();
        gallery.dataset.dragMoved = "false";
        return;
      }

      openLightbox(items, index);
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(items, index);
      }
    });
  });
});

draggableGalleries.forEach((gallery) => {
  enableDragScroll(gallery);
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", () => stepLightbox(-1));
lightboxNext.addEventListener("click", () => stepLightbox(1));
lightboxFrame.addEventListener("pointerdown", startLightboxSwipe);
lightboxFrame.addEventListener("pointerup", finishLightboxSwipe);
lightboxFrame.addEventListener("pointercancel", () => {
  lightboxPointerId = null;
});
lightboxFrame.addEventListener("touchstart", startLightboxTouchSwipe, { passive: true });
lightboxFrame.addEventListener("touchend", finishLightboxTouchSwipe);
lightboxFrame.addEventListener("touchcancel", () => {
  lightboxTouchId = null;
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    stepLightbox(-1);
  }

  if (event.key === "ArrowRight") {
    stepLightbox(1);
  }
});
