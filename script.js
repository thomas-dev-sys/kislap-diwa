(function () {
  'use strict';

  /* ── DOM references ─────────────────────────── */
  const navbar = document.getElementById('navbar');
  const scrollHint = document.getElementById('scrollHint');
  const filmTitle = document.getElementById('filmTitle');
  const heroEl = document.querySelector('.hero');
  const layers = document.querySelectorAll('.hero-layer[data-speed]');
  const fadeLayers = document.querySelectorAll('.hero-layer:not(.layer-bg)');

  /* ── State ──────────────────────────────────── */
  let scrollY = 0;
  let lastScrollY = -1;
  let heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
  let resizeTimer;

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  /* ── Parallax ───────────────────────────────── */
  function applyParallax(sy) {
    layers.forEach(layer => {
      const offset = -(sy * (parseFloat(layer.dataset.speed) || 0));
      layer.style.transform = `translate3d(0,${offset}px,0)`;
    });
  }

  function applyHeroFade(sy) {
    const opacity = 1 - clamp((sy - heroHeight * 0.15) / (heroHeight * 0.50), 0, 1);
    fadeLayers.forEach(layer => { layer.style.opacity = opacity; });
  }

  /* ── Navbar ─────────────────────────────────── */
  function updateNavbar(sy) {
    navbar.classList.toggle('scrolled', sy > 24);
  }

  /* ── Scroll hint ────────────────────────────── */
  function updateScrollHint(sy) {
    if (scrollHint) scrollHint.classList.toggle('hidden', sy > 50);
  }

  /* ── Title float ────────────────────────────── */
  function startTitleFloat() {
    if (!filmTitle) return;
    setTimeout(() => filmTitle.classList.add('animate-float'), 2500);
  }

  /* ── RAF loop ───────────────────────────────── */
  function tick() {
    requestAnimationFrame(tick);
    if (scrollY === lastScrollY) return;
    lastScrollY = scrollY;
    applyParallax(scrollY);
    applyHeroFade(scrollY);
    updateNavbar(scrollY);
    updateScrollHint(scrollY);
  }

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
    }, 150);
  });

  /* ── Smooth anchor scrolling ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')) || 64;
      window.scrollTo({
        top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - navH - 10),
        behavior: 'smooth'
      });
    });
  });


  function initStarfield() {
    const canvas = document.getElementById('starsCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, stars, frameId;
    const COUNT = 500;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.3,
        speed: Math.random() * 0.008 + 0.003,
        phase: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.08,
      }));
    }

    function render(time) {
      ctx.clearRect(0, 0, W, H);
      const t = time * 0.001;
      stars.forEach(s => {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed * 6 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold
          ? `rgba(245,200,66,${a * 0.9})`
          : `rgba(255,255,255,${a})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(render);
    }

    /* Only animate when section is in view */
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!frameId) frameId = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      });
    }, { threshold: 0.01 }).observe(canvas);

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
  }


  function initReveal() {
    document.querySelectorAll('.reveal-el').forEach(el => {
      new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }).observe(el);
    });
  }

  /* ── Data ────────────────────────────────────── */
  const LABS_DATA = [
    {
      name: 'Computer Laboratory',
      img: 'images/computer-lab.png',
      stripe: 'red',
      desc: 'The CCIT Computer Laboratory is a technology-equipped learning environment designed to support Information Technology and Computing-related laboratory activities. It provides students with access to computers, specialized software, and digital resources for programming, system development, multimedia production, networking, and other hands-on technical exercises.',
      pdfLabel: 'Computer Laboratory Safety Instruction Manual',
      pdfUrl: '#',
      guidelines: [
        { title: 'Log In Procedures', body: 'Always log in using your assigned credentials. Never share your login with others. Log out properly after each session to protect your work.' },
        { title: 'Equipment Care', body: 'Handle all equipment with care. Report damaged or malfunctioning hardware immediately to the laboratory aide or supervisor.' },
        { title: 'No Food & Drinks', body: 'Strictly no food or drinks inside the laboratory. Spills can cause permanent damage to computers and pose safety hazards.' },
        { title: 'Software Policy', body: 'Do not install unauthorized software. Only use programs approved for academic use. Downloading pirated content is strictly prohibited.' },
        { title: 'Noise Regulation', body: 'Maintain a quiet environment. Use headphones when audio is required. Loud conversations are not allowed during laboratory hours.' },
        { title: 'Emergency Exit', body: 'Familiarize yourself with the emergency exit procedures. In case of fire or emergency, calmly proceed to the nearest exit.' },
      ],
    },
    {
      name: 'Chemistry Laboratory',
      img: 'images/chemistry-lab.png',
      stripe: 'navy',
      desc: 'The COE Chemistry Laboratory is a specialized facility where engineering students conduct chemistry experiments and practical activities. It provides a controlled environment for learning chemical principles, performing laboratory procedures, analyzing substances, and developing safe laboratory practices essential to engineering education.',
      pdfLabel: 'Chemistry Laboratory Safety Instruction Manual',
      pdfUrl: '#',
      guidelines: [
        { title: 'PPE Required', body: 'Personal protective equipment including lab coat, goggles, and gloves must be worn at all times while inside the laboratory.' },
        { title: 'Chemical Handling', body: 'Read the Safety Data Sheet (SDS) before using any chemical. Never smell or taste unknown substances under any circumstances.' },
        { title: 'Waste Disposal', body: 'Dispose of chemical waste only in designated containers. Pouring chemicals down the drain is strictly prohibited without proper authorization.' },
        { title: 'Fire Safety', body: 'Know the location of fire extinguishers, eye-wash stations, and emergency showers before beginning any experiment.' },
        { title: 'No Open Flames', body: 'Open flames are prohibited near flammable chemicals. Use electric hotplates unless specifically instructed to use a Bunsen burner.' },
        { title: 'Spill Procedure', body: 'Report all chemical spills immediately. Follow the posted spill response procedure and notify the laboratory supervisor at once.' },
      ],
    },
    {
      name: 'Kitchen Laboratory',
      img: 'images/kitchen-lab.png',
      stripe: 'orange',
      desc: 'The CTHM Kitchen Laboratory is a professional training facility used by Hospitality Management students to develop culinary skills and food preparation techniques. It offers a realistic kitchen environment where students practice cooking, food safety, sanitation, kitchen operations, and hospitality industry standards through hands-on learning experiences.',
      pdfLabel: 'Kitchen Laboratory Safety Instruction Manual',
      pdfUrl: '#',
      guidelines: [
        { title: 'Personal Hygiene', body: 'Wash your hands thoroughly before and after handling food. Hair must be properly tied back and appropriate kitchen uniforms must be worn at all times.' },
        { title: 'Knife Safety', body: 'Always handle knives carefully and cut away from your body. Store knives properly after use and never leave sharp tools unattended on workstations.' },
        { title: 'Heat Precautions', body: 'Use oven mitts or dry towels when handling hot cookware. Be cautious around stoves, ovens, and boiling liquids to prevent burns and accidents.' },
        { title: 'Clean Workstations', body: 'Keep all preparation areas clean and sanitized during and after cooking activities. Immediately wipe spills to avoid slips and contamination.' },
        { title: 'Food Storage', body: 'Store raw and cooked food separately to prevent cross-contamination. Properly label and refrigerate perishable ingredients after use.' },
        { title: 'Appliance Shutdown', body: 'Turn off all kitchen appliances and gas valves after use. Inspect your station before leaving to ensure the laboratory remains safe and organized.' },
      ],
    },
  ];

  /* ── State ───────────────────────────────────── */
  let currentLabIdx = 0;
  let labAnimating = false;
  const GUIDE_VISIBLE = 5; // how many guide cards shown (center ± 2)

  /* ── Starfield for labs ──────────────────────── */
  function initLabsStarfield() {
    const canvas = document.getElementById('labsStarsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars, frameId;
    const COUNT = 1000;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        speed: Math.random() * 0.006 + 0.002,
        phase: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.07,
      }));
    }

    function render(time) {
      ctx.clearRect(0, 0, W, H);
      const t = time * 0.001;
      stars.forEach(s => {
        const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 6 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold ? `rgba(245,200,66,${a * 0.85})` : `rgba(255,255,255,${a})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(render);
    }

    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (!frameId) frameId = requestAnimationFrame(render); }
        else { cancelAnimationFrame(frameId); frameId = null; }
      });
    }, { threshold: 0.01 }).observe(canvas);

    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    resize();
  }

  /* ── Parallax for labs section ───────────────── */
  function initLabsParallax() {
    const labsSection = document.querySelector('.labs-section');
    const layers = document.querySelectorAll('.labs-parallax-layer[data-labs-speed]');
    if (!labsSection || !layers.length) return;

    function update() {
      const rect = labsSection.getBoundingClientRect();
      const relScroll = -rect.top;
      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.labsSpeed) || 0;
        layer.style.transform = `translateY(${relScroll * speed}px)`;
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Build lab stack ─────────────────────────── */
  function buildLabStack() {
    const stack = document.getElementById('labStack');
    if (!stack) return;
    stack.innerHTML = '';

    // Build cards in reverse so first lab is on top
    for (let i = LABS_DATA.length - 1; i >= 0; i--) {
      const lab = LABS_DATA[i];
      const card = document.createElement('div');
      card.className = 'lab-card';
      card.dataset.labIdx = i;
      card.dataset.stripe = lab.stripe;

      card.innerHTML = `
        <div class="lab-card-img">
          <img src="${lab.img}" alt="${lab.name}" />
        </div>
        <div class="lab-card-body">
          <div class="lab-card-title">${lab.name}</div>
          <p class="lab-card-desc">${lab.desc}</p>
        </div>
      `;
      stack.appendChild(card);
    }

    updateLabStackPositions(false);
  }

  function updateLabStackPositions(animate) {
    const cards = Array.from(document.querySelectorAll('.lab-card'));
    const total = LABS_DATA.length;
    cards.forEach(card => {
      const labIdx = parseInt(card.dataset.labIdx);
      // Position relative to current: 0=front, 1=next, etc.
      let pos = (labIdx - currentLabIdx + total) % total;
      card.dataset.pos = pos < 8 ? pos : 'hidden';
    });
  }

  function advanceLab() {
    if (labAnimating) return;
    labAnimating = true;

    // Find front card
    const frontCard = document.querySelector('.lab-card[data-pos="0"]');
    if (!frontCard) { labAnimating = false; return; }

    // Animate front card flying to back
    frontCard.classList.add('fly-to-back');
    frontCard.addEventListener('animationend', () => {
      frontCard.classList.remove('fly-to-back');
      currentLabIdx = (currentLabIdx + 1) % LABS_DATA.length;
      updateLabStackPositions(true);
      updateLabNav();
      updateGuidelinesCarousel();
      updateDownloadBtn();
      labAnimating = false;
    }, { once: true });
  }

  function retreatLab() {
    if (labAnimating) return;
    labAnimating = true;
    currentLabIdx = (currentLabIdx - 1 + LABS_DATA.length) % LABS_DATA.length;
    updateLabStackPositions(true);
    updateLabNav();
    updateGuidelinesCarousel();
    updateDownloadBtn();
    labAnimating = false;
  }

  function updateLabNav() {
    const label = document.getElementById('labNavLabel');
    if (label) label.textContent = LABS_DATA[currentLabIdx].name;
  }

  function updateDownloadBtn() {
    const btn = document.getElementById('labsDownloadBtn');
    const text = document.getElementById('labsDlText');
    if (!btn || !text) return;
    const lab = LABS_DATA[currentLabIdx];
    text.textContent = lab.pdfLabel;
    btn.href = lab.pdfUrl;
  }

  /* ── Guidelines flat carousel ───────────────────── */
  let currentGuideIdx = 0;
  let guideAnimating = false;

  /*
    Flat table layout:
    - All cards sit at the same absolute centre position
    - Each card is offset by (slot * CARD_STEP)px horizontally
    - The active card is always at offset 0 (centre)
    - Cards shrink + dim the further they are from centre
    - Clicking any card slides the whole row so it lands at centre
  */
  const CARD_STEP = 180;   // px between card centres
  const MAX_VISIBLE = 2;    // slots visible each side before fading out

  function buildGuidelinesCarousel() {
    currentGuideIdx = 0;
    renderFanCarousel();
  }

  function updateGuidelinesCarousel() {
    currentGuideIdx = 0;
    renderFanCarousel();
  }

  function renderFanCarousel() {
    const container = document.getElementById('guidelinesCarousel');
    const dotsEl = document.getElementById('guideDots');
    if (!container) return;

    const guidelines = LABS_DATA[currentLabIdx].guidelines;
    const total = guidelines.length;

    container.innerHTML = '';

    for (let i = 0; i < total; i++) {
      const g = guidelines[i];
      const card = document.createElement('div');
      card.className = 'guide-card';
      card.dataset.idx = i;

      card.innerHTML = `
        <div class="guide-card-num">Guideline #${i + 1}</div>
        <div class="guide-card-title">${g.title}</div>
        <div class="guide-card-body">${g.body}</div>
      `;

      card.addEventListener('click', () => {
        if (!card.classList.contains('fan-active') && !guideAnimating) {
          rotateFanTo(parseInt(card.dataset.idx));
        }
      });

      container.appendChild(card);
    }

    applyFanPositions(false);

    /* Dots */
    if (dotsEl) {
      dotsEl.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'guide-dot' + (i === currentGuideIdx ? ' active' : '');
        dot.setAttribute('aria-label', `Guideline ${i + 1}`);
        dot.addEventListener('click', () => {
          if (i !== currentGuideIdx && !guideAnimating) rotateFanTo(i);
        });
        dotsEl.appendChild(dot);
      }
    }
  }

  function applyFanPositions(animate) {
    const container = document.getElementById('guidelinesCarousel');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.guide-card'));
    const total = cards.length;
    if (!total) return;

    cards.forEach(card => {
      const idx = parseInt(card.dataset.idx);
      let offset = idx - currentGuideIdx;

      /* Wrap to shortest circular path */
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      const absOff = Math.abs(offset);
      const visible = absOff <= MAX_VISIBLE;

      /* Horizontal position */
      const tx = offset * CARD_STEP;

      /* Scale only — no opacity reduction */
      const scale = Math.max(0.72, 1 - absOff * 0.09);
      const opacity = visible ? 1 : 0;

      /* Z-index: active on top, decreasing outward */
      const zIndex = total - absOff;

      card.style.transform = `translateX(${tx}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
      card.style.pointerEvents = visible && offset !== 0 ? 'auto' : (offset === 0 ? 'none' : 'none');

      card.classList.toggle('fan-active', offset === 0);

      if (!animate) {
        card.style.transition = 'none';
        card.getBoundingClientRect(); // force reflow
        card.style.transition = '';
      }
    });

    /* Sync dots */
    const dots = document.querySelectorAll('.guide-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentGuideIdx));
  }

  function rotateFanTo(targetIdx) {
    if (guideAnimating) return;
    guideAnimating = true;
    currentGuideIdx = targetIdx;
    applyFanPositions(true);
    setTimeout(() => { guideAnimating = false; }, 600);
  }

  /* ── Bind nav buttons ────────────────────────── */
  function initLabsNav() {
    const prevBtn = document.getElementById('labPrev');
    const nextBtn = document.getElementById('labNext');
    if (prevBtn) prevBtn.addEventListener('click', retreatLab);
    if (nextBtn) nextBtn.addEventListener('click', advanceLab);
  }

  /* ── Init laboratories ───────────────────────── */
  function initLaboratories() {
    buildLabStack();
    buildGuidelinesCarousel();
    updateLabNav();
    updateDownloadBtn();
    initLabsNav();
    initLabsStarfield();
    initLabsParallax();
  }

  function initAboutSection() {
    const aboutSection = document.querySelector('.about-section');
    const aboutBg = document.getElementById('aboutBg');
    const aboutLayers = document.querySelectorAll('.about-parallax-layer[data-about-speed]');
    const lightbox = document.getElementById('cardLightbox');
    const lbBackdrop = document.getElementById('cardLightboxBackdrop');
    const lbCard = document.getElementById('cardLightboxCard');
    const lbImg = document.getElementById('cardLightboxImg');
    const memberCards = document.querySelectorAll('.member-card');

    if (!aboutSection) return;

    /* ── Background + layer parallax ──────────── */
    function updateAboutParallax() {
      if (!aboutBg) return;
      const rect = aboutSection.getBoundingClientRect();
      const relScroll = -rect.top;   // 0 when section top hits viewport top

      /* Bg moves at a gentle 0.30 rate — creates depth vs content */
      aboutBg.style.transform = `translateY(${relScroll * 0.10}px)`;

      /* Tint layers */
      aboutLayers.forEach(layer => {
        const speed = parseFloat(layer.dataset.aboutSpeed) || 0;
        layer.style.transform = `translateY(${relScroll * speed}px)`;
      });
    }

    window.addEventListener('scroll', updateAboutParallax, { passive: true });
    updateAboutParallax();

    /* ── Card lightbox ─────────────────────────── */
    let activeCard = null;   // track which card is currently "picked up"

    function openLightbox(card) {
      const img = card.querySelector('img');
      if (!img || !lbImg) return;

      // Ghost the original card so it looks picked up
      if (activeCard) activeCard.classList.remove('card-picked');
      activeCard = card;
      card.classList.add('card-picked');

      lbImg.src = img.src;
      lbImg.alt = img.alt;

      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';

      // Restore the ghosted card after lightbox fades out
      if (activeCard) {
        const card = activeCard;
        setTimeout(() => card.classList.remove('card-picked'), 350);
        activeCard = null;
      }
    }

    memberCards.forEach(card => {
      card.addEventListener('click', () => openLightbox(card));
    });

    /* Close on backdrop click */
    if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  function initWatchSection() {
    const watchBg = document.getElementById('watchBg');
    if (!watchBg) return;

    function updateWatchParallax() {
      const section = watchBg.closest('.watch-section');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const relScroll = -rect.top;
      watchBg.style.transform = `translateY(${relScroll * 0.12}px)`;
    }

    window.addEventListener('scroll', updateWatchParallax, { passive: true });
    updateWatchParallax();
  }


  function initFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    const openBtn = document.getElementById('feedbackBtn');
    const closeBtn = document.getElementById('feedbackClose');
    const backdrop = document.getElementById('feedbackBackdrop');
    const form = document.getElementById('feedbackForm');
    const success = document.getElementById('feedbackSuccess');

    if (!modal || !openBtn) return;

    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      // reset to form view each time
      form.classList.remove('is-hidden');
      success.classList.remove('is-visible');
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    let isSubmitting = false;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (isSubmitting) return;

      const name = form.querySelector('#fbName').value.trim();
      const email = form.querySelector('#fbEmail').value.trim();
      const message = form.querySelector('#fbMessage').value.trim();
      if (!name || !email || !message) return;

      isSubmitting = true;
      const submitBtn = form.querySelector('.fb-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      const templateParams = {
        from_name: name,
        from_email: email,
        to_name: name,
        to_email: email,
        message: message,
      };

      emailjs.send('service_nb49q9c', 'template_wln9lkj', templateParams)
        .then(() => emailjs.send('service_nb49q9c', 'template_thjcbao', templateParams))
        .then(() => {
          form.classList.add('is-hidden');
          success.classList.add('is-visible');

          setTimeout(closeModal, 3000);
          setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
            isSubmitting = false;
          }, 3200);
        })
        .catch((error) => {
          console.error('EmailJS error:', error);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
          isSubmitting = false;
          alert('Something went wrong. Please try again.');
        });
    });
  }

  /* ── Init ────────────────────────────────────── */
  function init() {
    applyParallax(0);
    applyHeroFade(0);
    tick();
    startTitleFloat();
    initStarfield();
    initReveal();
    initLaboratories();
    initAboutSection();
    initWatchSection();
    initFeedbackModal();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
