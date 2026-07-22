(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".o-hero");
  const sculpture = document.querySelector("#sculpture");
  const floats = [...document.querySelectorAll("[data-depth]")];

  if (!reduceMotion && hero && sculpture) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      sculpture.style.transform = `translate3d(${x * 20}px, ${y * 14}px, 0) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
      floats.forEach((card) => {
        const depth = Number(card.dataset.depth || 1);
        card.style.transform = `translate3d(${x * -18 * depth}px, ${y * -13 * depth}px, 0)`;
      });
    });
    hero.addEventListener("pointerleave", () => {
      sculpture.style.transform = "";
      floats.forEach((card) => { card.style.transform = ""; });
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  document.querySelectorAll(".o-reveal").forEach((item) => revealObserver.observe(item));

  const counters = document.querySelectorAll(".o-count");
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const end = Number(node.dataset.to || 0);
      const duration = reduceMotion ? 1 : 1100;
      const started = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = String(Math.round(end * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(node);
    });
  }, { threshold: 0.45 });
  counters.forEach((counter) => countObserver.observe(counter));

  const device = document.querySelector("#device");
  if (device && !reduceMotion) {
    window.addEventListener("scroll", () => {
      const rect = device.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) {
        const progress = Math.max(0, Math.min(1, 1 - rect.top / innerHeight));
        device.style.transform = `rotateX(${3 - progress * 3}deg) translateY(${(1 - progress) * 22}px)`;
      }
    }, { passive: true });
  }

  const selected = document.querySelector("#selectedTime");
  const reserve = document.querySelector("#reserveLink");
  document.querySelectorAll(".o-time-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".o-time-tabs button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const time = button.dataset.time;
      if (selected) selected.textContent = `Today, ${time}`;
      if (reserve) reserve.href = `booking.html?time=${encodeURIComponent(time)}`;
    });
  });
})();
