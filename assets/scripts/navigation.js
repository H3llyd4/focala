(function () {
  const toggleButton = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');
  const mobileBreakpoint = 860;

  function closeMobileMenu() {
    if (!toggleButton || !navLinks) return;
    toggleButton.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
  }

  if (toggleButton && navLinks) {
    toggleButton.addEventListener('click', function () {
      const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
      toggleButton.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('is-open');
    });

    links.forEach((link) => {
      link.addEventListener('click', function () {
        if (window.innerWidth <= mobileBreakpoint) {
          closeMobileMenu();
        }
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > mobileBreakpoint) {
        closeMobileMenu();
      }
    });
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();
