(function () {
  /** Access control is enforced by hosting (Basic Auth on /admin). Kept for compatibility. */
  window.RH_AdminAuth = {
    isOK: function () {
      return true;
    },
    setOK: function () {},
    clear: function () {},
  };
})();
