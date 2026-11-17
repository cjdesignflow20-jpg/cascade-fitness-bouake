/* ==========================================================================
   CASCADE FITNESS & SPA · BOUAKÉ
   Script Principal : Animations GSAP & Carrousel Continu Infini
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Enregistrement des plugins GSAP
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  } else {
    console.warn('GSAP non détecté, exécution des fallbacks CSS.');
    return;
  }

  /* --------------------------------------------------------------------------
     1. GESTION DE LA BARRE DE NAVIGATION (SCROLL & MENU MOBILE)
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      mobileToggle.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  /* --------------------------------------------------------------------------
     2. ANIMATION D'ENTRÉE DU HERO (SYNCHRONISÉE & CADENCÉE)
     -------------------------------------------------------------------------- */
  const heroTl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    delay: 0.2
  });

  // 1. Apparition douce de la Navbar
  heroTl.fromTo('#navbar', 
    { y: -25, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }
  );

  // 2. Sur-titre / Eyebrow badge
  heroTl.fromTo('.anim-eyebrow', 
    { y: 25, opacity: 0, scale: 0.96 }, 
    { y: 0, opacity: 1, scale: 1, duration: 0.8 }, 
    '-=0.4'
  );

  // 3. Titre principal en 2 lignes masquées (Reveal élégant)
  heroTl.fromTo('.hero-title .title-line', 
    { yPercent: 120, opacity: 0 }, 
    { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.22, ease: 'power4.out' }, 
    '-=0.4'
  );

  // 4. Paragraphe descriptif
  heroTl.fromTo('.hero-description', 
    { y: 30, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.9 }, 
    '-=0.5'
  );

  // 5. Boutons d'action (Explorer nos espaces / Nous contacter)
  heroTl.fromTo('.hero-actions .btn', 
    { y: 20, opacity: 0, scale: 0.92 }, 
    { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.5)' }, 
    '-=0.5'
  );

  // 6. Indicateur de défilement (Scroll cue)
  heroTl.fromTo('.scroll-cue', 
    { opacity: 0, y: -10 }, 
    { opacity: 0.8, y: 0, duration: 0.8 }, 
    '-=0.3'
  );

  /* --------------------------------------------------------------------------
     3. ANIMATION D'ENTRÉE DE PAGE 2 (SCROLLTRIGGER)
     Reproduction exacte de la cadence de la vidéo Frame-50.mp4
     -------------------------------------------------------------------------- */
  const p2Tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#univers',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: 'power3.out' }
  });

  // 1. Sur-titre de la Page 2
  p2Tl.fromTo('.anim-p2-eyebrow', 
    { y: 25, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8 }
  );

  // 2. Titre Page 2 (Un lieu. Plusieurs façons / de vivre l'expérience.)
  p2Tl.fromTo('.univers-title .p2-title-line', 
    { yPercent: 120, opacity: 0 }, 
    { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.22, ease: 'power4.out' }, 
    '-=0.4'
  );

  // 3. Sous-titre descriptif
  p2Tl.fromTo('.univers-description', 
    { y: 25, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8 }, 
    '-=0.5'
  );

  // 4. Entrée fluide des cartes du carrousel (fondu + montée + défloutage)
  p2Tl.fromTo('.carousel-card', 
    { y: 70, opacity: 0, scale: 0.92, filter: 'blur(8px)' }, 
    { 
      y: 0, 
      opacity: 1, 
      scale: 1, 
      filter: 'blur(0px)', 
      duration: 1.0, 
      stagger: 0.12, 
      ease: 'power3.out',
      onComplete: () => {
        // Démarre la boucle infinie continue après l'apparition
        initInfiniteCarousel();
      }
    }, 
    '-=0.4'
  );

  /* --------------------------------------------------------------------------
     4. CARROUSEL INFINI CONTINU HAUTE PERFORMANCE (ZÉRO ESPACEMENT ANORMAL)
     -------------------------------------------------------------------------- */
  let loopAnimation = null;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let previousTranslate = 0;
  let baseSpeed = 45; // pixels par seconde
  let singleSetWidth = 0;

  function initInfiniteCarousel() {
    const track = document.getElementById('carouselTrack');
    const viewport = document.getElementById('carouselViewport');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track || !viewport) return;

    // Si déjà initialisé, éviter les doublons
    if (track.dataset.initialized === 'true') return;
    track.dataset.initialized = 'true';

    // 1. Cloner les cartes originales pour créer un défilement 100% sans coupure
    const originalCards = Array.from(track.children);
    const count = originalCards.length;
    if (count === 0) return;

    // Calcul de la largeur d'une carte + écart
    const cardRect = originalCards[0].getBoundingClientRect();
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 32;
    const cardTotalWidth = cardRect.width + gap;
    singleSetWidth = cardTotalWidth * count;

    // Cloner 2 ensembles complets supplémentaires (3 séries au total)
    for (let set = 0; set < 2; set++) {
      originalCards.forEach((card, idx) => {
        const clone = card.cloneNode(true);
        clone.classList.add('is-clone');
        clone.setAttribute('data-index', idx);
        track.appendChild(clone);
      });
    }

    // Calcul de la durée pour un ensemble complet à vitesse constante
    const duration = singleSetWidth / baseSpeed;

    // Position courante
    let currentPos = 0;

    // Fonction de rafraîchissement continu avec gsap.ticker pour fluidité 60/120 FPS
    let isPaused = false;
    let dragVelocity = 0;

    function tick(time, deltaTime) {
      if (!isDragging) {
        if (!isPaused) {
          // Défilement continu vers la gauche
          currentPos -= (baseSpeed * (deltaTime / 1000));
        } else if (Math.abs(dragVelocity) > 0.1) {
          // Inertie après relâchement du drag
          currentPos += dragVelocity;
          dragVelocity *= 0.92;
        }

        // Boucle infinie fluide sans rupture
        if (currentPos <= -singleSetWidth) {
          currentPos += singleSetWidth;
        } else if (currentPos > 0) {
          currentPos -= singleSetWidth;
        }

        gsap.set(track, { x: currentPos });
      }
    }

    gsap.ticker.add(tick);

    /* --- Pause au survol (permet d'admirer les espaces) --- */
    viewport.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    viewport.addEventListener('mouseleave', () => {
      if (!isDragging) isPaused = false;
    });

    /* --- Interaction Glisser-Déposer (Drag / Touch Swipe) --- */
    function onDragStart(clientX) {
      isDragging = true;
      isPaused = true;
      startX = clientX;
      previousTranslate = currentPos;
      dragVelocity = 0;
      viewport.style.cursor = 'grabbing';
    }

    function onDragMove(clientX) {
      if (!isDragging) return;
      const deltaX = clientX - startX;
      dragVelocity = deltaX * 0.4;
      currentPos = previousTranslate + deltaX;

      // Normalisation continue
      if (currentPos <= -singleSetWidth) {
        currentPos += singleSetWidth;
        previousTranslate += singleSetWidth;
      } else if (currentPos > 0) {
        currentPos -= singleSetWidth;
        previousTranslate -= singleSetWidth;
      }

      gsap.set(track, { x: currentPos });
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      viewport.style.cursor = 'grab';
      // Laisse un léger temps avant de reprendre le défilement automatique
      setTimeout(() => {
        if (!viewport.matches(':hover')) {
          isPaused = false;
        }
      }, 800);
    }

    // Événements Souris
    viewport.addEventListener('mousedown', (e) => onDragStart(e.clientX));
    window.addEventListener('mousemove', (e) => {
      if (isDragging) onDragMove(e.clientX);
    });
    window.addEventListener('mouseup', onDragEnd);

    // Événements Tactiles (Mobile & Tablette)
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onDragStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length > 0) onDragMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', onDragEnd);

    /* --- Boutons Flèches Suivant / Précédent --- */
    function nudge(direction) {
      isPaused = true;
      const targetPos = currentPos + (direction * cardTotalWidth);
      gsap.to({ val: currentPos }, {
        val: targetPos,
        duration: 0.65,
        ease: 'power2.out',
        onUpdate: function() {
          currentPos = this.targets()[0].val;
          if (currentPos <= -singleSetWidth) currentPos += singleSetWidth;
          if (currentPos > 0) currentPos -= singleSetWidth;
          gsap.set(track, { x: currentPos });
        },
        onComplete: () => {
          setTimeout(() => {
            if (!viewport.matches(':hover')) isPaused = false;
          }, 1200);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => nudge(-1));
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => nudge(1));
    }

    // Mise à jour de la largeur si redimensionnement de l'écran
    window.addEventListener('resize', () => {
      const updatedRect = originalCards[0].getBoundingClientRect();
      const updatedStyle = window.getComputedStyle(track);
      const updatedGap = parseFloat(updatedStyle.gap) || 32;
      const updatedWidth = updatedRect.width + updatedGap;
      singleSetWidth = updatedWidth * count;
    });
  }

});
