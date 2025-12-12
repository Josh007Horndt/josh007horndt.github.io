// script.js
(function () {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth scrolling for in-page anchors (links like href="#section-id")
  function initSmoothScroll() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return; // Only intercept real in-page targets

      event.preventDefault();

      const header = document.querySelector(".site-header");
      const headerOffset = header ? header.offsetHeight + 8 : 0;

      const elementTop = targetEl.getBoundingClientRect().top + window.pageYOffset;
      const targetPosition = elementTop - headerOffset;

      if (prefersReducedMotion) {
        window.scrollTo(0, targetPosition);
      } else {
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  }

  // Scroll reveal animations using IntersectionObserver
  function initScrollReveal() {
    const elements = document.querySelectorAll(".reveal-on-scroll");
    if (!elements.length) return;

    // Respect reduced motion preference
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = el.dataset.delay || "0";
          if (delay) {
            el.style.transitionDelay = delay + "s";
          }

          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // Resume modal (resume.html)
  function initResumeModal() {
    const triggers = document.querySelectorAll(".resume-open-btn");
    const modal = document.getElementById("resumeModal");
    if (!modal || !triggers.length) return;

    const iframe = document.getElementById("resumeFrame");
    const closeBtn = document.getElementById("closeResumeBtn");
    const backdrop = modal.querySelector(".resume-modal__backdrop");
    const downloadLink = document.getElementById("resumeDownload");
    const titleEl = document.getElementById("resumeModalTitle");

    function openModal(src, title) {
      const url = encodeURI(src || "Resume/Analytics Resume.pdf");
      const heading = title || "Resume";

      iframe.src = url;
      if (downloadLink) downloadLink.href = url;
      if (titleEl) titleEl.textContent = heading;

      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("is-open");
      iframe.src = "";
      document.body.style.overflow = "";
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const src = btn.dataset.resumeSrc;
        const title = btn.dataset.resumeTitle;
        openModal(src, title);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  // Subtle 3D tilt effect for cards/images
  function initTilt(selector, maxTilt = 10) {
    const cards = document.querySelectorAll(selector);
    if (!cards.length) return;

    cards.forEach((card) => {
      let rect = card.getBoundingClientRect();

      function updateRect() {
        rect = card.getBoundingClientRect();
      }

      window.addEventListener("resize", updateRect);

      card.addEventListener("pointermove", (event) => {
        if (prefersReducedMotion) return;

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `
          perspective(800px)
          rotateX(${rotateX.toFixed(2)}deg)
          rotateY(${rotateY.toFixed(2)}deg)
          translateY(-2px)
        `;
        card.style.boxShadow = "0 18px 45px rgba(15, 23, 42, 0.8)";
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.style.boxShadow = "";
      });
    });
  }

  // Project report modal (PDF) on projects.html
  function initProjectReportModal() {
    const trigger = document.querySelector(".project-report-open-btn");
    const modal = document.getElementById("projectReportModal");
    if (!trigger || !modal) return;

    const iframe = document.getElementById("projectReportFrame");
    const closeBtn = document.getElementById("projectReportClose");
    const backdrop = modal.querySelector(".resume-modal__backdrop");
    const downloadLink = document.getElementById("projectReportDownload");
    const titleEl = document.getElementById("projectReportTitle");

    function openModal() {
      // If data-report-src is set on the button, use that; otherwise fall back
      const rawSrc =
        trigger.dataset.reportSrc ||
        "Project Report/Project Recruit Report (1).pdf";
    
      const base = rawSrc.trim();
      const url = encodeURI(base) + "#zoom=page-width"; // zoom to fit width
      const title = trigger.dataset.reportTitle || "Project Report";
    
      iframe.src = url;
      if (downloadLink) downloadLink.href = encodeURI(base); // raw PDF for download
      if (titleEl) titleEl.textContent = title;
    
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    

    function closeModal() {
      modal.classList.remove("is-open");
      iframe.src = "";
      document.body.style.overflow = "";
    }

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  // Project screenshots modal (4 PNGs) on projects.html
  function initProjectScreenshotsModal() {
    const trigger = document.querySelector(".project-screenshots-open-btn");
    const modal = document.getElementById("projectScreenshotsModal");
    if (!trigger || !modal) return;

    const imgEl = document.getElementById("projectScreenshotImage");
    const captionEl = document.getElementById("projectScreenshotCaption");
    const closeBtn = document.getElementById("projectScreenshotsClose");
    const backdrop = modal.querySelector(".resume-modal__backdrop");
    const prevBtn = document.getElementById("projectScreenshotPrev");
    const nextBtn = document.getElementById("projectScreenshotNext");

    let images = [];
    let currentIndex = 0;

    function showImage() {
      if (!images.length) return;
      imgEl.src = images[currentIndex];
      if (captionEl) {
        captionEl.textContent = `Screenshot ${currentIndex + 1} of ${
          images.length
        }`;
      }
    }

    function openModal() {
      const raw = trigger.dataset.images || "";
      images = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((path) => encodeURI(path)); // handle spaces in folder/file names

      if (!images.length) return;

      currentIndex = 0;
      showImage();

      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("is-open");
      imgEl.src = "";
      document.body.style.overflow = "";
    }

    function next() {
      if (!images.length) return;
      currentIndex = (currentIndex + 1) % images.length;
      showImage();
    }

    function prev() {
      if (!images.length) return;
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage();
    }

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);
    if (nextBtn) nextBtn.addEventListener("click", next);
    if (prevBtn) prevBtn.addEventListener("click", prev);

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSmoothScroll();
    initScrollReveal();
    // Add tilt to any element with class="tilt-card"
    initTilt(".tilt-card", 10);
    initResumeModal();
    initProjectReportModal();
    initProjectScreenshotsModal();
  });
})();
