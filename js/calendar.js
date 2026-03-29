/* ===== calendar.js — Мини-календарь на главном экране ===== */

const Calendar = {
  state: null,
  year: null,
  month: null, // 0-based

  MONTHS: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ],

  init(state) {
    this.state = state;
    const now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth();
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const prev = document.getElementById('calPrev');
    const next = document.getElementById('calNext');
    if (prev) prev.addEventListener('click', () => { this.prevMonth(); });
    if (next) next.addEventListener('click', () => { this.nextMonth(); });
  },

  prevMonth() {
    this.month--;
    if (this.month < 0) { this.month = 11; this.year--; }
    this.render();
  },

  nextMonth() {
    this.month++;
    if (this.month > 11) { this.month = 0; this.year++; }
    this.render();
  },

  /** Средний score для каждого дня (dateKey -> avg score) */
  getDayScores() {
    const map = {};
    (this.state.entries || []).forEach(e => {
      if (e.hidden) return;
      const key = Streak.dateKey(e.ts);
      if (!map[key]) map[key] = [];
      map[key].push(e.score || e.intensity || 5);
    });
    const result = {};
    Object.keys(map).forEach(k => {
      const arr = map[k];
      result[k] = arr.reduce((a, b) => a + b, 0) / arr.length;
    });
    return result;
  },

  /** Получить CSS-класс по score */
  scoreClass(score) {
    if (score == null) return 'cal-day--no-data';
    const s = Math.round(score);
    if (s <= 3) return 'cal-day--score-1';
    if (s <= 5) return 'cal-day--score-4';
    if (s <= 7) return 'cal-day--score-6';
    return 'cal-day--score-8';
  },

  render() {
    // Заголовок
    const monthEl = document.getElementById('calMonth');
    if (monthEl) monthEl.textContent = this.MONTHS[this.month] + ' ' + this.year;

    const grid = document.getElementById('calGrid');
    if (!grid) return;

    const scores = this.getDayScores();
    const now = new Date();
    const todayKey = Streak.todayKey();

    // Первый день месяца
    const firstDay = new Date(this.year, this.month, 1);
    let startDow = firstDay.getDay(); // 0=вс
    startDow = startDow === 0 ? 6 : startDow - 1; // 0=пн

    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

    let html = '';

    // Пустые ячейки до начала месяца
    for (let i = 0; i < startDow; i++) {
      html += '<div class="cal-day"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(this.year, this.month, d);
      const key = Streak.dateKey(dateObj.getTime());
      const isFuture = dateObj > now;
      const isToday = key === todayKey;
      const score = scores[key];

      let cls = 'cal-day';
      if (isToday) cls += ' cal-day--today';
      if (isFuture) {
        cls += ' cal-day--future';
      } else if (score != null) {
        cls += ' ' + this.scoreClass(score);
      } else {
        cls += ' cal-day--no-data';
      }

      html += '<div class="' + cls + '" data-date="' + key + '">' + d + '</div>';
    }

    grid.innerHTML = html;

    // Клик по дню — показать записи в истории
    grid.addEventListener('click', (ev) => {
      const day = ev.target.closest('.cal-day');
      if (!day || !day.dataset.date) return;
      History.showDay(day.dataset.date);
      App.switchTab('tabNotes');
    });
  }
};
