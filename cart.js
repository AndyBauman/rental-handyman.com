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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(message) {
    let el = document.getElementById("quote-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "quote-toast";
      el.className = "quote-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.remove("is-visible"), 2800);
  }

  function pulseCartTrigger() {
    document.querySelectorAll(".cart-trigger").forEach((btn) => {
      btn.classList.remove("cart-trigger-pulse");
      void btn.offsetWidth;
      btn.classList.add("cart-trigger-pulse");
    });
  }

  function syncMobileQuoteBar() {
    const mobBar = document.getElementById("mobile-quote-bar");
    const drawer = document.getElementById("cart-drawer");
    if (!mobBar) return;
    const t = totals();
    const drawerOpen = drawer && drawer.classList.contains("is-open");
    const narrow = window.matchMedia("(max-width: 880px)").matches;
    const show = narrow && t.count > 0 && !drawerOpen;
    mobBar.hidden = !show;
    document.body.classList.toggle("quote-mobile-bar-active", show);
  }

  function fmt(n) {
    const x = Number(n);
    const fractional = Math.abs(x % 1) > 1e-9;
    return (
      "$" +
      x.toLocaleString("en-US", {
        minimumFractionDigits: fractional ? 2 : 0,
        maximumFractionDigits: fractional ? 2 : 0,
      })
    );
  }

  function getItem(id) {
    const i = window.REPAIR_CATALOG.find((x) => x.id === id);
    if (!i || i.audience !== state.role) return undefined;
    return i;
  }

  function pruneCartForRole() {
    let changed = false;
    for (const id of Object.keys(state.items)) {
      const it = window.REPAIR_CATALOG.find((x) => x.id === id);
      if (!it || it.audience !== state.role) {
        delete state.items[id];
        changed = true;
      }
    }
    if (changed) save();
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

  function buildCategoryList() {
    const ul = document.getElementById("catalog-cat-list");
    if (!ul || !window.CATEGORY_LABELS) return;
    const order =
      state.role === "pm"
        ? window.CATEGORY_ORDER_PM || []
        : window.CATEGORY_ORDER_HOMEOWNER || [];
    ul.replaceChildren();
    const allLi = document.createElement("li");
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "cat-btn";
    allBtn.dataset.cat = "all";
    allBtn.textContent =
      state.role === "pm" ? "All PM job types" : "All homeowner job types";
    allLi.appendChild(allBtn);
    ul.appendChild(allLi);
    for (const cat of order) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-btn";
      btn.dataset.cat = cat;
      btn.textContent = window.CATEGORY_LABELS[cat] || cat;
      li.appendChild(btn);
      ul.appendChild(li);
    }
    const note = document.getElementById("catalog-role-note");
    if (note) {
      note.textContent =
        state.role === "pm"
          ? "Turnovers, compliance, portfolios — Portland/Vancouver market ranges."
          : "Owner-occupied scopes — Portland/Vancouver market ranges.";
    }
  }

  function renderQuickStarts() {
    const section = document.getElementById("catalog-quick-starts");
    const inner = document.getElementById("catalog-quick-starts-inner");
    if (!section || !inner || !window.QUOTE_QUICK_STARTS) return;

    const eligible =
      state.activeCategory === "all" &&
      !state.search.trim() &&
      window.QUOTE_QUICK_STARTS.some((b) => b.audience === state.role);

    if (!eligible) {
      section.hidden = true;
      inner.innerHTML = "";
      return;
    }

    section.hidden = false;
    const bundles = window.QUOTE_QUICK_STARTS.filter((b) => b.audience === state.role);
    inner.innerHTML = bundles
      .map((b) => {
        const badge = b.badge
          ? `<span class="bundle-badge">${escapeHtml(b.badge)}</span>`
          : "";
        const idsAttr = escapeHtml(b.addIds.join(","));
        return `
        <button type="button" class="bundle-card" data-bundle="${idsAttr}">
          ${badge}
          <span class="bundle-card-title">${escapeHtml(b.title)}</span>
          <span class="bundle-card-sub">${escapeHtml(b.subtitle)}</span>
          <span class="bundle-card-cta" aria-hidden="true">Add bundle</span>
        </button>`;
      })
      .join("");
  }

  function updateSearchChrome() {
    const clearBtn = document.getElementById("catalog-search-clear");
    if (clearBtn) clearBtn.hidden = !state.search.trim();
  }

  function setRole(role) {
    state.role = role;
    localStorage.setItem(ROLE_KEY, role);
    document.querySelectorAll("[data-role-btn]").forEach((b) => {
      const on = b.dataset.roleBtn === role;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll("[data-role-show]").forEach((el) => {
      el.hidden = el.dataset.roleShow !== role;
    });
    buildCategoryList();
    pruneCartForRole();
    const heading = document.getElementById("builder-heading");
    if (heading) {
      heading.textContent =
        role === "pm"
          ? "Property Manager Repair Quote Builder"
          : "Homeowner Repair Quote Builder";
    }
    setCategory("all");
    renderCart();
  }

  function setCategory(cat) {
    state.activeCategory = cat;
    document.querySelectorAll(".builder-side [data-cat]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.cat === cat);
    });
    renderCatalog();
  }

  function renderCatalog() {
    renderQuickStarts();

    const grid = document.getElementById("catalog-grid");
    if (!grid) return;
    updateSearchChrome();
    const q = state.search.trim().toLowerCase();
    const items = window.REPAIR_CATALOG.filter((it) => {
      if (it.audience !== state.role) return false;
      if (state.activeCategory !== "all" && it.category !== state.activeCategory) return false;
      if (q && !(it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q))) return false;
      return true;
    });

    const meta = document.getElementById("catalog-results-count");
    if (meta) {
      const noun = items.length === 1 ? "job type" : "job types";
      const scopeLabel =
        state.activeCategory === "all"
          ? "all categories"
          : window.CATEGORY_LABELS[state.activeCategory] || state.activeCategory;
      meta.textContent =
        items.length === 0
          ? `No matches · ${scopeLabel}`
          : `Showing ${items.length} ${noun} · ${scopeLabel}`;
    }

    grid.innerHTML = items
      .map((it) => {
        const qty = state.items[it.id] || 0;
        const inCart = qty > 0;
        const catLabel = escapeHtml(window.CATEGORY_LABELS[it.category] || it.category);
        const title = escapeHtml(it.name);
        const desc = escapeHtml(it.desc);
        return `
          <article class="repair-card${inCart ? " in-cart" : ""}" data-id="${escapeHtml(it.id)}">
            <div class="repair-head">
              <span class="repair-cat">${catLabel}</span>
              <div class="repair-price-block">
                <span class="repair-price-label">Typical range</span>
                <span class="repair-price">${fmt(it.low)}–${fmt(it.high)}</span>
                <span class="repair-price-unit">${escapeHtml(it.unit)}</span>
              </div>
            </div>
            <h3>${title}</h3>
            <p>${desc}</p>
            <div class="repair-actions">
              ${
                inCart
                  ? `
                <div class="qty-stepper" role="group" aria-label="Adjust quantity">
                  <button type="button" class="qty-btn" data-qty="-1" data-id="${escapeHtml(it.id)}" aria-label="Decrease quantity">−</button>
                  <input type="number" min="0" value="${qty}" class="qty-input" data-id="${escapeHtml(it.id)}" aria-label="Quantity" />
                  <button type="button" class="qty-btn" data-qty="1" data-id="${escapeHtml(it.id)}" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="btn btn-link remove-btn" data-remove="${escapeHtml(it.id)}">Remove</button>
              `
                  : `<button type="button" class="btn btn-add" data-add="${escapeHtml(it.id)}">Add</button>`
              }
            </div>
          </article>`;
      })
      .join("");

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" role="status">
          <p class="empty-state-title">Nothing matched</p>
          <p class="empty-state-hint">Try clearing search, choose “All … job types”, or pick another category.</p>
        </div>`;
    }
  }

  function renderCart() {
    const body = document.getElementById("cart-body");
    const t = totals();
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = String(t.count);
    });
    const lowEl = document.getElementById("cart-total-low");
    const highEl = document.getElementById("cart-total-high");
    if (lowEl) lowEl.textContent = fmt(t.low);
    if (highEl) highEl.textContent = fmt(t.high);
    const lowIn = document.getElementById("cart-total-low-inline");
    const highIn = document.getElementById("cart-total-high-inline");
    if (lowIn) lowIn.textContent = fmt(t.low);
    if (highIn) highIn.textContent = fmt(t.high);
    const mLow = document.getElementById("mobile-total-low");
    const mHigh = document.getElementById("mobile-total-high");
    if (mLow) mLow.textContent = fmt(t.low);
    if (mHigh) mHigh.textContent = fmt(t.high);

    syncMobileQuoteBar();

    const submitBtn = document.getElementById("cart-submit");
    if (submitBtn) submitBtn.disabled = t.count === 0;

    if (!body) return;

    if (t.count === 0) {
      body.innerHTML = `<p class="cart-empty">Your quote is empty — add jobs from the catalog or a quick-start bundle.</p>`;
      return;
    }

    const rows = Object.keys(state.items)
      .map((id) => {
        const qty = state.items[id];
        const it = getItem(id);
        if (!it || qty < 1) return "";
        return `
          <li class="cart-row" data-id="${escapeHtml(id)}">
            <div class="cart-row-main">
              <p class="cart-row-name">${escapeHtml(it.name)}</p>
              <p class="cart-row-meta">${fmt(it.low * qty)} – ${fmt(it.high * qty)}</p>
            </div>
            <div class="cart-row-controls">
              <button type="button" class="qty-btn small" data-qty="-1" data-id="${escapeHtml(id)}" aria-label="Decrease quantity">−</button>
              <span class="qty-display" data-qty-display="${escapeHtml(id)}">${qty}</span>
              <button type="button" class="qty-btn small" data-qty="1" data-id="${escapeHtml(id)}" aria-label="Increase quantity">+</button>
              <button type="button" class="cart-remove" data-remove="${escapeHtml(id)}" aria-label="Remove line">×</button>
            </div>
          </li>`;
      })
      .join("");
    body.innerHTML = `<ul class="cart-list">${rows}</ul>`;
  }

  function addBundle(ids) {
    let added = 0;
    for (const raw of ids) {
      const id = raw.trim();
      if (!id) continue;
      const it = window.REPAIR_CATALOG.find((x) => x.id === id);
      if (!it || it.audience !== state.role) continue;
      state.items[id] = (state.items[id] || 0) + 1;
      added++;
    }
    if (added === 0) return;
    save();
    renderCart();
    renderCatalog();
    showToast(`Bundle added · ${added} line ${added === 1 ? "item" : "items"}`);
    pulseCartTrigger();
  }

  function addItem(id, delta) {
    const cur = state.items[id] || 0;
    const appearing = cur === 0 && delta > 0;
    const next = Math.max(0, cur + delta);
    if (next === 0) {
      delete state.items[id];
    } else {
      state.items[id] = next;
    }
    save();
    renderCart();
    renderCatalog();
    if (appearing && next > 0) {
      showToast("Added to quote");
      pulseCartTrigger();
    }
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
    syncMobileQuoteBar();
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
    renderCart();

    document.querySelectorAll("[data-role-btn]").forEach((b) => {
      b.addEventListener("click", () => setRole(b.dataset.roleBtn));
    });

    const search = document.getElementById("catalog-search");
    if (search) {
      search.addEventListener("input", (e) => {
        state.search = e.target.value;
        renderCatalog();
      });
    }

    const searchClear = document.getElementById("catalog-search-clear");
    if (searchClear) {
      searchClear.addEventListener("click", () => {
        state.search = "";
        if (search) search.value = "";
        renderCatalog();
      });
    }

    window.addEventListener("resize", syncMobileQuoteBar);

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const drawer = document.getElementById("cart-drawer");
      if (drawer && drawer.classList.contains("is-open")) openCart(false);
    });

    document.addEventListener("click", (e) => {
      const bundleBtn = e.target.closest("[data-bundle]");
      if (bundleBtn && bundleBtn.closest("#catalog-quick-starts-inner")) {
        const ids = bundleBtn.dataset.bundle.split(",").map((x) => x.trim()).filter(Boolean);
        addBundle(ids);
        return;
      }
      const catBtn = e.target.closest(".builder-side [data-cat]");
      if (catBtn) {
        setCategory(catBtn.dataset.cat);
        return;
      }
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
