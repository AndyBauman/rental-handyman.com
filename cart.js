(function () {
  const STORAGE_KEY = "rh_cart_v1";
  const ROLE_KEY = "rh_role_v1";

  const state = {
    items: load(),
    role: localStorage.getItem(ROLE_KEY) || "homeowner",
    activeCategory: "all",
    search: "",
  };

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }

  function fmt(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function getItem(id) {
    return window.REPAIR_CATALOG.find((i) => i.id === id);
  }

  function totals() {
    let low = 0, high = 0, count = 0;
    for (const id of Object.keys(state.items)) {
      const qty = state.items[id];
      const item = getItem(id);
      if (!item || qty < 1) continue;
      low += item.low * qty;
      high += item.high * qty;
      count += qty;
    }
    return { low, high, count };
  }

  function setRole(role) {
    state.role = role;
    localStorage.setItem(ROLE_KEY, role);
    document.querySelectorAll("[data-role-btn]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.roleBtn === role);
    });
    document.querySelectorAll("[data-role-show]").forEach((el) => {
      el.hidden = el.dataset.roleShow !== role;
    });
    const heading = document.getElementById("builder-heading");
    if (heading) {
      heading.textContent =
        role === "pm"
          ? "Property Manager Repair Quote Builder"
          : "Homeowner Repair Quote Builder";
    }
  }

  function setCategory(cat) {
    state.activeCategory = cat;
    document.querySelectorAll("[data-cat]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.cat === cat);
    });
    renderCatalog();
  }

  function renderCatalog() {
    const grid = document.getElementById("catalog-grid");
    if (!grid) return;
    const q = state.search.trim().toLowerCase();
    const items = window.REPAIR_CATALOG.filter((it) => {
      if (state.activeCategory !== "all" && it.category !== state.activeCategory) return false;
      if (q && !(it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q))) return false;
      return true;
    });

    grid.innerHTML = items
      .map((it) => {
        const qty = state.items[it.id] || 0;
        const inCart = qty > 0;
        return `
          <article class="repair-card${inCart ? " in-cart" : ""}" data-id="${it.id}">
            <div class="repair-head">
              <span class="repair-cat">${window.CATEGORY_LABELS[it.category] || it.category}</span>
              <span class="repair-price">${fmt(it.low)}&ndash;${fmt(it.high)} <small>${it.unit}</small></span>
            </div>
            <h3>${it.name}</h3>
            <p>${it.desc}</p>
            <div class="repair-actions">
              ${
                inCart
                  ? `
                <div class="qty-stepper" role="group" aria-label="Quantity">
                  <button type="button" class="qty-btn" data-qty="-1" data-id="${it.id}" aria-label="Decrease">−</button>
                  <input type="number" min="0" value="${qty}" class="qty-input" data-id="${it.id}" aria-label="Quantity" />
                  <button type="button" class="qty-btn" data-qty="1" data-id="${it.id}" aria-label="Increase">+</button>
                </div>
                <button type="button" class="btn btn-link remove-btn" data-remove="${it.id}">Remove</button>
              `
                  : `<button type="button" class="btn btn-add" data-add="${it.id}">Add to Quote</button>`
              }
            </div>
          </article>`;
      })
      .join("");

    if (items.length === 0) {
      grid.innerHTML = `<p class="empty-state">No repairs match. Try a different category or search.</p>`;
    }
  }

  function renderCart() {
    const body = document.getElementById("cart-body");
    const t = totals();
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = String(t.count);
    });
    document.getElementById("cart-total-low").textContent = fmt(t.low);
    document.getElementById("cart-total-high").textContent = fmt(t.high);

    const submitBtn = document.getElementById("cart-submit");
    if (submitBtn) submitBtn.disabled = t.count === 0;

    if (!body) return;

    if (t.count === 0) {
      body.innerHTML = `<p class="cart-empty">Your quote is empty. Add repairs from the catalog to get started.</p>`;
      return;
    }

    const rows = Object.keys(state.items)
      .map((id) => {
        const qty = state.items[id];
        const it = getItem(id);
        if (!it || qty < 1) return "";
        return `
          <li class="cart-row" data-id="${id}">
            <div class="cart-row-main">
              <p class="cart-row-name">${it.name}</p>
              <p class="cart-row-meta">${fmt(it.low * qty)} – ${fmt(it.high * qty)}</p>
            </div>
            <div class="cart-row-controls">
              <button type="button" class="qty-btn small" data-qty="-1" data-id="${id}" aria-label="Decrease">−</button>
              <span class="qty-display" data-qty-display="${id}">${qty}</span>
              <button type="button" class="qty-btn small" data-qty="1" data-id="${id}" aria-label="Increase">+</button>
              <button type="button" class="cart-remove" data-remove="${id}" aria-label="Remove">×</button>
            </div>
          </li>`;
      })
      .join("");
    body.innerHTML = `<ul class="cart-list">${rows}</ul>`;
  }

  function addItem(id, delta) {
    const cur = state.items[id] || 0;
    const next = Math.max(0, cur + delta);
    if (next === 0) {
      delete state.items[id];
    } else {
      state.items[id] = next;
    }
    save();
    renderCart();
    renderCatalog();
  }

  function setQty(id, qty) {
    qty = Math.max(0, parseInt(qty, 10) || 0);
    if (qty === 0) delete state.items[id];
    else state.items[id] = qty;
    save();
    renderCart();
    renderCatalog();
  }

  function removeItem(id) {
    delete state.items[id];
    save();
    renderCart();
    renderCatalog();
  }

  function buildSummaryText() {
    const t = totals();
    const lines = [];
    lines.push("Repair Quote Request");
    lines.push("Type: " + (state.role === "pm" ? "Property Manager" : "Homeowner"));
    lines.push("");
    lines.push("ITEMS:");
    for (const id of Object.keys(state.items)) {
      const qty = state.items[id];
      const it = getItem(id);
      if (!it) continue;
      lines.push(
        `- ${qty}x ${it.name} (${fmt(it.low * qty)}-${fmt(it.high * qty)})`
      );
    }
    lines.push("");
    lines.push(`Estimated total: ${fmt(t.low)} – ${fmt(t.high)}`);
    lines.push("(Final pricing confirmed after on-site or photo review.)");
    return lines.join("\n");
  }

  function openCart(open) {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    if (overlay) overlay.classList.toggle("is-visible", open);
    document.body.classList.toggle("cart-open", open);
  }

  function clearCart() {
    state.items = {};
    save();
    renderCart();
    renderCatalog();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("catalog-grid")) return;

    setRole(state.role);
    setCategory("all");
    renderCart();

    document.querySelectorAll("[data-role-btn]").forEach((b) => {
      b.addEventListener("click", () => setRole(b.dataset.roleBtn));
    });
    document.querySelectorAll("[data-cat]").forEach((b) => {
      b.addEventListener("click", () => setCategory(b.dataset.cat));
    });

    const search = document.getElementById("catalog-search");
    if (search) {
      search.addEventListener("input", (e) => {
        state.search = e.target.value;
        renderCatalog();
      });
    }

    document.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-add]");
      if (addBtn) {
        addItem(addBtn.dataset.add, 1);
        return;
      }
      const qtyBtn = e.target.closest("[data-qty]");
      if (qtyBtn) {
        addItem(qtyBtn.dataset.id, parseInt(qtyBtn.dataset.qty, 10));
        return;
      }
      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        removeItem(removeBtn.dataset.remove);
        return;
      }
      if (e.target.closest("[data-cart-open]")) {
        openCart(true);
        return;
      }
      if (e.target.closest("[data-cart-close]")) {
        openCart(false);
        return;
      }
      if (e.target.closest("[data-cart-clear]")) {
        if (confirm("Clear all items from your quote?")) clearCart();
        return;
      }
    });

    document.addEventListener("change", (e) => {
      const input = e.target.closest(".qty-input");
      if (input) setQty(input.dataset.id, input.value);
    });

    const form = document.getElementById("cart-form");
    if (form) {
      form.addEventListener("submit", (ev) => {
        const t = totals();
        if (t.count === 0) {
          ev.preventDefault();
          alert("Add at least one repair to submit a quote.");
          return;
        }
        document.getElementById("hidden-summary").value = buildSummaryText();
        document.getElementById("hidden-role").value =
          state.role === "pm" ? "Property Manager" : "Homeowner";
        document.getElementById("hidden-total-low").value = fmt(t.low);
        document.getElementById("hidden-total-high").value = fmt(t.high);
        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Submitting\u2026";
        }
      });
    }

    if (new URLSearchParams(window.location.search).has("submitted")) {
      clearCart();
      const banner = document.getElementById("submit-banner");
      if (banner) banner.hidden = false;
      history.replaceState(null, "", window.location.pathname);
    }
  });
})();
