/* Main Shared Script - Made by Sai */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initScrollReveal();
});

/**
 * Initializes Light/Dark theme switching based on local storage
 */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Inject animated decoration layers (halo, ripple burst, twinkling stars)
  enhanceThemeToggle(themeToggleBtn);

  // Read saved theme, default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';

  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Handle click events on theme toggle
  themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');

    if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }

    // Restart the pop + ripple burst animation on every click
    themeToggleBtn.classList.remove('theme-animating');
    void themeToggleBtn.offsetWidth; // force reflow so the animation replays
    themeToggleBtn.classList.add('theme-animating');
  });

  // Clean up the animation class once it finishes
  themeToggleBtn.addEventListener('animationend', (e) => {
    if (e.animationName === 'themeTogglePop') {
      themeToggleBtn.classList.remove('theme-animating');
    }
  });
}

/**
 * Adds the decorative animated layers (halo glow, click ripple, stars)
 * to the theme toggle button without requiring changes to the HTML.
 * @param {HTMLElement} btn The theme toggle button element
 */
function enhanceThemeToggle(btn) {
  if (btn.querySelector('.theme-toggle-glow')) return; // already enhanced

  const glow = document.createElement('span');
  glow.className = 'theme-toggle-glow';

  const burst = document.createElement('span');
  burst.className = 'theme-toggle-burst';

  const stars = document.createElement('span');
  stars.className = 'theme-toggle-stars';
  stars.innerHTML = '<i></i><i></i><i></i>';

  // Prepend so they render behind the existing sun/moon SVG icons
  btn.prepend(glow, burst, stars);
}

/**
 * Mobile navigation menu drawer interactions
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menuToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when clicking outside or clicking a nav link
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      menuToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/**
 * Scroll Reveal using Intersection Observer.
 * Automatically animates elements with the '.reveal' class as they enter viewport.
 */
export function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null, // Viewport
      rootMargin: '0px 0px -60px 0px', // Trigger slightly before element is fully visible
      threshold: 0.1 // 10% visibility
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optional: unobserve if we only want animation to run once
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('active'));
  }
}

/**
 * Helper to show temporary custom toast notifications
 * @param {string} message Text message to display
 * @param {string} type Theme type of notification (e.g., 'success')
 */
export function showNotification(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icon selector (SVG inline code for checkmark)
  const iconSvg = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  `;

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove toast after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 4000);
}
