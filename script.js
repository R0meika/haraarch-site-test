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

let activeGalleryItems = [];
let activeGalleryIndex = 0;

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

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

syncStickyHeights();
classifyGalleryItems();
window.addEventListener("resize", syncStickyHeights);
window.addEventListener("resize", classifyGalleryItems);
window.addEventListener("load", syncStickyHeights);
window.addEventListener("load", classifyGalleryItems);

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
