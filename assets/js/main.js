/**
 * SSA DURANGO - Servicios, Soluciones y Automatización
 * Script Principal: Interactividad, Carruseles, Desplazamiento con Barrido Lento y Cotizador WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Iconos de Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Elemento de Barrido Láser Luminoso
  let laserBeam = document.getElementById('sweep-laser');
  if (!laserBeam) {
    laserBeam = document.createElement('div');
    laserBeam.id = 'sweep-laser';
    document.body.appendChild(laserBeam);
  }

  // 3. Función de Desplazamiento Suave con Barrido Lento y Curva Easing Elegante
  function smoothScrollWithSweep(targetId, duration = 1100) {
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    const navHeight = document.getElementById('main-nav')?.offsetHeight || 80;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (navHeight - 10);
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    // Disparar efecto visual de barrido láser
    laserBeam.classList.remove('active');
    void laserBeam.offsetWidth; // Reflow
    laserBeam.classList.add('active');

    // Función de interpolación cúbica suave (Cubic EaseInOut)
    function easeInOutCubic(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t * t + b;
      t -= 2;
      return (c / 2) * (t * t * t + 2) + b;
    }

    function animationStep(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animationStep);
      } else {
        window.scrollTo(0, targetPosition);
        setTimeout(() => {
          laserBeam.classList.remove('active');
        }, 200);

        // Pulso sutil en la sección destino
        targetElement.classList.remove('target-section-sweep');
        void targetElement.offsetWidth;
        targetElement.classList.add('target-section-sweep');
      }
    }

    requestAnimationFrame(animationStep);
  }

  // 3.1 Controladores del Menú Móvil
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('mobile-menu-icon');

  function closeMobileMenu() {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      if (menuIcon) {
        menuIcon.setAttribute('data-lucide', 'menu');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  function openMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.remove('hidden');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
      if (menuIcon) {
        menuIcon.setAttribute('data-lucide', 'x');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  // Aplicar desplazamiento con barrido lento a todos los enlaces de anclaje (#)
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.length > 1 && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          smoothScrollWithSweep(href, 1100);
          closeMobileMenu();
        }
      }
    });
  });

  // 4. Inicializar Carrusel Hero (Swiper.js)
  let isAutoplayPaused = false;
  const heroSwiper = new Swiper('.hero-swiper', {
    loop: true,
    speed: 900,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    autoplay: {
      delay: 6000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.hero-next-btn',
      prevEl: '.hero-prev-btn',
    },
    on: {
      slideChange: function () {
        // Actualizar estado activo en los botones selectores rápidos de slides
        const realIndex = this.realIndex;
        const slideButtons = document.querySelectorAll('.hero-tab-btn');
        slideButtons.forEach((btn, idx) => {
          if (idx === realIndex) {
            btn.classList.add('bg-brand-orange', 'text-white', 'border-brand-orange', 'shadow-lg', 'shadow-orange-500/30');
            btn.classList.remove('bg-white/5', 'text-slate-300', 'border-white/10');
          } else {
            btn.classList.remove('bg-brand-orange', 'text-white', 'border-brand-orange', 'shadow-lg', 'shadow-orange-500/30');
            btn.classList.add('bg-white/5', 'text-slate-300', 'border-white/10');
          }
        });
      },
      slideChangeTransitionStart: function () {
        const activeSlide = this.slides[this.activeIndex];
        if (activeSlide) {
          const animatedElements = activeSlide.querySelectorAll('.slide-animate');
          animatedElements.forEach(el => {
            el.classList.remove('revealed');
            void el.offsetWidth;
            el.classList.add('revealed');
          });
        }
      }
    }
  });

  // Botones selectores directos de cada Slide
  const slideTabs = document.querySelectorAll('.hero-tab-btn');
  slideTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const targetIndex = parseInt(tab.getAttribute('data-slide-index'), 10);
      if (!isNaN(targetIndex)) {
        heroSwiper.slideToLoop(targetIndex, 800);
      }
    });
  });

  // Botón de Pausa / Reproducción del Carrusel Hero
  const pauseBtn = document.getElementById('hero-pause-btn');
  const pauseIcon = document.getElementById('hero-pause-icon');
  const pauseText = document.getElementById('hero-pause-text');

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (heroSwiper.autoplay.running) {
        heroSwiper.autoplay.stop();
        isAutoplayPaused = true;
        if (pauseIcon) pauseIcon.setAttribute('data-lucide', 'play');
        if (pauseText) pauseText.textContent = 'Reanudar';
        pauseBtn.classList.add('border-brand-yellowLight', 'text-brand-yellowLight');
      } else {
        heroSwiper.autoplay.start();
        isAutoplayPaused = false;
        if (pauseIcon) pauseIcon.setAttribute('data-lucide', 'pause');
        if (pauseText) pauseText.textContent = 'Pausar';
        pauseBtn.classList.remove('border-brand-yellowLight', 'text-brand-yellowLight');
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  // 5. Navbar Sticky Effect on Scroll
  const navbar = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('shadow-xl', 'bg-opacity-95');
    } else {
      navbar.classList.remove('shadow-xl', 'bg-opacity-95');
    }
  });

  // 6. Listeners de Eventos del Menú Móvil (Toggle, Clic Fuera y Escape)
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        openMobileMenu();
      } else {
        closeMobileMenu();
      }
    });

    // Cerrar al hacer clic fuera del menú
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Cerrar al presionar la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  // 7. Scroll Reveal con Intersection Observer
  const revealElements = document.querySelectorAll('.reveal-init, .reveal-left, .reveal-right, .reveal-scale');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 8. Manejo de Subida de Imagen y Previsualización en el Cotizador
  const quoteImageInput = document.getElementById('quote-image');
  const uploadPrompt = document.getElementById('upload-prompt');
  const previewContainer = document.getElementById('image-preview-container');
  const previewThumb = document.getElementById('image-preview-thumb');
  const previewName = document.getElementById('image-preview-name');
  const previewSize = document.getElementById('image-preview-size');
  const removeImageBtn = document.getElementById('remove-image-btn');
  let selectedImageFile = null;

  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    selectedImageFile = file;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeText = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(0)} KB` 
      : `${sizeInMB} MB`;

    if (previewName) previewName.textContent = file.name;
    if (previewSize) previewSize.textContent = sizeText;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewThumb) previewThumb.src = e.target.result;
      if (uploadPrompt) uploadPrompt.classList.add('hidden');
      if (previewContainer) previewContainer.classList.remove('hidden');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    };
    reader.readAsDataURL(file);
  }

  if (quoteImageInput) {
    quoteImageInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageFile(e.target.files[0]);
      }
    });
  }

  if (uploadPrompt) {
    uploadPrompt.addEventListener('click', () => {
      if (quoteImageInput) quoteImageInput.click();
    });

    // Soporte para arrastrar y soltar (Drag & Drop)
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadPrompt.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadPrompt.classList.add('border-brand-orange', 'bg-orange-50/60');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadPrompt.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadPrompt.classList.remove('border-brand-orange', 'bg-orange-50/60');
      });
    });

    uploadPrompt.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt.files && dt.files[0]) {
        quoteImageInput.files = dt.files;
        handleImageFile(dt.files[0]);
      }
    });
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedImageFile = null;
      if (quoteImageInput) quoteImageInput.value = '';
      if (previewThumb) previewThumb.src = '';
      if (previewContainer) previewContainer.classList.add('hidden');
      if (uploadPrompt) uploadPrompt.classList.remove('hidden');
    });
  }

  // 9. Calculador y Generador de Cotizaciones WhatsApp
  const quoteForm = document.getElementById('quick-quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const service = document.getElementById('quote-service')?.value || 'General';
      const type = document.getElementById('quote-type')?.value || 'Residencial';
      const name = document.getElementById('quote-name')?.value.trim() || 'Cliente';
      const notes = document.getElementById('quote-notes')?.value.trim() || 'Deseo más información y cotización.';
      
      const hasImage = selectedImageFile !== null;
      const imageText = hasImage 
        ? `%0A📸 *Foto de Referencia:* Sí, adjunto fotografía en este chat para evaluación técnica.` 
        : '';

      const phoneNumber = '526183032358';
      const textMessage = `¡Hola SSA Durango! 🛠️%0A%0A*SOLICITUD DE COTIZACIÓN WEB*%0A👤 *Nombre:* ${encodeURIComponent(name)}%0A🔧 *Servicio de Interés:* ${encodeURIComponent(service)}%0A🏢 *Tipo de Inmueble:* ${encodeURIComponent(type)}%0A📝 *Detalles:* ${encodeURIComponent(notes)}${imageText}%0A%0A_Enviado desde el portal web ssa-durango._`;
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${textMessage}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // 9. Testimonials Slider (Swiper)
  const testimonialsSwiper = new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.testimonials-pagination',
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      }
    }
  });

});

// Función global para dirigir al Cotizador Inteligente y preseleccionar el servicio
function quoteService(serviceName) {
  const quoteSection = document.getElementById('cotizador');
  const serviceSelect = document.getElementById('quote-service');
  
  if (serviceSelect && serviceName) {
    const cleanQuery = serviceName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (let i = 0; i < serviceSelect.options.length; i++) {
      const optVal = serviceSelect.options[i].value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const optText = serviceSelect.options[i].text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      if (optVal.includes(cleanQuery) || cleanQuery.includes(optVal) || optText.includes(cleanQuery)) {
        serviceSelect.selectedIndex = i;
        break;
      }
    }
  }

  // Desplazamiento suave con efecto láser
  const targetElement = document.querySelector('#cotizador');
  if (targetElement) {
    const navHeight = document.getElementById('main-nav')?.offsetHeight || 70;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (navHeight - 10);
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  // Foco en el campo del nombre y resplandor sutil
  setTimeout(() => {
    const nameInput = document.getElementById('quote-name');
    if (nameInput) {
      nameInput.focus();
    }
    const formCard = document.querySelector('#cotizador form');
    if (formCard) {
      formCard.classList.add('ring-4', 'ring-[#FF6600]', 'transition-all', 'duration-500', 'rounded-2xl');
      setTimeout(() => {
        formCard.classList.remove('ring-4', 'ring-[#FF6600]');
      }, 1400);
    }
  }, 700);
}

