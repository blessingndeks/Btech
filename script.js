const FORMSPREE_URL = 'https://formspree.io/f/meeprorj';

/* One-page scroll navigation — smooth-scrolls to sections + highlights the active nav link */
(function initScrollNav() {
  const navLinks = document.querySelectorAll('a[data-page]');
  const pages    = document.querySelectorAll('.page');

  if (!pages.length) return;

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id     = link.dataset.page;
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    });
  });

  // Highlight the nav link for whichever section is currently in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  pages.forEach(p => observer.observe(p));

  // If the page loads with a hash (e.g. yoursite.com/#projects), jump straight there
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) setTimeout(() => target.scrollIntoView(), 0);
  }
})();


/* Project Filter */
(function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.style.display = '';
          card.style.animation = 'fadeInCard 0.35s ease forwards';
          if (card.classList.contains('featured')) {
            card.style.gridColumn = '1 / -1';
          }
        } else {
          card.style.display = 'none';
          card.style.animation = '';
        }
      });
    });
  });
})();


/* Contact Form Validation */
(function initContactForm() {
  const form      = document.querySelector('.contact-form-wrap');
  if (!form) return;

  const nameInput  = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const msgInput   = document.getElementById('contact-message');
  const submitBtn  = document.getElementById('contact-submit');

  if (!nameInput || !emailInput || !msgInput || !submitBtn) return;

  // Error/Success State Handlers
  function setError(input, msg) {
    clearError(input);
    input.classList.add('input-error');
    const err = document.createElement('span');
    err.className   = 'field-error';
    err.textContent = msg;
    input.parentNode.appendChild(err);
  }

  function clearError(input) {
    input.classList.remove('input-error', 'input-ok');
    const existing = input.parentNode.querySelector('.field-error');
    if (existing) existing.remove();
  }

  function setOk(input) {
    clearError(input);
    input.classList.add('input-ok');
  }

  function resetBtn() {
    submitBtn.disabled     = false;
    submitBtn.textContent  = 'Send Transmission';
    submitBtn.classList.remove('btn-loading', 'btn-success', 'btn-error');
  }

  // Form validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  nameInput.addEventListener('blur', () => {
    nameInput.value.trim() ? setOk(nameInput) : setError(nameInput, 'Name is required.');
  });

  emailInput.addEventListener('blur', () => {
    const val = emailInput.value.trim();
    if (!val)                    setError(emailInput, 'Email address is required.');
    else if (!emailRe.test(val)) setError(emailInput, 'Please enter a valid email address.');
    else                         setOk(emailInput);
  });

  msgInput.addEventListener('blur', () => {
    msgInput.value.trim() ? setOk(msgInput) : setError(msgInput, 'Message cannot be empty.');
  });

  [nameInput, emailInput, msgInput].forEach(el => {
    el.addEventListener('input', () => {
      if (el.classList.contains('input-error')) clearError(el);
    });
  });

  // Submit handler
  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    let valid = true;

    if (!nameInput.value.trim()) {
      setError(nameInput, 'Name is required.');
      valid = false;
    } else { setOk(nameInput); }

    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      setError(emailInput, 'Email address is required.');
      valid = false;
    } else if (!emailRe.test(emailVal)) {
      setError(emailInput, 'Please enter a valid email address.');
      valid = false;
    } else { setOk(emailInput); }

    if (!msgInput.value.trim()) {
      setError(msgInput, 'Message cannot be empty.');
      valid = false;
    } else { setOk(msgInput); }

    if (!valid) return;

    // Loading state
    submitBtn.disabled    = true;
    submitBtn.innerHTML   = 'Sending Message<span class="btn-dots"><span>.</span><span>.</span><span>.</span></span>';
    submitBtn.classList.add('btn-loading');

    // POST to Formspree 
    fetch(FORMSPREE_URL, {
      method  : 'POST',
      headers : { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body    : JSON.stringify({
        name   : nameInput.value.trim(),
        email  : emailInput.value.trim(),
        message: msgInput.value.trim(),
      }),
    })
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(() => {
      // Success
      submitBtn.classList.remove('btn-loading');
      submitBtn.classList.add('btn-success');
      submitBtn.textContent = 'Message Sent ✓';

      [nameInput, emailInput, msgInput].forEach(el => {
        el.value = '';
        clearError(el);
      });

      setTimeout(resetBtn, 3000);
    })
    .catch(() => {
      // Error
      submitBtn.classList.remove('btn-loading');
      submitBtn.classList.add('btn-error');
      submitBtn.textContent = 'Failed - Try Again';
      setTimeout(resetBtn, 4000);
    });
  });
})();


/* MOBILE NAV TOGGLE */
(function initMobileNav() {
  const burger = document.querySelector('.nav-burger');
  const nav    = document.querySelector('nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    burger.classList.toggle('burger-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
      burger.classList.remove('burger-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('header')) {
      nav.classList.remove('nav-open');
      burger.classList.remove('burger-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* Styles */
(function injectStyles() {
  if (document.getElementById('portfolio-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'portfolio-keyframes';
  style.textContent = `
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Form feedback ── */
    .input-error { border-color: #ff4444 !important; outline: none; }
    .input-ok    { border-color: var(--green) !important; }
    .field-error {
      display: block;
      font-family: 'Share Tech Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #ff4444;
      margin-top: 6px;
    }

    /* ── Submit button states ── */
    .submit-btn.btn-loading { opacity: 0.75; cursor: not-allowed; }
    .submit-btn.btn-success { background: var(--green) !important; color: #000 !important; cursor: default; }
    .submit-btn.btn-error   { background: #ff4444 !important; color: #fff !important; cursor: default; }

    .btn-dots span { animation: dotBlink 1.2s infinite; opacity: 0; }
    .btn-dots span:nth-child(2) { animation-delay: 0.2s; }
    .btn-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotBlink {
      0%,80%,100% { opacity: 0; }
      40%         { opacity: 1; }
    }

    /* ── Mobile nav ── */
    .nav-burger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
    }
    .nav-burger span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--gray-light);
      border-radius: 2px;
      transition: transform 0.25s, opacity 0.25s, background 0.2s;
    }
    .nav-burger.burger-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: var(--green); }
    .nav-burger.burger-open span:nth-child(2) { opacity: 0; }
    .nav-burger.burger-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: var(--green); }

    @media (max-width: 768px) {
      .nav-burger { display: flex; }
      nav {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(10,10,10,0.97);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border);
        flex-direction: column;
        align-items: flex-start;
        gap: 0;
        padding: 8px 0;
        z-index: 99;
      }
      nav.nav-open { display: flex; }
      nav a {
        width: 100%;
        padding: 14px 24px;
        border-bottom: 1px solid var(--border);
      }
      nav a::after { display: none; }
      nav .hire-btn { display: block; margin: 12px 24px; text-align: center; }
    }
  `;
  document.head.appendChild(style);
})();