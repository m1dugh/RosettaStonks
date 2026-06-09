window.onerror = function(msg, src, line) {
  var root = document.getElementById("root");
  if (root) {
    root.innerHTML =
      '<p style="color:red;padding:8px;font-size:11px;word-break:break-all">' +
      msg + "<br>(" + src + ":" + line + ")</p>";
  }
};
window.addEventListener("unhandledrejection", function(e) {
  var root = document.getElementById("root");
  if (root && root.children.length === 0) {
    root.innerHTML =
      '<p style="color:red;padding:8px;font-size:11px">' +
      (e.reason && e.reason.message ? e.reason.message : String(e.reason)) +
      "</p>";
  }
});
