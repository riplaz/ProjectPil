const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Фон из пыли ----------

const dustCanvas = document.getElementById('dustCanvas');
const dustField = dustCanvas && typeof createDustField === 'function'
  ? createDustField(dustCanvas)
  : null;

// ---------- Клик по пустому месту: взмах и реплика ----------

const TOAST_WORDS = ['АПЧХИ!', 'ПФФФ…', 'ПЫЛЬ!', 'КХЕ-КХЕ'];
const TOAST_COLORS = ['#e8c58a', '#ff9f5a', '#8fd3e0'];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function showToast(x, y) {
  const label = document.createElement('div');

  label.className = 'toast';
  label.textContent = pickRandom(TOAST_WORDS);
  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
  label.style.setProperty('--toast-color', pickRandom(TOAST_COLORS));
  label.setAttribute('aria-hidden', 'true');

  document.body.append(label);
  window.setTimeout(() => label.remove(), 1200);
}

document.addEventListener('click', event => {
  const blockedTarget = event.target.closest('a, button, input, textarea, select, header, footer, .game-shell');
  if (blockedTarget || !dustField) return;

  dustField.puff(event.clientX, event.clientY);
  showToast(event.clientX, event.clientY);
});

// ---------- Плавное появление блоков при прокрутке ----------

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
    item.classList.add('reveal-ready');
    observer.observe(item);
  });
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

// ---------- Мягкое свечение за курсором ----------

const cursorGlow = document.querySelector('.cursor-glow');

if (cursorGlow && window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
  window.addEventListener('pointermove', event => {
    cursorGlow.style.setProperty('--pointer-x', `${event.clientX}px`);
    cursorGlow.style.setProperty('--pointer-y', `${event.clientY}px`);
    cursorGlow.classList.add('cursor-glow--visible');
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    cursorGlow.classList.remove('cursor-glow--visible');
  });
}

// ---------- Шапка уплотняется после прокрутки ----------

const header = document.getElementById('header');

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 18);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// ---------- Мини-игра ----------

if (typeof initDustMemoryGame === 'function') initDustMemoryGame();

// ---------- Кнопка «Листай»: по очереди к следующему разделу ----------

const scrollNext = document.getElementById('scrollNext');
const scrollNextLabel = scrollNext.querySelector('.hero__scroll-label');
const scrollNextArrow = scrollNext.querySelector('b');

const sectionIds = ['top', 'about', 'audience', 'mini-game', 'finale'];
const sections = sectionIds
  .map(id => document.getElementById(id))
  .filter(section => section !== null);

function getCurrentSectionIndex() {
  const isPageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 64;
  if (isPageBottom) return sections.length - 1;

  let current = 0;

  sections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= 140) current = index;
  });

  return current;
}

function updateScrollNext() {
  const isLast = getCurrentSectionIndex() === sections.length - 1;

  scrollNextLabel.textContent = isLast ? 'В НАЧАЛО' : 'ЛИСТАЙ';
  scrollNextArrow.textContent = isLast ? '↑' : '↓';
}

scrollNext.addEventListener('click', () => {
  const currentIndex = getCurrentSectionIndex();
  const isLast = currentIndex === sections.length - 1;
  const behavior = reduceMotion ? 'auto' : 'smooth';

  if (isLast) {
    window.scrollTo({ top: 0, behavior: behavior });
  } else {
    sections[currentIndex + 1].scrollIntoView({ behavior: behavior, block: 'start' });
  }
});

window.addEventListener('scroll', updateScrollNext, { passive: true });
window.addEventListener('resize', updateScrollNext, { passive: true });
updateScrollNext();
