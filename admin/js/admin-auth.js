(function () {
  var AUTH_KEY = "rh_admin_auth";

  window.RH_AdminAuth = {
    isOK: function () {
      return sessionStorage.getItem(AUTH_KEY) === "1";
    },
    setOK: function () {
      sessionStorage.setItem(AUTH_KEY, "1");
    },
    clear: function () {
      sessionStorage.removeItem(AUTH_KEY);
    },
  };

  var path = window.location.pathname || "";
  var file = (path.split("/").pop() || "").toLowerCase();
  if (file === "login.html") return;

  if (!window.RH_AdminAuth.isOK()) {
    window.location.href = "login.html";
  }
})();
