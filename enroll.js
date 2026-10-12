/* Saint Ignatius Enrollment Page
   IMPORTANT: Replace the URL below with the school's verified Facebook Messenger link before publishing.
   Example format: https://m.me/YourOfficialPageUsername
*/
const ENROLLMENT_MESSENGER_URL = "https://www.facebook.com/";

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const themeToggle = document.querySelector(".theme-toggle");

  // Light theme is the default; the switch toggles the red-and-white inverse theme.
  const applyTheme = (isDark) => {
    document.body.dataset.theme = isDark ? "dark" : "light";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      const label = themeToggle.querySelector(".theme-toggle-label");
      const icon = themeToggle.querySelector(".theme-toggle-knob i");
      if (label) label.textContent = isDark ? "Dark mode" : "Light mode";
      if (icon) icon.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
  };
  applyTheme(false);
  themeToggle?.addEventListener("click", () => applyTheme(document.body.dataset.theme !== "dark"));

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });

    document.addEventListener("click", event => {
      if (!event.target.closest(".header")) {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  }

  // Use one configured destination for every enrollment CTA.
  const messengerLink = document.getElementById("messenger-link");
  if (messengerLink) {
    messengerLink.href = ENROLLMENT_MESSENGER_URL;
    messengerLink.target = "_blank";
    messengerLink.rel = "noopener noreferrer";
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  const backTop = document.querySelector(".back-top");
  const updateBackTop = () => backTop?.classList.toggle("show", window.scrollY > 450);
  window.addEventListener("scroll", updateBackTop, { passive: true });
  updateBackTop();
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Pause the moving enrollment ticker when a keyboard or pointer user focuses it.
  const ticker = document.querySelector(".ticker-track");
  if (ticker) {
    ticker.setAttribute("tabindex", "0");
    ticker.setAttribute("aria-label", "Enrollment is ongoing for Senior High School and College");
    ticker.addEventListener("focus", () => ticker.style.animationPlayState = "paused");
    ticker.addEventListener("blur", () => ticker.style.animationPlayState = "running");
    ticker.addEventListener("mouseenter", () => ticker.style.animationPlayState = "paused");
    ticker.addEventListener("mouseleave", () => ticker.style.animationPlayState = "running");
  }
});
