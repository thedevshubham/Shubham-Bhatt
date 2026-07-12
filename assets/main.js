document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
    // Button navigation
    const button = event.target.closest("button[data-button-url]");
    if (button) {
      const url = button.dataset.buttonUrl;
      if (url) {
        window.location.href = url;
      }
      return;
    }

    // Mobile menu toggle
    const toggle = event.target.closest(".banner-section__menu-toggle");
    if (toggle) {
      const menu = document.querySelector(".mobile-menu");

      menu?.classList.toggle("is-open");
      toggle.classList.toggle("is-open");
    }
  });
});
