// i18n - Language switching for pattern snippets
(function() {
  let translations = {};

  // 언어: URL param > localStorage > 기본값 'en'
  function getInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang === 'en' || paramLang === 'ko') return paramLang;
    return localStorage.getItem('lang') || 'en';
  }

  let currentLang = getInitialLang();

  // Get nested value from object by dot-notation key
  function getValue(obj, path) {
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
  }

  // Apply translations to all elements with data-i18n
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const value = getValue(translations, key);

      if (value === undefined) return;

      if (Array.isArray(value)) {
        // For lists
        el.innerHTML = value.map(item => `<li>${item}</li>`).join('');
      } else {
        // For text
        el.textContent = value;
      }
    });

    // Update html lang attribute
    document.documentElement.lang = currentLang;

    // Update toggle button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  // Load language file and apply
  async function loadLang(lang) {
    try {
      const res = await fetch(`locales/${lang}.json`);
      if (!res.ok) throw new Error(`Failed to load ${lang}.json`);
      translations = await res.json();
      currentLang = lang;
      localStorage.setItem('lang', lang);
      applyTranslations();
    } catch (err) {
      console.error('i18n error:', err);
    }
  }

  // Initialize
  function init() {
    // Set up language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang !== currentLang) {
          loadLang(lang);
        }
      });
    });

    // Load initial language
    loadLang(currentLang);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
