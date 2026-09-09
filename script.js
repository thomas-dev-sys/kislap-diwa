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

  /* ── Mobile breakpoint helper ───────────────── */
  const MOBILE_BP = 768;
  const isMobile = () => window.innerWidth <= MOBILE_BP;

  /* ── Parallax ───────────────────────────────── */
  function applyParallax(sy) {
    if (isMobile()) {
      // Clear any previously set inline transforms so CSS takes full control
      layers.forEach(layer => { layer.style.transform = ''; });
      return;
    }
    layers.forEach(layer => {
      const offset = -(sy * (parseFloat(layer.dataset.speed) || 0));
      layer.style.transform = `translate3d(0,${offset}px,0)`;
    });
  }

  function applyHeroFade(sy) {
    if (isMobile()) {
      // Remove inline opacity on mobile — keep all layers fully visible
      fadeLayers.forEach(layer => { layer.style.opacity = ''; });
      return;
    }
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

  /* ── Scroll-driven callback registry ─────────────
     Sections (about/watch parallax, etc.) register their update fn here
     instead of adding their own 'scroll' listeners. Everything then reads
     layout (getBoundingClientRect) and writes styles inside ONE rAF pass,
     instead of each section doing its own read→write on every raw scroll
     event — which is what was causing the "Forced reflow" warning. */
  const scrollCallbacks = [];
  function registerScrollUpdate(fn) { scrollCallbacks.push(fn); }

  /* ── RAF loop ───────────────────────────────── */
  function tick() {
    requestAnimationFrame(tick);
    if (scrollY === lastScrollY) return;
    lastScrollY = scrollY;
    applyParallax(scrollY);
    applyHeroFade(scrollY);
    updateNavbar(scrollY);
    updateScrollHint(scrollY);
    for (let i = 0; i < scrollCallbacks.length; i++) scrollCallbacks[i]();
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
      img: 'images/computer-lab.webp',
      stripe: 'red',
      desc: 'The CCIT Computer Laboratory is a technology-equipped learning environment designed to support Information Technology and Computing-related laboratory activities. It provides students with access to computers, specialized software, and digital resources for programming, system development, multimedia production, networking, and other hands-on technical exercises.',
      pdfLabel: 'Computer Laboratory Safety Guidelines',
      pdfUrl: 'manuals/Computer Laboratory Manual.pdf',
      guidelines: [
        { title: 'Academic Use Only', body: 'Computer units in the laboratory are strictly for academic, instructional, and research purposes only.' },
        { title: 'Do Not Disconnect Cables', body: 'Do not disconnect or remove any cables from the computer units to connect personal devices such as laptops, switches, or other equipment.' },
        { title: 'Do Not Dismantle Equipment', body: 'Do not dismantle, open, or modify any laboratory equipment in an attempt to troubleshoot or repair issues.' },
        { title: 'No Games', body: 'Playing any kind of games on laboratory computers is strictly prohibited.' },
        { title: 'Authorized Software Only', body: 'Only software owned by or properly licensed to National University shall be installed on laboratory computers.' },
        { title: 'No Software Installation', body: 'Lab users are strictly prohibited from installing or downloading software on any computer unit in the laboratory.' },
        { title: 'Save Files at Your Own Risk', body: 'Lab users may save files to the D:\\ drive at their own risk. ITSO is not responsible for files that are lost, stolen, deleted, or otherwise become inaccessible.' },
        { title: 'No System Modifications', body: 'Modifying desktop wallpapers, system settings, or any computer configuration is strictly prohibited.' },
        { title: 'No Security Violations', body: 'Attempts to compromise system security, including guessing passwords or using hacking tools or software, are strictly prohibited and may result in disciplinary action.' },
        { title: 'No Harassing or Offensive Content', body: 'Sending or sharing harassing, threatening, or offensive messages, pictures, or files is strictly prohibited.' },
        { title: 'No Pornographic or Explicit Content', body: 'Accessing pornographic materials or sexually explicit websites using laboratory computers is strictly prohibited.' },
      ],
    },
    {
      name: 'Chemistry Laboratory',
      img: 'images/chemistry-lab.webp',
      stripe: 'navy',
      desc: 'The COE Chemistry Laboratory is a specialized facility where engineering students conduct chemistry experiments and practical activities. It provides a controlled environment for learning chemical principles, performing laboratory procedures, analyzing substances, and developing safe laboratory practices essential to engineering education.',
      pdfLabel: 'Chemistry Laboratory Safety Guidelines',
      pdfUrl: 'manuals/Chemistry Laboratory Manual.pdf',
      guidelines: [
        { title: 'Know the Safety Equipment', body: 'Be familiar with the location and proper operation of the eyewash station and safety shower before starting laboratory work.' },
        { title: 'Prevent Chemical Exposure', body: 'Understand that chemicals can enter the body through inhalation, ingestion, and skin absorption, and always follow proper safety precautions.' },
        { title: 'Wear Proper Protective Gear', body: 'Wear safety goggles and closed-toe shoes when chemicals are used. Contact lenses and open-toed footwear are not permitted.' },
        { title: 'No Food or Drinks', body: 'Food and drinks are strictly prohibited inside the laboratory.' },
        { title: 'Wash Hands Thoroughly', body: 'Wash your hands and forearms thoroughly after conducting laboratory activities.' },
        { title: 'Dispose of Chemicals Properly', body: 'Follow the proper chemical disposal procedures. Never dispose of chemicals in unauthorized containers or drains.' },
        { title: 'Handle Test Tubes Safely', body: 'When holding or heating a test tube, never point it toward yourself or others.' },
        { title: 'Tie Back Long Hair', body: 'Always tie back long hair securely before conducting experiments.' },
        { title: 'Keep the Workspace Clear', body: 'Place backpacks and unnecessary items in designated areas. Keep only the materials needed for the experiment on the worktable.' },
        { title: 'Review the MSDS', body: 'Review the Material Safety Data Sheet (MSDS) before beginning an experiment to understand the hazards, handling, and safety precautions for the chemicals being used.' },
      ],
    },
    {
      name: 'Kitchen Laboratory',
      img: 'images/kitchen-lab.webp',
      stripe: 'orange',
      desc: 'The CTHM Kitchen Laboratory is a professional training facility used by Hospitality Management students to develop culinary skills and food preparation techniques. It offers a realistic kitchen environment where students practice cooking, food safety, sanitation, kitchen operations, and hospitality industry standards through hands-on learning experiences.',
      pdfLabel: 'Kitchen Laboratory Safety Guidelines',
      pdfUrl: 'manuals/Kitchen Laboratory Manual.pdf',
      guidelines: [
        { title: 'Follow Instructions', body: 'Follow all instructions and guidelines provided by the instructor or laboratory supervisor throughout the class.' },
        { title: 'Authorized Supervision Only', body: 'Conduct laboratory activities only under the supervision of authorized personnel. Only the laboratory custodian may operate or access the gas lines and ovens.' },
        { title: 'No Horseplay', body: 'Avoid horseplay, distractions, and disruptive behavior. Always act respectfully and responsibly to maintain a safe laboratory environment.' },
        { title: 'Wear Complete Chef’s Uniform', body: 'Wear a complete and clean chef’s uniform, including a chef’s hat (hamlet), apron, and slip-resistant enclosed shoes.' },
        { title: 'No Jewelry or Artificial Nails', body: 'Do not wear jewelry or accessories. Keep fingernails short and clean; artificial nails and nail polish are strictly prohibited.' },
        { title: 'Wash Hands Properly', body: 'Wash hands thoroughly before handling food and immediately after contact with raw ingredients or cleaning agents.' },
        { title: 'Report Illness or Open Wounds', body: 'Inform the instructor if you are unwell or have open wounds, as this may affect food safety and the well-being of others.' },
        { title: 'Prevent Cross-Contamination', body: 'Follow proper food storage, preparation, cooking temperatures, and handling procedures. Keep raw and cooked foods separate and use clean equipment.' },
        { title: 'No Eating', body: 'Eating inside the laboratory is strictly prohibited, except during authorized food tasting or evaluation activities.' },
        { title: 'Never Leave Equipment Unattended', body: 'Stoves and ovens must never be left unattended while in use. Always monitor cooking equipment throughout the activity.' },
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
      if (isMobile()) {
        layers.forEach(layer => { layer.style.transform = ''; });
        return;
      }
      const rect = labsSection.getBoundingClientRect();
      const relScroll = -rect.top;
      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.labsSpeed) || 0;
        layer.style.transform = `translateY(${relScroll * speed}px)`;
      });
    }

    registerScrollUpdate(update);
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
          <img src="${lab.img.replace('.webp', '-1200.webp')}"
               srcset="${lab.img.replace('.webp', '-700.webp')} 700w, ${lab.img.replace('.webp', '-1200.webp')} 1200w"
               sizes="(max-width: 1024px) 90vw, 640px"
               alt="${lab.name}" loading="lazy" decoding="async" />
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
    const labels = document.querySelectorAll('.labs-nav-label');

    labels.forEach(label => {
      label.textContent = LABS_DATA[currentLabIdx].name;
    });
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
  const CARD_STEP_RATIO = 0.62; // matches the original 180px step at the ~290px desktop card width
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

    /* Step scales with the card's actual rendered width, so the fan stays
       just as tight (relatively) on small mobile cards as on desktop ones,
       instead of using one fixed px value for every screen size. */
    const cardWidth = cards[0].getBoundingClientRect().width || 260;
    const cardStep = cardWidth * CARD_STEP_RATIO;

    cards.forEach(card => {
      const idx = parseInt(card.dataset.idx);
      let offset = idx - currentGuideIdx;

      /* Wrap to shortest circular path */
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      const absOff = Math.abs(offset);
      const visible = absOff <= MAX_VISIBLE;

      /* Horizontal position */
      const tx = offset * cardStep;

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
    const prevBtns = document.querySelectorAll('.lab-prev');
    const nextBtns = document.querySelectorAll('.lab-next');

    prevBtns.forEach(btn => {
      btn.addEventListener('click', retreatLab);
    });

    nextBtns.forEach(btn => {
      btn.addEventListener('click', advanceLab);
    });
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

      if (isMobile()) {
        // Freeze background — clear any lingering inline transform
        aboutBg.style.transform = '';
        aboutLayers.forEach(layer => { layer.style.transform = ''; });
        return;
      }

      const rect = aboutSection.getBoundingClientRect();
      const relScroll = -rect.top;

      aboutBg.style.transform = `translateY(${relScroll * 0.10}px)`;

      aboutLayers.forEach(layer => {
        const speed = parseFloat(layer.dataset.aboutSpeed) || 0;
        layer.style.transform = `translateY(${relScroll * speed}px)`;
      });
    }

    registerScrollUpdate(updateAboutParallax);
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
      if (isMobile()) {
        // Freeze the cloud-building background in place
        watchBg.style.transform = '';
        return;
      }
      const section = watchBg.closest('.watch-section');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const relScroll = -rect.top;
      watchBg.style.transform = `translateY(${relScroll * 0.12}px)`;
    }

    registerScrollUpdate(updateWatchParallax);
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
