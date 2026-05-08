(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".site-header__toggle");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const setActive = (hash) => {
    navLinks.forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === hash);
    });
  };

  const getHeaderOffset = () => {
    if (!header) return 96;
    const rect = header.getBoundingClientRect();
    return Math.ceil(rect.height + 24);
  };

  const syncScrollOffset = () => {
    const offset = getHeaderOffset();
    document.documentElement.style.setProperty("--scroll-offset", `${offset}px`);
  };

  syncScrollOffset();

  // Mobile menu toggle
  if (header && toggle) {
    const desktopBreakpoint = window.matchMedia("(min-width: 901px)");

    const setExpanded = (expanded) => {
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      toggle.setAttribute("aria-label", expanded ? "Close menu" : "Open menu");
      header.classList.toggle("is-open", expanded);
    };

    setExpanded(false);

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      setExpanded(!expanded);
    });

    navLinks.forEach((a) => {
      a.addEventListener("click", () => setExpanded(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setExpanded(false);
    });

    document.addEventListener("click", (e) => {
      if (!header.contains(e.target)) setExpanded(false);
    });

    desktopBreakpoint.addEventListener("change", (e) => {
      if (e.matches) setExpanded(false);
    });
  }

  // Active section highlighting + accurate hash scrolling
  const sectionIds = ["home", "about", "work", "skills", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const updateActiveByScroll = () => {
    if (!sections.length) return;
    const offset = getHeaderOffset();
    let activeSection = sections[0];

    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top;
      if (top - offset <= 0) activeSection = section;
    });

    setActive(`#${activeSection.id}`);
  };

  const scrollToHash = (hash, smooth = true) => {
    if (!hash || !hash.startsWith("#")) return;
    const target = document.querySelector(hash);
    if (!target) return;

    const offset = getHeaderOffset();
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: smooth ? "smooth" : "auto",
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      history.replaceState(null, "", href);
      scrollToHash(href, true);
      setActive(href);
    });
  });

  if (sections.length) {
    let ticking = false;
    const requestUpdateActive = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveByScroll();
        ticking = false;
      });
    };

    window.addEventListener("scroll", requestUpdateActive, { passive: true });
    window.addEventListener("resize", () => {
      syncScrollOffset();
      requestUpdateActive();
    });

    if (window.location.hash) {
      setTimeout(() => scrollToHash(window.location.hash, false), 0);
    }

    updateActiveByScroll();
  }

  // Skills modals (Development, Design, etc.)
  const modalTriggers = Array.from(document.querySelectorAll("[data-modal-target]"));
  const modalCloseBtns = Array.from(document.querySelectorAll("[data-modal-close]"));
  let currentModal = null;
  let currentTrigger = null;

  const setModalOpen = (modal, trigger, open) => {
    if (!modal || !trigger) return;
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const closeCurrentModal = () => {
    if (!currentModal || !currentTrigger) return;
    setModalOpen(currentModal, currentTrigger, false);
    currentModal = null;
    currentTrigger = null;
    document.body.style.overflow = "";
  };

  modalTriggers.forEach((trigger) => {
    const target = trigger.getAttribute("data-modal-target");
    if (!target) return;
    const modal = document.querySelector(target);
    if (!modal) return;

    const openModal = () => {
      if (currentModal && currentModal !== modal) closeCurrentModal();
      currentModal = modal;
      currentTrigger = trigger;
      setModalOpen(modal, trigger, true);
      document.body.style.overflow = "hidden";
    };

    trigger.addEventListener("click", openModal);
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal();
      }
    });
  });

  modalCloseBtns.forEach((btn) => {
    btn.addEventListener("click", () => closeCurrentModal());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCurrentModal();
  });
})();
