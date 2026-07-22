(() => {
  const nav = document.querySelector(".mp-nav");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateNav = () => nav?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  const reveals = document.querySelectorAll(".mp-reveal");
  if (reducedMotion || !window.IntersectionObserver) {
    reveals.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.13 });
    reveals.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  }

  const liveCard = document.querySelector(".mp-live");
  const hero = document.querySelector(".mp-hero");
  if (!reducedMotion && liveCard && hero) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      liveCard.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0)`;
    });
    hero.addEventListener("pointerleave", () => { liveCard.style.transform = ""; });
  }
})();
