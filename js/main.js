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

  // Gestion du tiroir de menu mobile (Drawer)
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .btn-drawer');

  function openMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (mobileToggle) mobileToggle.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Animation cadencée des liens du menu mobile
    gsap.fromTo('.mobile-nav-link', 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.08 }
    );
    gsap.fromTo('.mobile-drawer-cta', 
      { y: 15, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', delay: 0.3 }
    );
  }

  function closeMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (mobileToggle) mobileToggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  /* --------------------------------------------------------------------------
     1.1 GESTION DU CHARGEMENT DES VIDÉOS HERO & FONDU DES POSTERS
     Garantit un affichage instantané du poster et une transition douce sans flash noir
     -------------------------------------------------------------------------- */
  function setupHeroVideoTransition() {
    const desktopVideo = document.querySelector('.hero-video-desktop');
    const mobileVideo = document.querySelector('.hero-video-mobile');
    const desktopPoster = document.querySelector('.hero-poster-desktop');
    const mobilePoster = document.querySelector('.hero-poster-mobile');
    let activeVideo = null;
    let activePoster = null;
    let playingHandler = null;
    let errorHandler = null;
    let activeIsMobile = null;

    function stopActiveVideo() {
      if (!activeVideo) return;

      activeVideo.removeEventListener('playing', playingHandler);
      activeVideo.removeEventListener('error', errorHandler);
      activeVideo.pause();
      activeVideo.removeAttribute('src');
      activeVideo.removeAttribute('poster');
      activeVideo.classList.remove('is-loaded');
      activeVideo.load();
      activePoster.classList.remove('is-hidden');
      activeVideo = null;
      activePoster = null;
    }

    function activateVideo(isMobile) {
      if (activeIsMobile === isMobile) return;

      stopActiveVideo();
      activeIsMobile = isMobile;
      activeVideo = isMobile ? mobileVideo : desktopVideo;
      activePoster = isMobile ? mobilePoster : desktopPoster;
      if (!activeVideo || !activePoster) return;

      activePoster.classList.remove('is-hidden');
      activeVideo.classList.remove('is-loaded');
      activeVideo.poster = activePoster.currentSrc || activePoster.src;
      activeVideo.src = activeVideo.dataset.src;

      const video = activeVideo;
      const poster = activePoster;

      playingHandler = () => {
        video.classList.add('is-loaded');
        setTimeout(() => {
          if (activeVideo === video && video.classList.contains('is-loaded')) {
            poster.classList.add('is-hidden');
          }
        }, 150);
      };

      errorHandler = () => {
        const error = video.error;
        video.classList.remove('is-loaded');
        poster.classList.remove('is-hidden');
        console.error('Échec du chargement ou de la lecture de la vidéo du HERO.', error);
      };

      video.addEventListener('playing', playingHandler, { once: true });
      video.addEventListener('error', errorHandler);
      video.load();
      video.play().catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Impossible de démarrer la vidéo du HERO.', error);
        }
      });
    }

    activateVideo(window.innerWidth <= 768);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        activateVideo(window.innerWidth <= 768);
      }, 250);
    });
  }

  setupHeroVideoTransition();

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
     2.1 TRANSITION DE DÉFILEMENT "STACKING CARDS" (HERO -> PAGE 2)
     Le Hero reste épinglé en haut d'écran pendant le scroll, rétrécit élégamment
     (scale: 0.92, coins arrondis à 28px, luminosité douce), tandis que la Page 2
     monte par-dessus au premier plan. Réversible au scroll vers le haut.
     -------------------------------------------------------------------------- */
  gsap.to('.hero-card-scale', {
    scale: 0.92,
    opacity: 0.55,
    borderRadius: '28px',
    ease: 'power1.inOut',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=100%',
      scrub: 0.8,
      pin: true,
      pinSpacing: false
    }
  });

  /* --------------------------------------------------------------------------
     3. ANIMATION D'ENTRÉE DE PAGE 2 (SCROLLTRIGGER)
     Reproduction exacte de la cadence de la vidéo Frame-50.mp4
     -------------------------------------------------------------------------- */
  const p2Tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#univers',
      start: 'top 65%',
      toggleActions: 'play none none reverse'
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
        // Démarre la boucle infinie continue après l'apparition (Desktop & Mobile)
        initInfiniteCarousel();
        initMobileDualCarousel();
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

  /* --------------------------------------------------------------------------
     5. CARROUSEL MOBILE DOUBLE RANGÉE (RANGÉE 1 & RANGÉE 2 INFINIES)
     Conforme à la maquette Figma Frame 57 : deux rangées en mouvement fluide
     -------------------------------------------------------------------------- */
  function setupMarqueeTrack(track, viewport, direction = -1, speed = 32) {
    if (!track || !viewport) return;
    if (track.dataset.initialized === 'true') return;
    track.dataset.initialized = 'true';

    const originalCards = Array.from(track.children);
    const count = originalCards.length;
    if (count === 0) return;

    // Cloner 2 ensembles complets (3 séries au total) pour garantir zéro trou
    for (let s = 0; s < 2; s++) {
      originalCards.forEach((c) => {
        const clone = c.cloneNode(true);
        clone.classList.add('is-clone');
        track.appendChild(clone);
      });
    }

    function calcWidth() {
      const cardRect = originalCards[0].getBoundingClientRect();
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 14;
      return (cardRect.width + gap) * count;
    }

    let singleSetWidth = calcWidth() || 600;
    // Si direction > 0 (défilement vers la droite), partir de -singleSetWidth
    let currentPos = direction > 0 ? -singleSetWidth : 0;
    let isPaused = false;
    let isDragging = false;
    let startX = 0;
    let prevPos = 0;
    let dragVelocity = 0;

    function tick(time, deltaTime) {
      if (!isDragging) {
        if (!isPaused) {
          currentPos += direction * (speed * (deltaTime / 1000));
        } else if (Math.abs(dragVelocity) > 0.1) {
          currentPos += dragVelocity;
          dragVelocity *= 0.92;
        }

        // Boucle infinie fluide
        if (currentPos <= -singleSetWidth) {
          currentPos += singleSetWidth;
        } else if (currentPos >= 0) {
          currentPos -= singleSetWidth;
        }

        gsap.set(track, { x: currentPos });
      }
    }

    gsap.ticker.add(tick);

    // Interaction tactile & souris (Drag / Touch Swipe)
    function onStart(clientX) {
      isDragging = true;
      isPaused = true;
      startX = clientX;
      prevPos = currentPos;
      dragVelocity = 0;
    }

    function onMove(clientX) {
      if (!isDragging) return;
      const delta = clientX - startX;
      dragVelocity = delta * 0.4;
      currentPos = prevPos + delta;

      if (currentPos <= -singleSetWidth) {
        currentPos += singleSetWidth;
        prevPos += singleSetWidth;
      } else if (currentPos >= 0) {
        currentPos -= singleSetWidth;
        prevPos -= singleSetWidth;
      }
      gsap.set(track, { x: currentPos });
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      setTimeout(() => {
        isPaused = false;
      }, 700);
    }

    // Événements Souris
    viewport.addEventListener('mouseenter', () => { isPaused = true; });
    viewport.addEventListener('mouseleave', () => { if (!isDragging) isPaused = false; });
    viewport.addEventListener('mousedown', (e) => onStart(e.clientX));
    window.addEventListener('mousemove', (e) => { if (isDragging) onMove(e.clientX); });
    window.addEventListener('mouseup', onEnd);

    // Événements Touch (Smartphones & Tablettes)
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length > 0) onMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', onEnd);

    // Redimensionnement
    window.addEventListener('resize', () => {
      singleSetWidth = calcWidth();
    });
  }

  function initMobileDualCarousel() {
    const track1 = document.getElementById('mobileTrack1');
    const viewport1 = document.getElementById('mobileViewport1');
    const track2 = document.getElementById('mobileTrack2');
    const viewport2 = document.getElementById('mobileViewport2');

    // Rangée 1 : défile vers la gauche (vitesse constante 32px/s)
    setupMarqueeTrack(track1, viewport1, -1, 32);
    // Rangée 2 : défile vers la droite (vitesse constante 28px/s, effet croisé premium)
    setupMarqueeTrack(track2, viewport2, 1, 28);
  }

  // Démarrage automatique immédiat pour la version mobile
  if (window.innerWidth <= 768) {
    initMobileDualCarousel();
  }

});
