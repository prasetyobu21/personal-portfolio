// ---- Portfolio Intro ----
(function initPortfolioIntro() {
  const intro = document.getElementById('portfolio-intro');
  const loader = document.getElementById('braille-loader');
  const welcomeMark = document.getElementById('welcome-mark');
  const status = document.getElementById('intro-status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assets = [
    'assets/images/profile-avatar.webp',
    'assets/images/terragrid-thumbnail.webp',
    'assets/images/vibe_coding_thumbnail.webp',
    'assets/images/Retain-AI/Retain AI - Thumbnail.webp',
    'assets/images/ai-meal-planner/AI Meal Planner - Thumbnail.webp',
    'assets/images/white-icon-exploration/White icon - exploration.webp',
    'assets/images/white-icon-exploration/White icon - implementation.webp',
    'assets/images/Sports app widget.webp',
    'assets/images/Black - orange icon exploration.webp'
  ];
  const spinnerFrames = [
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0],
    [1, 1, 0, 1, 1, 0],
    [0, 1, 0, 1, 1, 0],
    [0, 1, 1, 0, 1, 0],
    [0, 0, 1, 0, 1, 0],
    [0, 0, 1, 0, 1, 1],
    [0, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0, 1]
  ];
  const brailleDotPositions = [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3]];

  function revealPortfolio() {
    document.documentElement.classList.remove('intro-pending');
    document.body.classList.remove('intro-active');
    intro.remove();
  }

  if (reduceMotion) {
    revealPortfolio();
    return;
  }

  const spinnerDots = Array.from({ length: 6 }, (_, dotIndex) => {
    const dot = document.createElement('span');
    const [column, row] = brailleDotPositions[dotIndex];
    dot.style.gridColumn = column;
    dot.style.gridRow = row;
    loader.append(dot);
    return dot;
  });
  let spinnerFrame = 0;

  function renderSpinner() {
    spinnerDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', Boolean(spinnerFrames[spinnerFrame][dotIndex]));
    });
    spinnerFrame = (spinnerFrame + 1) % spinnerFrames.length;
  }

  renderSpinner();
  const spinnerInterval = setInterval(renderSpinner, 95);

  function preloadAssets() {
    let loadedAssets = 0;
    status.textContent = `Loading assets 0 / ${assets.length}`;

    return Promise.all(assets.map((source) => new Promise((resolve) => {
      const image = new Image();
      const complete = () => {
        loadedAssets += 1;
        if (!intro.classList.contains('show-welcome')) {
          status.textContent = `Loading assets ${loadedAssets} / ${assets.length}`;
        }
        resolve();
      };

      image.addEventListener('load', complete, { once: true });
      image.addEventListener('error', complete, { once: true });
      image.src = source;
    })));
  }

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const assetsReady = Promise.all([preloadAssets(), fontsReady]);
  const maximumWait = new Promise((resolve) => setTimeout(resolve, 4000));
  const minimumDisplay = new Promise((resolve) => setTimeout(resolve, 2000));

  Promise.all([Promise.race([assetsReady, maximumWait]), minimumDisplay]).then(() => {
    clearInterval(spinnerInterval);
    status.textContent = 'Welcome';
    intro.classList.add('show-welcome');
    let characterIndex = 0;

    const typeWelcome = setInterval(() => {
      welcomeMark.textContent += 'Welcome'[characterIndex];
      characterIndex += 1;

      if (characterIndex === 'Welcome'.length) {
        clearInterval(typeWelcome);
      }
    }, 110);

    setTimeout(() => {
      status.textContent = 'Portfolio preview';
      intro.classList.add('show-skeleton');

      setTimeout(() => {
        intro.classList.add('is-leaving');
        document.body.classList.remove('intro-active');
        document.body.classList.add('intro-revealing');

        setTimeout(() => {
          document.documentElement.classList.remove('intro-pending');
          document.body.classList.remove('intro-revealing');
          intro.remove();
        }, 650);
      }, 1900);
    }, 1750);
  });
}());

// ---- Image Skeleton Loader ----
function initImageSkeleton(img) {
  const skeleton = img.previousElementSibling;
  if (!skeleton || !skeleton.classList.contains('img-skeleton')) return;

  function revealImage() {
    img.classList.add('img-loaded');
    skeleton.classList.add('loaded');
  }

  if (img.complete && img.naturalWidth > 0) {
    // Already cached / loaded synchronously
    revealImage();
  } else {
    img.addEventListener('load', revealImage, { once: true });
    img.addEventListener('error', revealImage, { once: true });
  }
}

document.querySelectorAll('.card-image').forEach(initImageSkeleton);

// ---- Tab Filtering ----
const tabs = document.querySelectorAll('.tab-btn');
const cards = document.querySelectorAll('.portfolio-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => {
      t.classList.remove('active', 'text-primary', 'font-semibold');
      t.classList.add('text-muted', 'font-medium');
    });
    tab.classList.add('active', 'text-primary', 'font-semibold');
    tab.classList.remove('text-muted', 'font-medium');

    const filter = tab.dataset.filter;

    cards.forEach(card => {
      const categories = card.dataset.category.split(' ');
      if (filter === 'all' || categories.includes(filter)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ---- Lightbox Carousel ----
const lightbox = document.getElementById('lightbox');
const lightboxImageArea = document.getElementById('lightbox-image-area');
const lightboxTrack = document.getElementById('lightbox-track');
const lightboxDots = document.getElementById('lightbox-dots');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let currentSlide = 0;
let totalSlides = 0;

function openLightbox(images) {
  totalSlides = images.length;
  currentSlide = 0;

  // Disable transition so reset to slide 0 is instant
  lightboxTrack.style.transition = 'none';
  lightboxTrack.style.transform = 'translateX(0)';

  // Build slides
  lightboxTrack.innerHTML = images.map(src =>
    `<div class="lightbox-slide"><img src="${src}" alt="Portfolio image"></div>`
  ).join('');

  // Build dots
  lightboxDots.innerHTML = images.map((_, i) =>
    `<button class="lightbox-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
  ).join('');

  updateSlide();

  // Re-enable transition after a frame
  requestAnimationFrame(() => {
    lightboxTrack.style.transition = '';
  });

  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function updateSlide() {
  lightboxTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Update counter
  lightboxCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;

  // Update dots
  lightboxDots.querySelectorAll('.lightbox-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });

  // Show/hide nav arrows
  lightboxPrev.classList.toggle('hidden', currentSlide === 0);
  lightboxNext.classList.toggle('hidden', currentSlide === totalSlides - 1);

  // Hide dots & counter if single image (use visibility to preserve layout)
  const isSingle = totalSlides <= 1;
  lightboxDots.style.visibility = isSingle ? 'hidden' : 'visible';
  lightboxCounter.style.visibility = isSingle ? 'hidden' : 'visible';
}

function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
  updateSlide();
}

// Card click → open lightbox (design cards with images only, skip external links)
cards.forEach(card => {
  if (card.dataset.images) {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(JSON.parse(card.dataset.images));
    });
  }
});

// Close handlers
lightboxClose.addEventListener('click', closeLightbox);
lightboxImageArea.addEventListener('click', closeLightbox);

// Nav handlers
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide - 1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide + 1); });

// Dot clicks
lightboxDots.addEventListener('click', (e) => {
  if (e.target.classList.contains('lightbox-dot')) {
    goToSlide(parseInt(e.target.dataset.index));
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
  if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
});
