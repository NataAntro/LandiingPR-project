(function () {
  const root = document.documentElement;

  if (window.top === window.self) {
    root.classList.add("is-top-level");
    return;
  }

  // Hide the document immediately to avoid rendering actionable UI inside a hostile frame.
  root.style.display = "none";

  const currentUrl = window.location.href;

  try {
    window.top.location = currentUrl;
    return;
  } catch (error) {
    // Ignore and continue with narrower fallbacks.
  }

  try {
    window.parent.location = currentUrl;
    return;
  } catch (error) {
    // Ignore and fall back to a same-frame navigation.
  }

  window.location.replace(currentUrl);
})();
