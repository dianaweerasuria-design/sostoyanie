/* ===== home-screen.js — Логика домашнего экрана ===== */

const HomeScreen = {
  state: null,
  selectedDate: null,

  init(state) {
    this.state = state;
    this.selectedDate = new Date();
    this.selectedDate.setHours(0, 0, 0, 0);
    this.render();
  },

  /** Navigate selected day by delta days */
  navigateDay(delta) {
    this.selectedDate = new Date(this.selectedDate.getTime() + delta * 86400000);
    this.render();
  },

  /** Format date to YYYY-MM-DD */
  dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  },

  /** Check if date has any data */
  hasData(dateKey) {
    const morningDiaries = this.state.morningDiaries || {};
    const eveningDiaries = this.state.eveningDiaries || {};
    const entries = this.state.entries || [];
    if (morningDiaries[dateKey]) return true;
    if (eveningDiaries[dateKey]) return true;
    return entries.some(e => Streak.dateKey(e.ts) === dateKey);
  },

  /** Get score for a date from evening diary */
  getEveningScore(dateKey) {
    const ed = (this.state.eveningDiaries || {})[dateKey];
    return ed ? ed.score : null;
  },

  /** Get week dates (Mon-Sun) around selectedDate */
  getWeekDates() {
    const d = new Date(this.selectedDate);
    const dow = d.getDay();
    const mondayOff = dow === 0 ? 6 : dow - 1;
    const monday = new Date(d);
    monday.setDate(d.getDate() - mondayOff);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  },

  render() {
    const container = document.getElementById('homeDayNav');
    if (!container) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selKey = this.dateKey(this.selectedDate);
    const weekDays = this.getWeekDates();
    const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    // Format selected date text
    const isToday = this.selectedDate.getTime() === today.getTime();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const isYesterday = this.selectedDate.getTime() === yesterday.getTime();
    let dateText = isToday ? 'Сегодня' :
                   isYesterday ? 'Вчера' :
                   this.selectedDate.getDate() + ' ' + MONTHS[this.selectedDate.getMonth()];

    // Day nav bar
    let navHtml = '<div class="day-nav">';
    navHtml += '<div class="day-nav__top">';
    navHtml += '<button class="day-nav__arrow" id="dayNavPrev">‹</button>';
    navHtml += '<span class="day-nav__date">' + dateText + '</span>';
    navHtml += '<button class="day-nav__arrow" id="dayNavNext">›</button>';
    navHtml += '</div>';
    navHtml += '<div class="day-nav__week">';
    weekDays.forEach(day => {
      const key = this.dateKey(day);
      const isSelected = key === selKey;
      const isTodayDay = day.getTime() === today.getTime();
      const hasDot = this.hasData(key);
      let cls = 'day-nav__day';
      if (isSelected) cls += ' selected';
      if (isTodayDay) cls += ' today';
      navHtml += '<button class="' + cls + '" data-key="' + key + '">';
      navHtml += '<span class="day-nav__day-name">' + DAY_NAMES[day.getDay()] + '</span>';
      navHtml += '<span class="day-nav__day-num">' + day.getDate() + '</span>';
      navHtml += '<span class="day-nav__dot' + (hasDot ? ' visible' : '') + '"></span>';
      navHtml += '</button>';
    });
    navHtml += '</div>';
    navHtml += '</div>';

    container.innerHTML = navHtml;

    // Events for arrows
    document.getElementById('dayNavPrev').addEventListener('click', () => this.navigateDay(-1));
    document.getElementById('dayNavNext').addEventListener('click', () => this.navigateDay(1));

    // Events for day buttons
    container.querySelectorAll('.day-nav__day').forEach(btn => {
      btn.addEventListener('click', () => {
        const parts = btn.dataset.key.split('-');
        this.selectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        this.render();
      });
    });

    // Day score card
    this.renderScoreCard(selKey);

    // Diary cards
    this.renderDiaryCards(selKey);
  },

  renderScoreCard(dateKey) {
    const el = document.getElementById('homeDayScore');
    if (!el) return;
    const score = this.getEveningScore(dateKey);
    let cls = 'day-score-card';
    let scoreText = '—';
    if (score !== null) {
      scoreText = score;
      if (score <= 3) cls += ' day-score-card--red';
      else if (score <= 6) cls += ' day-score-card--gold';
      else if (score <= 8) cls += ' day-score-card--green';
      else cls += ' day-score-card--blue';
    }
    el.innerHTML = '<div class="' + cls + '">' +
      '<div class="day-score-card__label">ОЦЕНКА ДНЯ</div>' +
      '<div class="day-score-card__score">' + scoreText + '</div>' +
      '</div>';
  },

  renderDiaryCards(dateKey) {
    const el = document.getElementById('homeDiaryCards');
    if (!el) return;
    const hasMorning = !!(this.state.morningDiaries || {})[dateKey];
    const hasEvening = !!(this.state.eveningDiaries || {})[dateKey];

    el.innerHTML = '<div class="diary-cards-row">' +
      '<div class="diary-card" id="homeMorningCard">' +
        '<div class="diary-card__icon">☀️</div>' +
        '<div class="diary-card__name">Утро</div>' +
        '<div class="diary-card__status ' + (hasMorning ? 'filled' : '') + '">' +
          (hasMorning ? 'Заполнен ✓' : 'Не заполнен') +
        '</div>' +
      '</div>' +
      '<div class="diary-card" id="homeEveningCard">' +
        '<div class="diary-card__icon">🌙</div>' +
        '<div class="diary-card__name">Вечер</div>' +
        '<div class="diary-card__status ' + (hasEvening ? 'filled' : '') + '">' +
          (hasEvening ? 'Заполнен ✓' : 'Не заполнен') +
        '</div>' +
      '</div>' +
    '</div>';

    document.getElementById('homeMorningCard').addEventListener('click', () => {
      if (typeof MorningDiary !== 'undefined') MorningDiary.open(dateKey);
    });
    document.getElementById('homeEveningCard').addEventListener('click', () => {
      if (typeof EveningDiary !== 'undefined') EveningDiary.open(dateKey);
    });
  },

  updateDayDots() {
    this.render();
  }
};
