// Light/dark theme toggle. Dark is the default; an explicit choice is remembered per browser.
(function () {
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  var meta = document.querySelector('meta[name="theme-color"]');

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    if (meta) meta.setAttribute("content", theme === "light" ? "#ffffff" : "#0b0f17");
    if (button) button.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  }

  apply(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (button) {
    button.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }
})();
