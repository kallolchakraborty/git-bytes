(function () {
  'use strict';

  /* ── localStorage helpers (safe across storage-restricted contexts) ── */
  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }
  function safeSet(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (_) { /* quota exceeded or blocked */ }
  }

  /* ── Theme key ── */
  var STORAGE_KEY = 'gb_theme';

  /* ── Read persisted theme; default to light ── */
  function getTheme() {
    var stored = safeGet(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return 'light';
  }

  /* ── Apply a theme: toggle `.dark` on <html>, update toggle icons,
       dispatch custom event so other modules can react ── */
  function apply(theme) {
    var isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);

    /* update all theme-toggle icon buttons */
    document.querySelectorAll('.theme-toggle-btn .material-symbols-outlined').forEach(function (icon) {
      icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });

    /* let loader.js refresh tag colors, sidebar state, etc. */
    try {
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: theme } }));
    } catch (_) {}
  }

  /* ── Bootstrap ── */
  apply(getTheme());

  /* ── Wire up toggle buttons once DOM is ready ── */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isDark = document.documentElement.classList.contains('dark');
        var next = isDark ? 'light' : 'dark';
        apply(next);
        safeSet(STORAGE_KEY, next);
      });
    });
  });

  /* ── macOS/iOS: show ⌘ symbol instead of Ctrl in keyboard shortcuts ── */
  if (/(Mac|iPhone|iPad|iPod)/i.test(navigator.userAgent)) {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('kbd').forEach(function (el) {
        el.textContent = el.textContent.replace('Ctrl', '\u2318');
      });
    });
  }
})();
