// Мини-игра «Найди пары в пыли»: memory на 6 пар частиц.

const MICRO_ITEMS = [
  {
    id: 'mite',
    name: 'КЛЕЩ',
    color: '#ff9f5a',
    icon: '<ellipse cx="24" cy="26" rx="10" ry="8"/><path d="M15 22L6 16M14 27L5 28M16 32L8 40M33 22L42 16M34 27L43 28M32 32L40 40" fill="none" stroke-width="2.5"/>'
  },
  {
    id: 'fiber',
    name: 'ВОЛОКНО',
    color: '#8fd3e0',
    icon: '<path d="M6 36C14 8 22 44 30 18S40 14 42 10" fill="none" stroke-width="3"/>'
  },
  {
    id: 'pollen',
    name: 'ПЫЛЬЦА',
    color: '#ffd36e',
    icon: '<circle cx="24" cy="24" r="9"/><path d="M24 5v8M24 35v8M5 24h8M35 24h8M11 11l5 5M32 32l5 5M37 11l-5 5M16 32l-5 5" fill="none" stroke-width="3"/>'
  },
  {
    id: 'skin',
    name: 'КОЖА',
    color: '#e8c58a',
    icon: '<path d="M9 20L22 9L39 13L41 28L28 41L11 34Z"/>'
  },
  {
    id: 'hair',
    name: 'ВОЛОС',
    color: '#d9b8ff',
    icon: '<path d="M10 40L38 8" fill="none" stroke-width="5"/><path d="M10 40L38 8" fill="none" stroke="#0a0908" stroke-width="5" stroke-dasharray="2 6" opacity="0.4"/>'
  },
  {
    id: 'spore',
    name: 'СПОРЫ',
    color: '#9be08a',
    icon: '<circle cx="18" cy="26" r="7"/><circle cx="31" cy="20" r="6"/><circle cx="29" cy="33" r="5"/>'
  }
];

function initDustMemoryGame() {
  const grid = document.getElementById('memoryGrid');
  const startButton = document.getElementById('gameStart');
  const movesLabel = document.querySelector('[data-game-moves]');
  const pairsLabel = document.querySelector('[data-game-pairs]');
  const messageLabel = document.querySelector('[data-game-message]');

  if (!grid || !startButton) return;

  const arrowHtml = '<span class="btn__arrow" aria-hidden="true">↗</span>';

  let firstCard = null;
  let secondCard = null;
  let isLocked = false;
  let moves = 0;
  let foundPairs = 0;

  function shuffle(list) {
    const result = list.slice();

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function createCard(item) {
    const card = document.createElement('button');

    card.className = 'memory-card';
    card.type = 'button';
    card.disabled = true;
    card.dataset.id = item.id;
    card.style.setProperty('--micro-color', item.color);
    card.setAttribute('aria-label', 'Скрытая карточка');

    card.innerHTML = `
      <span class="memory-card__inner">
        <span class="memory-card__back"><span class="memory-card__back-mark">?</span></span>
        <span class="memory-card__front">
          <svg viewBox="0 0 48 48" aria-hidden="true">${item.icon}</svg>
          <span class="memory-card__name">${item.name}</span>
        </span>
      </span>`;

    card.addEventListener('click', () => flipCard(card));
    return card;
  }

  function buildBoard() {
    grid.innerHTML = '';

    const deck = shuffle([...MICRO_ITEMS, ...MICRO_ITEMS]);
    deck.forEach(item => grid.appendChild(createCard(item)));
  }

  function showStats() {
    movesLabel.textContent = String(moves).padStart(2, '0');
    pairsLabel.textContent = String(foundPairs).padStart(2, '0');
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    isLocked = false;
  }

  function startGame() {
    moves = 0;
    foundPairs = 0;
    resetTurn();

    buildBoard();
    grid.querySelectorAll('.memory-card').forEach(card => {
      card.disabled = false;
    });

    startButton.classList.remove('is-complete');
    startButton.innerHTML = `Заново ${arrowHtml}`;
    messageLabel.textContent = 'Открой две карточки и найди совпадение.';
    showStats();
  }

  function finishGame() {
    startButton.classList.add('is-complete');
    startButton.innerHTML = `Сыграть ещё ${arrowHtml}`;
    messageLabel.textContent = `Всё найдено за ${moves} ходов. Теперь ты видишь больше.`;
  }

  function markAsMatched() {
    [firstCard, secondCard].forEach(card => {
      card.classList.add('is-matched');
      card.disabled = true;
    });

    foundPairs++;
    resetTurn();
    showStats();

    if (foundPairs === MICRO_ITEMS.length) finishGame();
    else messageLabel.textContent = 'Есть пара! Ищи дальше.';
  }

  function hideCards() {
    firstCard.classList.remove('is-flipped');
    secondCard.classList.remove('is-flipped');
    messageLabel.textContent = 'Не совпало. Пыль снова всё скрыла.';
    resetTurn();
  }

  function flipCard(card) {
    if (isLocked || card === firstCard || card.classList.contains('is-matched')) return;

    card.classList.add('is-flipped');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    isLocked = true;
    moves++;
    showStats();

    if (firstCard.dataset.id === secondCard.dataset.id) markAsMatched();
    else setTimeout(hideCards, 800);
  }

  startButton.addEventListener('click', startGame);
  buildBoard();
  showStats();
}
