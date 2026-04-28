document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const form = document.querySelector(".quote-form");
  const note = document.querySelector(".form-note");

  if (form && note) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = String(formData.get("name") || "there").trim();
      note.textContent = `Thanks, ${name}. Until this form is connected to email, send the same details to service@rental-handyman.com and we will reply there.`;
    });
  }
});
