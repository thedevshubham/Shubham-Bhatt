/**
 * Global Theme Scripts
 * Handles general UI behaviors like button navigation redirects and mobile menu toggling.
 */
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
    // 1. Button navigation redirects (for custom buttons with data-button-url attributes)
    const button = event.target.closest("button[data-button-url]");
    if (button) {
      const url = button.dataset.buttonUrl;
      if (url) {
        window.location.href = url;
      }
      return;
    }

    // 2. Mobile menu toggle (within the header banner section)
    const toggle = event.target.closest(".banner-section__menu-toggle");
    if (toggle) {
      const menu = document.querySelector(".mobile-menu");
      if (menu) {
        menu.classList.toggle("is-open");
        toggle.classList.toggle("is-open");
      }
    }
  });
});
