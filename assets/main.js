document.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-button-url]');

  if (!button) {
    return;
  }

  const url = button.dataset.buttonUrl;

  if (url) {
    window.location.href = url;
  }
});
