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
    if (!i || !itemMatchesRole(i, state.role)) return undefined;
    return i;
  }

  function pruneCartForRole() {
    let changed = false;
    for (const id of Object.keys(state.items)) {
      const it = window.REPAIR_CATALOG.find((x) => x.id === id);
      if (!it || !itemMatchesRole(it, state.role)) {
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

  /** Homeowner mode never surfaces PM-only categories (turnovers, portfolio jobs, etc.). */
  function itemMatchesRole(it, role) {
    if (!it || typeof it.audience !== "string") return false;
    if (role === "homeowner") {
      return it.audience === "homeowner" && !String(it.category || "").startsWith("pm_");
    }
    return role === "pm" && it.audience === "pm";
  }

  /** Compact label for horizontal category pills (emoji stripped; shorten before em-dash). */
  function categoryPillLabel(catKey, fullLabel) {
    if (catKey === "all") return "All types";
    let t = String(fullLabel || catKey).trim();
    const parts = t.split(/\s+/);
    if (parts.length > 1 && !/[a-zA-Z]/.test(parts[0])) {
      t = parts.slice(1).join(" ");
    }
    const segment = t.split("—")[0].trim();
    if (segment.length > 22) return segment.slice(0, 20) + "…";
    return segment || t.slice(0, 22);
  }

  function syncCategoryTabsAria(activeCat) {
    document.querySelectorAll("#catalog-cat-scroll .cat-pill").forEach((btn) => {
      const on = btn.dataset.cat === activeCat;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  const POPULAR_TERMS_HOMEOWNER = [
    "faucet",
    "toilet",
    "drywall",
    "paint",
    "door",
    "outlet",
    "caulk",
    "shelf",
  ];
  const POPULAR_TERMS_PM = [
    "turnover",
    "rekey",
    "drywall",
    "paint",
    "smoke",
    "gfci",
    "carpet",
    "lock",
  ];

  function renderPopularChips() {
    const inner = document.getElementById("catalog-popular-chips");
    if (!inner) return;
    const terms = state.role === "pm" ? POPULAR_TERMS_PM : POPULAR_TERMS_HOMEOWNER;
    inner.replaceChildren();
    for (const term of terms) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "search-chip";
      btn.dataset.searchChip = term;
      btn.textContent = term.charAt(0).toUpperCase() + term.slice(1);
      inner.appendChild(btn);
    }
  }

  function buildCategoryList() {
    const ul = document.getElementById("catalog-cat-scroll");
    if (!ul || !window.CATEGORY_LABELS) return;
    const order =
      state.role === "pm"
        ? window.CATEGORY_ORDER_PM || []
        : window.CATEGORY_ORDER_HOMEOWNER || [];
    ul.replaceChildren();
    const mkBtn = (catKey, labelFull, pillText) => {
      const li = document.createElement("li");
      li.className = "cat-scroll-item";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-pill";
      btn.dataset.cat = catKey;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", catKey === state.activeCategory ? "true" : "false");
      btn.title = labelFull;
      btn.textContent = pillText;
      li.appendChild(btn);
      return li;
    };
    ul.appendChild(
      mkBtn(
        "all",
        state.role === "pm" ? "All PM job types" : "All homeowner job types",
        categoryPillLabel("all", "")
      )
    );
    for (const cat of order) {
      const full = window.CATEGORY_LABELS[cat] || cat;
      ul.appendChild(mkBtn(cat, full, categoryPillLabel(cat, full)));
    }
    syncCategoryTabsAria(state.activeCategory);
    const note = document.getElementById("catalog-role-note");
    if (note) {
      note.textContent =
        state.role === "pm"
          ? "Turnovers, compliance, portfolios — Portland/Vancouver market ranges."
          : "Owner-occupied scopes — Portland/Vancouver market ranges.";
    }
    renderPopularChips();
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
    syncCategoryTabsAria(cat);
    renderCatalog();
  }

  function renderCatalog() {
    renderQuickStarts();

    const grid = document.getElementById("catalog-grid");
    if (!grid) return;
    updateSearchChrome();
    const popWrap = document.getElementById("catalog-popular-wrap");
    if (popWrap) popWrap.hidden = state.search.trim().length > 0;
    const q = state.search.trim().toLowerCase();
    const items = window.REPAIR_CATALOG.filter((it) => {
      if (!itemMatchesRole(it, state.role)) return false;
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
            <div class="repair-card-body">
              <span class="repair-cat">${catLabel}</span>
              <h3>${title}</h3>
              <p class="repair-desc">${desc}</p>
              <div class="repair-pricing" role="group" aria-label="Estimated typical price range for this repair">
                <span class="repair-price-label">Typical range · this job</span>
                <div class="repair-price-line">
                  <span class="repair-price">${fmt(it.low)}–${fmt(it.high)}</span>
                  <span class="repair-price-unit">${escapeHtml(it.unit)}</span>
                </div>
              </div>
            </div>
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
      if (!it || !itemMatchesRole(it, state.role)) continue;
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

  function inferJobScope(category) {
    if (!category || typeof category !== "string") return undefined;
    if (category === "outdoor_exterior" || category.includes("exterior_common")) return "exterior";
    if (category.includes("interior")) return "interior";
    if (category.includes("exterior")) return "exterior";
    return undefined;
  }

  function buildLineItemsDetailed() {
    const rows = [];
    for (const id of Object.keys(state.items)) {
      const qty = state.items[id];
      const it = getItem(id);
      if (!it || qty < 1) continue;
      rows.push({
        id: it.id,
        name: it.name,
        qty,
        category: it.category,
        categoryLabel: window.CATEGORY_LABELS[it.category] || it.category,
        jobScope: inferJobScope(it.category),
        unit: it.unit,
        low: it.low,
        high: it.high,
        audience: it.audience,
      });
    }
    return rows;
  }

  function readSchedulePrefs(form) {
    return [...form.querySelectorAll('input[name="timeframe_pref"]:checked')].map((el) => el.value);
  }

  function validateSchedule(form) {
    const prefs = readSchedulePrefs(form);
    const emergency = form.querySelector("#cart-emergency") && form.querySelector("#cart-emergency").checked;
    if (prefs.length === 0 && !emergency) {
      alert("Choose at least one timeframe that usually works, or select Emergency / ASAP if this is urgent.");
      return false;
    }
    if (emergency && prefs.length === 0) {
      return confirm(
        "No timeframe windows selected — only choose this path for true emergencies (hours-critical). Continue?"
      );
    }
    return true;
  }

  function urgencyScore(isEmergency, prefs) {
    let s = isEmergency ? 92 : 42;
    if (prefs.some((p) => /Saturday|Sunday/i.test(p))) s += 8;
    return Math.min(99, s);
  }

  function buildCrmPayload(form, t) {
    const prefs = readSchedulePrefs(form);
    const okWeekend = !!(form.querySelector("#cart-ok-weekend") && form.querySelector("#cart-ok-weekend").checked);
    const okHoliday = !!(form.querySelector("#cart-ok-holiday") && form.querySelector("#cart-ok-holiday").checked);
    const emergency = !!(form.querySelector("#cart-emergency") && form.querySelector("#cart-emergency").checked);
    const uid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);

    const nameEl = form.querySelector("#cart-name");
    const emailEl = form.querySelector("#cart-email");
    const phoneEl = form.querySelector("#cart-phone");
    const addrEl = form.querySelector("#cart-address");

    return {
      schemaVersion: 1,
      id: uid,
      createdAt: new Date().toISOString(),
      source: "quote_builder",
      stage: "new_lead",
      customerType: state.role === "pm" ? "Property Manager" : "Homeowner",
      customerTypeRole: state.role,
      contactName: (nameEl && nameEl.value.trim()) || "",
      contactEmail: (emailEl && emailEl.value.trim()) || "",
      contactPhone: (phoneEl && phoneEl.value.trim()) || "",
      serviceAddress: (addrEl && addrEl.value.trim()) || "",
      estimateLow: t.low,
      estimateHigh: t.high,
      lineItems: buildLineItemsDetailed(),
      timeframePreferences: prefs,
      okWeekendRates: okWeekend,
      okHolidayRates: okHoliday,
      isEmergency: emergency,
      urgencyScore: urgencyScore(emergency, prefs),
      pricingRules:
        "Emergency: dispatch premium applies. Weekend Sat–Sun labor ×2 vs typical midweek estimate. Holidays ×3. Written confirmation before work.",
      notesPreview: (form.querySelector("#cart-notes") && form.querySelector("#cart-notes").value) || "",
      tasks: [],
      emergencySeenOnDashboard: false,
    };
  }

  function buildScheduleSummaryBlock(form, payload) {
    const lines = [];
    lines.push("SCHEDULING");
    lines.push("Preferred windows: " + (payload.timeframePreferences.join("; ") || "(none listed)"));
    lines.push("Emergency / ASAP: " + (payload.isEmergency ? "YES" : "no"));
    lines.push("Weekend rate note (2×): " + (payload.okWeekendRates ? "Acknowledged" : "Not checked"));
    lines.push("Holiday rate note (3×): " + (payload.okHolidayRates ? "Acknowledged" : "Not checked"));
    lines.push("Urgency score (internal): " + payload.urgencyScore);
    return lines.join("\n");
  }

  function buildSummaryText(form, payload, t) {
    const lines = [];
    lines.push("Repair Quote Request");
    lines.push("Type: " + payload.customerType);
    lines.push("");
    lines.push("ITEMS:");
    for (const row of payload.lineItems) {
      lines.push(
        `- ${row.qty}x ${row.name} (${fmt(row.low * row.qty)}-${fmt(row.high * row.qty)})`
      );
    }
    lines.push("");
    lines.push(`Estimated total: ${fmt(t.low)} – ${fmt(t.high)}`);
    lines.push("");
    lines.push(buildScheduleSummaryBlock(form, payload));
    lines.push("");
    lines.push("(Final pricing confirmed after on-site or photo review.)");
    return lines.join("\n");
  }

  function syncEmergencyHidden(form) {
    const cb = form.querySelector("#cart-emergency");
    const hid = form.querySelector("#hidden-is-emergency");
    const pricingAck = form.querySelector("#hidden-pricing-ack");
    if (hid && cb) hid.value = cb.checked ? "yes" : "no";
    if (pricingAck && cb) {
      const okW = form.querySelector("#cart-ok-weekend") && form.querySelector("#cart-ok-weekend").checked;
      const okH = form.querySelector("#cart-ok-holiday") && form.querySelector("#cart-ok-holiday").checked;
      const parts = [];
      if (cb.checked) parts.push("emergency_dispatch");
      if (okW) parts.push("weekend_2x_ack");
      if (okH) parts.push("holiday_3x_ack");
      pricingAck.value = parts.join("|") || "standard";
    }
  }

  function syncTimeframeHidden(form) {
    const hid = form.querySelector("#hidden-timeframes");
    if (!hid) return;
    hid.value = readSchedulePrefs(form).join(" | ");
  }

  async function maybePostWebhook(payload) {
    const url = typeof window !== "undefined" && window.RH_QUOTE_WEBHOOK;
    if (!url || typeof fetch !== "function") return;
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "handyman_quote", payload }),
        mode: "cors",
        keepalive: true,
      });
    } catch (e) {
      console.warn("Quote webhook optional POST failed:", e);
    }
  }

  function mirrorPayloadLocal(payload) {
    try {
      localStorage.setItem("rh_crm_last_quote_payload", JSON.stringify(payload));
    } catch (e) {
      /* ignore quota */
    }
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
      const catBtn = e.target.closest("#catalog-cat-scroll [data-cat]");
      if (catBtn) {
        setCategory(catBtn.dataset.cat);
        return;
      }
      const chip = e.target.closest("[data-search-chip]");
      if (chip && chip.closest(".catalog-popular-chips")) {
        const term = chip.dataset.searchChip || "";
        const input = document.getElementById("catalog-search");
        setCategory("all");
        state.search = term;
        if (input) input.value = term;
        updateSearchChrome();
        renderCatalog();
        input?.focus();
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
      form.addEventListener("change", (e) => {
        if (
          e.target &&
          (e.target.id === "cart-emergency" ||
            e.target.id === "cart-ok-weekend" ||
            e.target.id === "cart-ok-holiday" ||
            e.target.name === "timeframe_pref")
        ) {
          syncEmergencyHidden(form);
          syncTimeframeHidden(form);
        }
      });

      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const t = totals();
        if (t.count === 0) {
          alert("Add at least one repair to submit a quote.");
          return;
        }
        syncEmergencyHidden(form);
        syncTimeframeHidden(form);
        if (!validateSchedule(form)) {
          return;
        }

        const payload = buildCrmPayload(form, t);

        document.getElementById("hidden-summary").value = buildSummaryText(form, payload, t);
        document.getElementById("hidden-role").value =
          state.role === "pm" ? "Property Manager" : "Homeowner";
        document.getElementById("hidden-total-low").value = fmt(t.low);
        document.getElementById("hidden-total-high").value = fmt(t.high);

        const lineEl = document.getElementById("hidden-line-items-json");
        if (lineEl) lineEl.value = JSON.stringify(payload.lineItems);

        const crmEl = document.getElementById("hidden-crm-payload");
        if (crmEl) crmEl.value = JSON.stringify(payload);

        const schedTa = document.getElementById("hidden-schedule-summary");
        if (schedTa) schedTa.value = buildScheduleSummaryBlock(form, payload);

        mirrorPayloadLocal(payload);
        await maybePostWebhook(payload);

        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Submitting\u2026";
        }

        HTMLFormElement.prototype.submit.call(form);
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
