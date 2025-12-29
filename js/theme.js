/**
 * Theme Toggle System
 * Handles dark/light mode switching with localStorage persistence
 * and system preference detection.
 */

(function() {
  'use strict';

  // Theme constants
  const THEME_KEY = 'theme';
  const THEME_LIGHT = 'light';
  const THEME_DARK = 'dark';

  /**
   * Get the user's preferred theme from various sources
   * Priority: localStorage > system preference > light (default)
   */
  function getPreferredTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === THEME_LIGHT || savedTheme === THEME_DARK) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }

    // Default to light theme
    return THEME_LIGHT;
  }

  /**
   * Apply the theme to the document
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = theme === THEME_DARK ? '#111827' : '#FFFFFF';
    }
  }

  /**
   * Save theme preference to localStorage
   */
  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
    const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;

    applyTheme(newTheme);
    saveTheme(newTheme);

    // Announce theme change for screen readers
    announceThemeChange(newTheme);
  }

  /**
   * Announce theme change for accessibility
   */
  function announceThemeChange(theme) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Theme changed to ${theme} mode`;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Initialize theme system
   */
  function initTheme() {
    // Remove preload class to enable transitions after initial paint
    document.documentElement.classList.add('preload');

    // Apply initial theme
    const preferredTheme = getPreferredTheme();
    applyTheme(preferredTheme);

    // Enable transitions after a short delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('preload');
      });
    });

    // Set up theme toggle button(s)
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
      toggle.addEventListener('click', toggleTheme);

      // Add keyboard support
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    });

    // Listen for system theme changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

      darkModeQuery.addEventListener('change', (e) => {
        // Only update if user hasn't set a preference
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Expose toggle function globally for inline handlers if needed
  window.toggleTheme = toggleTheme;
})();
