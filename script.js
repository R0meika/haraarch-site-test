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
