// Базовая логика уже работает — форма добавляет отзыв в список.
// Ваша задача — реализовать ИИ-функцию в месте, отмеченном TODO ниже.

const STORAGE_KEY = "technodom-reviews";

function loadReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

const POSITIVE_WORDS = [
  "отлично", "отличный", "отличная", "отличное", "отличные",
  "супер", "класс", "классно", "круто", "здорово",
  "прекрасно", "прекрасный", "замечательно", "замечательный",
  "шикарно", "шикарный", "топ",
  "доволен", "довольна", "довольны", "рад", "рада", "рады",
  "понравился", "понравилась", "понравилось", "понравились",
  "нравится", "рекомендую", "рекомендуем", "советую", "советуем",
  "быстро", "качественно", "удобно", "удобный", "стильный",
  "спасибо", "благодарю", "хороший", "хорошая", "хорошее", "хорошие",
  "надежный", "надежная", "надежно", "плюс", "работает"
];

const NEGATIVE_WORDS = [
  "плохо", "плохой", "плохая", "плохое",
  "ужасно", "ужасный", "ужасная", "ужас", "кошмар",
  "отвратительно", "отвратительный", "катастрофа", "противный",
  "не работает", "сломался", "сломалась", "сломан", "поломка",
  "брак", "бракованный", "дефект", "глючит", "глюки", "зависает", "завис",
  "недоволен", "недовольна", "разочарован", "разочарована", "разочарование",
  "не понравился", "не понравилась", "не понравилось",
  "не рекомендую", "не советую", "обман", "обманули",
  "долго", "ждали", "некачественно", "разбился", "треснул", "сгорел",
  "минус", "зря", "жаль", "верните деньги"
];

const SENTIMENT_LABELS = {
  positive: "Положительный",
  neutral: "Нейтральный",
  negative: "Отрицательный"
};

function isNegated(text, word) {
  const idx = text.indexOf(word);
  if (idx < 0) return false;
  const before = text.slice(0, idx).trim();
  return /(^|\s)не\s*(очень|совсем|так|то)?\s*$/u.test(before) ||
         /(^|\s)ни\s*$/u.test(before);
}

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  let positive = 0;
  let negative = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) {
      if (isNegated(lower, word)) negative++;
      else positive++;
    }
  }

  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) {
      if (isNegated(lower, word)) positive++;
      else negative++;
    }
  }

  if (positive > negative) return "positive";
  if (negative > positive) return "negative";
  return "neutral";
}

let activeFilter = "all";

function reviewSentiment(review) {
  return review.sentiment || analyzeSentiment(review.text);
}

function render() {
  const reviews = loadReviews();
  const list = document.getElementById("reviewList");
  list.innerHTML = "";

  const filtered = activeFilter === "all"
    ? reviews
    : reviews.filter((r) => reviewSentiment(r) === activeFilter);

  filtered.forEach((review) => {
    const li = document.createElement("li");
    const nameEl = document.createElement("span");
    nameEl.className = "review-name";
    nameEl.textContent = review.name;

    const sentiment = reviewSentiment(review);
    const label = SENTIMENT_LABELS[sentiment] || SENTIMENT_LABELS.neutral;
    const badge = document.createElement("span");
    badge.className = "sentiment-badge " + sentiment;
    badge.textContent = label;

    const textEl = document.createElement("p");
    textEl.textContent = review.text;

    li.appendChild(nameEl);
    li.appendChild(badge);
    li.appendChild(textEl);
    list.appendChild(li);
  });
}

document.getElementById("filterBar").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  activeFilter = btn.dataset.sentiment;
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b === btn);
  });
  render();
});

document.getElementById("reviewForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("reviewName").value.trim();
  const text = document.getElementById("reviewText").value.trim();
  if (!name || !text) return;

  const sentiment = analyzeSentiment(text);
  const reviews = loadReviews();
  reviews.unshift({ name, text, sentiment });
  saveReviews(reviews);

  e.target.reset();
  render();
});

render();
