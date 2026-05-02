(function (global) {
  /** Illustrative adjusted ranges — final bids still confirmed on site. */
  global.RH_PRICING = {
    weekendLaborMultiplier: 2,
    holidayLaborMultiplier: 3,
    emergencyPremiumPct: 0.15,

    adjustedRange: function (low, high, opts) {
      opts = opts || {};
      var lo = Number(low) || 0;
      var hi = Number(high) || 0;
      var notes = [];

      var mul = 1;
      if (opts.weekendScheduled) {
        mul *= this.weekendLaborMultiplier;
        notes.push("Weekend ×" + this.weekendLaborMultiplier + " labor vs typical weekday band");
      }
      if (opts.holidayScheduled) {
        mul *= this.holidayLaborMultiplier;
        notes.push("Holiday ×" + this.holidayLaborMultiplier + " labor");
      }

      lo *= mul;
      hi *= mul;

      if (opts.emergency) {
        var addLo = lo * this.emergencyPremiumPct;
        var addHi = hi * this.emergencyPremiumPct;
        lo += addLo;
        hi += addHi;
        notes.push("Emergency dispatch premium (~" + Math.round(this.emergencyPremiumPct * 100) + "% indicative)");
      }

      return {
        low: lo,
        high: hi,
        notes: notes,
      };
    },
  };
})(window);
