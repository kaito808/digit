(function () {
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('global-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const backToTop = document.querySelector('.back-to-top');
  const counters = document.querySelectorAll('.counter');
  const contactForm = document.querySelector('.contact-form');
  const feedbackEl = document.querySelector('.form-feedback');

  const setYear = () => {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  };

  const toggleNav = () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle?.setAttribute('aria-expanded', isOpen);
  };

  const closeNav = () => {
    nav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  };

  const handleScroll = () => {
    const offset = window.scrollY || window.pageYOffset;
    if (offset > 120) {
      backToTop?.classList.add('is-visible');
      header?.classList.add('is-shrunk');
    } else {
      backToTop?.classList.remove('is-visible');
      header?.classList.remove('is-shrunk');
    }
  };

  const animateCounters = () => {
    if (!('IntersectionObserver' in window)) {
      counters.forEach((counter) => {
        counter.textContent = counter.dataset.target;
      });
      return;
    }

    const easeOutQuad = (t) => t * (2 - t);

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.dataset.target || 0);
        let start = 0;
        const duration = 1600;
        const startTime = performance.now();

        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const value = Math.floor(easeOutQuad(progress) * (target - start) + start);
          el.textContent = value.toString();
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach((counter) => observer.observe(counter));
  };

  const enhanceAnchorLinks = () => {
    if (!nav) return;
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 960) {
          closeNav();
        }
      });
    });
  };

  const handleFormSubmit = () => {
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (feedbackEl) {
        feedbackEl.textContent = '送信中…';
      }

      const formData = new FormData(contactForm);
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました。');
        }

        const result = await response.json();
        if (result.success) {
          if (feedbackEl) {
            feedbackEl.textContent = '送信が完了しました。担当者よりご連絡いたします。';
          }
          contactForm.reset();
        } else {
          if (feedbackEl) {
            feedbackEl.textContent = result.message || '送信に失敗しました。時間をおいて再度お試しください。';
          }
        }
      } catch (error) {
        if (feedbackEl) {
          feedbackEl.textContent = error.message || '送信に失敗しました。';
        }
      }
    });
  };

  const init = () => {
    setYear();
    animateCounters();
    enhanceAnchorLinks();
    handleFormSubmit();

    menuToggle?.addEventListener('click', toggleNav);
    backToTop?.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
