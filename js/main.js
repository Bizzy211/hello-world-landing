/**
 * Main JavaScript
 * Handles navigation, animations, counters, and general interactivity
 */

(function() {
  'use strict';

  // ==========================================
  // Mobile Navigation
  // ==========================================

  function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!hamburger || !mobileMenu) return;

    function toggleMenu() {
      const isOpen = mobileMenu.classList.contains('open');

      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      mobileOverlay?.classList.toggle('open');

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? '' : 'hidden';

      // Update ARIA attributes
      hamburger.setAttribute('aria-expanded', !isOpen);
      mobileMenu.setAttribute('aria-hidden', isOpen);
    }

    function closeMenu() {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      mobileOverlay?.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }

    // Toggle on hamburger click
    hamburger.addEventListener('click', toggleMenu);

    // Close on overlay click
    mobileOverlay?.addEventListener('click', closeMenu);

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ==========================================
  // Smooth Scroll Navigation
  // ==========================================

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  // ==========================================
  // Back to Top Button
  // ==========================================

  function initBackToTop() {
    const button = document.querySelector('.back-to-top');
    if (!button) return;

    const showThreshold = 300;

    function toggleVisibility() {
      if (window.pageYOffset > showThreshold) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    }

    // Check initial state
    toggleVisibility();

    // Check on scroll with throttling
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Scroll to top on click
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // Animated Counters
  // ==========================================

  function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length === 0) return;

    let animated = false;

    function animateCounters() {
      if (animated) return;

      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target, 10);
        if (isNaN(target)) return;

        const duration = 2000; // Animation duration in ms
        const steps = 60; // Number of animation steps
        const increment = target / steps;
        const stepDuration = duration / steps;

        let current = 0;
        let step = 0;

        function updateCounter() {
          step++;
          // Use easing function for smoother animation
          const progress = step / steps;
          const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
          current = Math.round(target * easedProgress);

          counter.textContent = current;

          if (step < steps) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        }

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          counter.textContent = target;
        } else {
          updateCounter();
        }
      });

      animated = true;
    }

    // Set up Intersection Observer
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    });

    observer.observe(aboutSection);
  }

  // ==========================================
  // Typing Effect
  // ==========================================

  function initTypingEffect() {
    const container = document.querySelector('.typing-text');
    if (!container) return;

    const phrases = [
      'We build amazing web experiences.',
      'We create beautiful interfaces.',
      'We love clean code.',
      'We push boundaries.',
      'We make ideas reality.'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    const typingSpeed = 80;
    const deletingSpeed = 50;
    const pauseDuration = 2000;

    function type() {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        container.textContent = phrases[0];
        return;
      }

      const currentPhrase = phrases[phraseIndex];

      if (isPaused) {
        isPaused = false;
        isDeleting = true;
        setTimeout(type, pauseDuration);
        return;
      }

      if (isDeleting) {
        container.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      } else {
        container.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentPhrase.length) {
          isPaused = true;
        }
      }

      const speed = isDeleting ? deletingSpeed : typingSpeed;
      setTimeout(type, speed);
    }

    // Start typing when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          type();
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    observer.observe(container.closest('.about') || container);
  }

  // ==========================================
  // Scroll-triggered Animations
  // ==========================================

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .stat-item');
    if (animatedElements.length === 0) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Set initial state
    animatedElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  // ==========================================
  // Active Navigation Link
  // ==========================================

  function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    function updateActiveLink() {
      const scrollPos = window.pageYOffset + 150;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial check
    updateActiveLink();
  }

  // ==========================================
  // Navigation Background on Scroll
  // ==========================================

  function initNavBackground() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    function updateNavBackground() {
      if (window.pageYOffset > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateNavBackground();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateNavBackground();
  }

  // ==========================================
  // Initialize All
  // ==========================================

  function init() {
    initMobileNav();
    initSmoothScroll();
    initBackToTop();
    initCounters();
    initTypingEffect();
    initScrollAnimations();
    initActiveNavigation();
    initNavBackground();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
