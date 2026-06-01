import { translations } from "../data/content.js";

const defaultLanguage = "ru";
const storageKey = "vtf-language";
const readModeKey = "vtf-read-mode";
let currentLanguage = localStorage.getItem(storageKey) || defaultLanguage;
let currentReadMode = localStorage.getItem(readModeKey) || "full";

const renderList = (selector, items, template) => {
  const node = document.querySelector(selector);
  if (!node) return;
  node.innerHTML = items.map(template).join("");
};

const getByPath = (object, path) =>
  path.split(".").reduce((accumulator, key) => accumulator?.[key], object);

const currentBundle = () => translations[currentLanguage] || translations[defaultLanguage];

const updateReadModeButtons = () => {
  document.querySelectorAll("[data-read-mode-button]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.readModeButton === currentReadMode);
  });
};

const setReadMode = (mode) => {
  currentReadMode = mode === "short" ? "short" : "full";
  localStorage.setItem(readModeKey, currentReadMode);
  document.body.dataset.readMode = currentReadMode;
  updateReadModeButtons();
};

const openExternalLink = (href) => {
  if (!href || href.startsWith("#")) return;

  if (href.startsWith("mailto:")) {
    window.location.href = href;
    return;
  }

  const opened = window.open(href, "_blank", "noopener,noreferrer");

  if (opened) {
    opened.opener = null;
  } else {
    window.location.href = href;
  }
};

const getContactIcon = (type) => {
  const icons = {
    telegram: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.2 4.2 3.9 10.5c-1.1.4-1.1 1 .2 1.4l4.2 1.3 1.6 5.1c.2.6.3.8.7.8.3 0 .5-.1.8-.4l2.3-2.2 4.7 3.5c.9.5 1.5.3 1.7-.8l2.8-13.2c.3-1.3-.4-1.9-1.7-1.4Z" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>
        <path d="m8.6 13 8.8-5.8-6.8 6.7-.3 3.2" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    social: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.2" fill="none" stroke="currentColor" stroke-width="1.55"/>
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" stroke-width="1.55"/>
        <circle cx="17.1" cy="6.9" r="1" fill="currentColor"/>
      </svg>
    `,
    mail: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="6" width="16" height="12" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.55"/>
        <path d="m5.5 7.5 6.5 5 6.5-5" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    link: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M10 14 7.8 16.2a3.1 3.1 0 1 1-4.4-4.4L5.6 9.6" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="m14 10 2.2-2.2a3.1 3.1 0 1 1 4.4 4.4L18.4 14.4" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="m8.8 15.2 6.4-6.4" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
      </svg>
    `
  };

  return icons[type] || icons.link;
};

const applyStaticTranslations = () => {
  const bundle = currentBundle();
  const ui = bundle.ui;

  document.documentElement.lang = currentLanguage;
  document.title = bundle.meta.pageTitle;

  const metaDescription = document.querySelector("[data-meta-description]");
  if (metaDescription) {
    metaDescription.setAttribute("content", bundle.meta.description);
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = getByPath(ui, node.dataset.i18n);
    if (typeof value === "string") {
      node.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    const value = getByPath(ui, node.dataset.i18nAlt);
    if (typeof value === "string") {
      node.setAttribute("alt", value);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const value = getByPath(ui, node.dataset.i18nAriaLabel);
    if (typeof value === "string") {
      node.setAttribute("aria-label", value);
    }
  });

  const pageTitleNode = document.querySelector("[data-page-title]");
  if (pageTitleNode) {
    pageTitleNode.textContent = bundle.meta.pageTitle;
  }
};

const renderDynamicContent = () => {
  const { content, ui } = currentBundle();

  renderList(
    "[data-proof-strip]",
    content.proofPills,
    ({ title, text }) => `
      <article class="proof-pill glass3d">
        <strong>${title}</strong>
        <span>${text}</span>
      </article>
    `
  );

  renderList(
    "[data-business-grid]",
    content.businessCards,
    ({ tag, title, problem, result }) => `
      <article class="business-card glass3d reveal">
        <p class="business-card__tag">${tag}</p>
        <h3>${title}</h3>
        <p>${problem}</p>
        <p class="business-card__result">${result}</p>
      </article>
    `
  );

  renderList(
    "[data-role-pills]",
    ui.manifest.roles,
    (item) => `<span class="role-pill">${item}</span>`
  );

  renderList(
    "[data-discipline-grid]",
    content.disciplines,
    ({ tag, title, text }) => `
      <article class="discipline-card glass3d reveal">
        <span class="discipline-card__index">${tag}</span>
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `
  );

  renderList(
    "[data-cases-grid]",
    content.caseStudies,
    ({ accent, meta, title, summary, impact, stack, highlights, ctaLabel, url }) => `
      <article class="case-card case-card--${accent} glass3d reveal">
        <p class="case-card__meta">${meta}</p>
        <h3>${title}</h3>
        <p>${summary}</p>
        <div class="case-card__impact">${impact}</div>
        <div class="case-card__stack">
          ${stack.map((item) => `<span>${item}</span>`).join("")}
        </div>
        <div class="case-card__highlights">
          ${highlights.map((item) => `<span>${item}</span>`).join("")}
        </div>
        ${
          url
            ? `<div class="case-card__actions">
                <a class="button button--ghost case-card__link" href="${url}">
                  ${ctaLabel}
                </a>
              </div>`
            : ""
        }
      </article>
    `
  );

  renderList(
    "[data-workflow-list]",
    content.workflow,
    ({ title, text }, index) => `
      <article class="workflow-card glass3d reveal">
        <span class="workflow-card__step">0${index + 1}</span>
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `
  );

  renderList(
    "[data-principle-list]",
    content.principles,
    ({ title, text }) => `
      <article class="principle-card glass3d reveal">
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `
  );

  renderList(
    "[data-video-grid]",
    content.videos,
    ({ youtubeId, title, meta, text }, index) => `
      <article class="video-card reveal">
        <a
          class="video-card__thumb video-card__thumb--tone-${(index % 2) + 1}"
          href="https://youtu.be/${youtubeId}"
          target="_blank"
          rel="noreferrer"
          aria-label="${ui.video.watchLabel}: ${title}"
        >
          <div class="video-card__art" aria-hidden="true">
            <span class="video-card__line video-card__line--a"></span>
            <span class="video-card__line video-card__line--b"></span>
            <span class="video-card__pulse"></span>
          </div>
          <span class="video-card__label">${meta}</span>
          <span class="video-card__play">${ui.video.watchLabel}</span>
        </a>
        <div class="video-card__body">
          <p class="video-card__meta">${meta}</p>
          <h3>${title}</h3>
          <p>${text}</p>
        </div>
      </article>
    `
  );

  renderList(
    "[data-food-pill-list]",
    content.foodPills,
    (item) => `<span>${item}</span>`
  );

  renderList(
    "[data-food-why-list]",
    ui.food.whyList,
    (item) => `<li>${item}</li>`
  );

  renderList(
    "[data-food-process-list]",
    ui.food.process,
    (item) => `<li>${item}</li>`
  );

  renderList(
    "[data-food-gallery]",
    content.foodGallery,
    ({ image, title, text }) => `
      <article class="food-shot">
        <img src="${image}" alt="${title}" loading="lazy" />
        <div class="food-shot__body">
          <h3>${title}</h3>
          <p>${text}</p>
        </div>
      </article>
    `
  );

  renderList(
    "[data-restaurant-comparison]",
    content.restaurantComparison,
    ({ title, points }) => `
      <article class="restaurant-comparison__card glass3d reveal">
        <h3>${title}</h3>
        <ul>
          ${points.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </article>
    `
  );

  renderList(
    "[data-restaurant-faq]",
    content.restaurantFaq,
    ({ title, text }) => `
      <article class="restaurant-faq__card glass3d reveal">
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `
  );

  renderList(
    "[data-campaign-grid]",
    content.campaignCards,
    ({ title, text }) => `
      <article class="editorial-mini glass3d">
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `
  );

  renderList(
    "[data-campaign-gallery]",
    content.campaignGallery,
    ({ image, title, text }) => `
      <article class="food-shot">
        <img src="${image}" alt="${title}" loading="lazy" />
        <div class="food-shot__body">
          <h3>${title}</h3>
          <p>${text}</p>
        </div>
      </article>
    `
  );

  renderList(
    "[data-garment-highlights]",
    content.garmentHighlights,
    (item) => `<span>${item}</span>`
  );

  renderList(
    "[data-garment-gallery]",
    content.garmentGallery,
    ({ image, title, text }) => `
      <article class="food-shot garment-shot">
        <img src="${image}" alt="${title}" loading="lazy" />
        <div class="food-shot__body">
          <h3>${title}</h3>
          <p>${text}</p>
        </div>
      </article>
    `
  );

  renderList(
    "[data-editorial-grid]",
    content.editorial,
    ({ title, text }) => `
      <article class="editorial-mini glass3d">
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `
  );

  renderList(
    "[data-contact-links]",
    content.contactLinks,
    ({ label, value, href, icon }) => `
      <a class="contact-link" href="${href}" target="_blank" rel="noreferrer" data-external-open>
        <span class="contact-link__top">
          <span class="contact-link__badge contact-link__badge--${icon || "link"}" aria-hidden="true">
            ${getContactIcon(icon)}
          </span>
          <span class="contact-link__caret" aria-hidden="true">↗</span>
        </span>
        <span class="contact-link__label">${label}</span>
        <span class="contact-link__value">${value}</span>
      </a>
    `
  );

  document.querySelectorAll(".contact-link").forEach((link) => {
    if (link.getAttribute("href")?.startsWith("mailto:")) {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  });

  renderList(
    "[data-system-code]",
    ui.systems.code,
    (item) => `<span>${item}</span>`
  );

  renderList(
    "[data-system-panels]",
    ui.systems.panels,
    ({ title, text }) => `
      <article>
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `
  );
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px"
  }
);

const observeRevealElements = () => {
  document.querySelectorAll(".reveal").forEach((node) => {
    if (node.dataset.revealBound === "true") return;
    node.dataset.revealBound = "true";
    revealObserver.observe(node);
  });
};

const updateLanguageButtons = () => {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === currentLanguage);
  });
};

const setLanguage = (language) => {
  currentLanguage = translations[language] ? language : defaultLanguage;
  localStorage.setItem(storageKey, currentLanguage);
  applyStaticTranslations();
  renderDynamicContent();
  observeRevealElements();
  updateLanguageButtons();
  updateReadModeButtons();
};

setLanguage(currentLanguage);
setReadMode(currentReadMode);

const sections = document.querySelectorAll(".section-observe");
const sceneObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.dataset.scene) {
      document.body.dataset.scene = visible.target.dataset.scene;
    }
  },
  {
    threshold: [0.2, 0.4, 0.7]
  }
);

sections.forEach((section) => sceneObserver.observe(section));

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll("a")) : [];

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    });
  });
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

document.querySelectorAll("[data-read-mode-button]").forEach((button) => {
  button.addEventListener("click", () => {
    setReadMode(button.dataset.readModeButton);
  });
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-external-open]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  event.preventDefault();
  openExternalLink(href);
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const preloader = document.querySelector("[data-preloader]");

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
  });
}

const bindDialog = (dialogSelector, openerSelector, closerSelector) => {
  const dialog = document.querySelector(dialogSelector);
  const openers = Array.from(document.querySelectorAll(openerSelector));
  const closer = document.querySelector(closerSelector);

  if (!dialog || !openers.length || !closer) return;

  openers.forEach((opener) => {
    opener.addEventListener("click", () => dialog.showModal());
  });

  closer.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!inside) {
      dialog.close();
    }
  });
};

bindDialog("[data-editorial-modal]", "[data-open-editorial]", "[data-close-editorial]");
bindDialog("[data-food-modal]", "[data-open-food]", "[data-close-food]");
bindDialog("[data-campaign-modal]", "[data-open-campaign]", "[data-close-campaign]");
bindDialog("[data-garment-modal]", "[data-open-garments]", "[data-close-garment]");

if (preloader) {
  const startedAt = performance.now();
  const minimumVisible = prefersReducedMotion ? 360 : 3180;

  const finishPreloader = () => {
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, minimumVisible - elapsed);

    window.setTimeout(() => {
      preloader.classList.add("is-hidden");
      document.body.classList.remove("is-preloading");
      window.setTimeout(() => {
        preloader.remove();
      }, 900);
    }, remaining);
  };

  if (document.readyState === "complete") {
    finishPreloader();
  } else {
    window.addEventListener("load", finishPreloader, { once: true });
  }
}
