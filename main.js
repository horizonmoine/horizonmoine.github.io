document.addEventListener("DOMContentLoaded", () => {
  // --- LOADER ---
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("loader--hidden");
    }, 2000);
  }

  // --- NAVIGATION ---
  const nav = document.getElementById("nav");
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  // Scrolled navigation style
  const handleScroll = () => {
    if (window.scrollY > 100) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }
  };
  window.addEventListener("scroll", handleScroll);

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("nav__toggle--active");
      navMenu.classList.toggle("nav__menu--active");
    });

    // Close menu on link click
    document.querySelectorAll(".nav__link").forEach(link => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("nav__toggle--active");
        navMenu.classList.remove("nav__menu--active");
      });
    });
  }

  // --- STATS COUNTER ANIMATION ---
  const animateStats = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stats = document.querySelectorAll(".stats__number[data-target]");
        stats.forEach(stat => {
          const target = parseInt(stat.getAttribute("data-target"));
          if (isNaN(target)) return;

          let current = 0;
          const duration = 2000;
          const stepTime = 16; // approx 60fps
          const totalSteps = duration / stepTime;
          const increment = target / totalSteps;

          const updateCounter = () => {
            current += increment;
            if (current < target) {
              stat.textContent = Math.floor(current);
              requestAnimationFrame(updateCounter);
            } else {
              stat.textContent = target;
            }
          };
          requestAnimationFrame(updateCounter);
        });
        observer.unobserve(entry.target);
      }
    });
  };

  const statsObserver = new IntersectionObserver(animateStats, {
    threshold: 0.5,
  });
  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // --- 3D CARD EFFECT ---
  const profileCard = document.querySelector(".profile__card");
  if (profileCard) {
    const handleMouseMove = e => {
      const rect = profileCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const mouseXPercent = (x / rect.width) * 100;
      const mouseYPercent = (y / rect.height) * 100;

      profileCard.style.setProperty("--mouse-x", `${mouseXPercent}%`);
      profileCard.style.setProperty("--mouse-y", `${mouseYPercent}%`);

      const rotateX = (mouseYPercent - 50) / 10;
      const rotateY = (50 - mouseXPercent) / 10;

      profileCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      profileCard.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    };

    profileCard.addEventListener("mousemove", handleMouseMove);
    profileCard.addEventListener("mouseleave", handleMouseLeave);
  }

  // --- INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS ---
  const revealElements = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealElements, {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  });

  const elementsToReveal = document.querySelectorAll(
    ".bts-grid__card,.timeline__block,.skills__card,.projects__item,.experience__item,.tech-watch__item,.contact__item"
  );
  elementsToReveal.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(50px)";
    el.style.transition =
      "opacity 0.8s var(--transition), transform 0.8s var(--transition)";
    revealObserver.observe(el);
  });

  // --- PARALLAX EFFECT FOR HERO BACKGROUND ---
  const heroBg = document.querySelector(".hero__bg");
  const gridBg = document.querySelector(".hero__grid-bg");

  const handleParallaxScroll = () => {
    const scrolled = window.pageYOffset;
    if (heroBg) heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    if (gridBg) gridBg.style.transform = `translateY(${scrolled * 0.3}px)`;
  };

  window.addEventListener("scroll", () => {
    requestAnimationFrame(handleParallaxScroll);
  });
});
