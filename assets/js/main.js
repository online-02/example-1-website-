(function () {
  const toast = document.querySelector(".toast");

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const opened = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(opened));
    });
  }

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("open");
    });
  });

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        showToast("微信号已复制");
      } catch (error) {
        showToast("复制失败，请手动复制微信号");
      }
    });
  });

  const serviceSelect = document.querySelector("#service");
  if (serviceSelect) {
    const service = new URLSearchParams(window.location.search).get("service");
    if (service && serviceSelect.querySelector(`option[value="${service}"]`)) {
      serviceSelect.value = service;
    }
  }

  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = Array.from(form.querySelectorAll("[required]"));
      let valid = true;

      fields.forEach((field) => {
        const hasValue = field.value.trim().length > 0;
        field.classList.toggle("field-error", !hasValue);
        if (!hasValue) valid = false;
      });

      if (!valid) {
        showToast("请先补充完整咨询信息");
        return;
      }

      showToast("咨询意向已记录，请添加微信继续沟通");
      form.reset();
    });
  }

  function initScrollReveal() {
    const cards = Array.from(document.querySelectorAll([
      ".hero-panel",
      ".stat-card",
      ".service-card",
      ".process .section-heading",
      ".timeline div",
      ".detail-card",
      ".faq-item",
      ".contact-person-card",
      ".contact-method",
      ".contact-tips"
    ].join(",")));

    if (!cards.length) return;

    cards.forEach((card, index) => {
      card.classList.add("scroll-reveal");
      card.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
    });

    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16
    });

    cards.forEach((card) => observer.observe(card));
  }

  initScrollReveal();

  function initAmbientCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const baseDensity = Number(canvas.dataset.density || 60);
    let width = 0;
    let height = 0;
    let particles = [];
    let raf = 0;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const mobileScale = width < 700 ? 0.55 : 1;
      const count = Math.max(18, Math.floor(baseDensity * mobileScale));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = canvas.classList.contains("subtle")
        ? "rgba(18, 103, 241, 0.38)"
        : "rgba(128, 190, 255, 0.72)";
      ctx.strokeStyle = canvas.classList.contains("subtle")
        ? "rgba(18, 103, 241, 0.08)"
        : "rgba(128, 190, 255, 0.12)";

      particles.forEach((point, index) => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < -10) point.x = width + 10;
        if (point.x > width + 10) point.x = -10;
        if (point.y < -10) point.y = height + 10;
        if (point.y > height + 10) point.y = -10;

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fill();

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const next = particles[nextIndex];
          const dx = point.x - next.x;
          const dy = point.y - next.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 128) {
            ctx.globalAlpha = 1 - distance / 128;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      if (!reduceMotion) raf = window.requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  document.querySelectorAll(".ambient-canvas").forEach(initAmbientCanvas);
})();
