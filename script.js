document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const form = document.querySelector(".quote-form");
  const note = document.querySelector(".form-note");

  if (form) {
    form.addEventListener("submit", () => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending\u2026";
      }
    });
  }

  if (note && new URLSearchParams(window.location.search).has("submitted")) {
    note.textContent = "Thanks! We received your request and will reply by email shortly.";
    note.style.color = "#16a34a";
    history.replaceState(null, "", window.location.pathname + "#contact");
  }
});
