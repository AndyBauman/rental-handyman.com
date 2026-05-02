(function (global) {
  var STORAGE_KEY = "rh_handyman_crm_v1";

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { leads: [] };
      var d = JSON.parse(raw);
      if (!Array.isArray(d.leads)) d.leads = [];
      return d;
    } catch (e) {
      return { leads: [] };
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function normalizeLead(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (!raw.id) raw.id = "lead_" + Date.now();
    if (!raw.stage) raw.stage = "new_lead";
    if (typeof raw.emergencySeenOnDashboard === "undefined") raw.emergencySeenOnDashboard = false;
    if (!raw.createdAt) raw.createdAt = new Date().toISOString();
    return raw;
  }

  global.RH_CRM = {
    getLeads: function () {
      return load().leads.slice();
    },

    upsertLead: function (lead) {
      lead = normalizeLead(lead);
      if (!lead) return;
      var data = load();
      var i = data.leads.findIndex(function (l) {
        return l.id === lead.id;
      });
      if (i >= 0) data.leads[i] = Object.assign({}, data.leads[i], lead);
      else data.leads.unshift(lead);
      save(data);
    },

    importPayload: function (jsonStr) {
      var obj = JSON.parse(jsonStr);
      if (Array.isArray(obj)) {
        obj.forEach(this.upsertLead.bind(this));
        return obj.length;
      }
      if (obj && obj.schemaVersion && obj.lineItems) {
        this.upsertLead(obj);
        return 1;
      }
      throw new Error("Expected one CRM payload object or an array of leads.");
    },

    deleteLead: function (id) {
      var data = load();
      data.leads = data.leads.filter(function (l) {
        return l.id !== id;
      });
      save(data);
    },

    updateStage: function (id, stage) {
      var data = load();
      var lead = data.leads.find(function (l) {
        return l.id === id;
      });
      if (lead) {
        lead.stage = stage;
        save(data);
      }
    },

    markEmergencySeen: function (id) {
      var data = load();
      var lead = data.leads.find(function (l) {
        return l.id === id;
      });
      if (lead) {
        lead.emergencySeenOnDashboard = true;
        save(data);
      }
    },

    markAllEmergencySeen: function () {
      var data = load();
      data.leads.forEach(function (l) {
        if (l.isEmergency) l.emergencySeenOnDashboard = true;
      });
      save(data);
    },

    seedDemo: function () {
      var demo = [
        {
          schemaVersion: 1,
          id: "demo_pm_turn",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          source: "demo",
          stage: "scheduled",
          customerType: "Property Manager",
          customerTypeRole: "pm",
          estimateLow: 2200,
          estimateHigh: 3800,
          lineItems: [
            {
              id: "turn-standard",
              name: "Standard turnover — 1BR/studio",
              qty: 1,
              category: "pm_turnover",
              categoryLabel: "Turnover",
              unit: "per unit",
              low: 750,
              high: 1400,
              audience: "pm",
            },
          ],
          timeframePreferences: ["Weekday mornings (8–12)", "Saturday morning"],
          okWeekendRates: true,
          okHolidayRates: false,
          isEmergency: false,
          urgencyScore: 44,
          pricingRules: "",
          notesPreview: "Gate code 1234 — vacant unit.",
          emergencySeenOnDashboard: true,
        },
        {
          schemaVersion: 1,
          id: "demo_emergency",
          createdAt: new Date().toISOString(),
          source: "demo",
          stage: "new_lead",
          customerType: "Homeowner",
          customerTypeRole: "homeowner",
          estimateLow: 275,
          estimateHigh: 550,
          lineItems: [
            {
              id: "plumb-leak",
              name: "Leak detection & repair (fixture)",
              qty: 1,
              category: "plumbing",
              categoryLabel: "Plumbing",
              unit: "per repair",
              low: 125,
              high: 325,
              audience: "homeowner",
            },
          ],
          timeframePreferences: [],
          okWeekendRates: false,
          okHolidayRates: false,
          isEmergency: true,
          urgencyScore: 96,
          pricingRules: "",
          notesPreview: "Active leak under kitchen sink.",
          emergencySeenOnDashboard: false,
        },
      ];
      demo.forEach(this.upsertLead.bind(this));
    },

    exportJSON: function () {
      return JSON.stringify(load().leads, null, 2);
    },
  };
})(window);
