/* ===== analytics.js — Графики, корреляции, паттерны ===== */

const Analytics = {
  state: null,
  period: 'week', // 'week' | 'month' | 'all'
  pixelsYear: new Date().getFullYear(),

  init(state) {
    this.state = state;
    this.pixelsYear = new Date().getFullYear();
    this.bindEvents();
  },

  bindEvents() {
    // Period tabs
    document.querySelectorAll('.analytics__period-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.period = tab.dataset.period;
        document.querySelectorAll('.analytics__period-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.render();
      });
    });

    // Pixels year nav
    const prev = document.getElementById('pixelsPrev');
    const next = document.getElementById('pixelsNext');
    if (prev) prev.addEventListener('click', () => { this.pixelsYear--; this.renderPixels(); });
    if (next) next.addEventListener('click', () => { this.pixelsYear++; this.renderPixels(); });
  },

  /** Get entries for the selected period */
  getEntries() {
    const entries = (this.state.entries || []).filter(e => !e.hidden);
    if (this.period === 'all') return entries;

    const now = new Date();
    let start;
    if (this.period === 'week') {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
    }
    start.setHours(0, 0, 0, 0);
    return entries.filter(e => e.ts >= start.getTime());
  },

  /** Render everything */
  render() {
    const entries = this.getEntries();
    this.renderTrend(entries);
    this.renderCorrelations(entries);
    this.renderPatterns(entries);
    this.renderEmotions(entries);
    this.renderPixels();
  },

  /** Trend chart — bar chart of daily average scores */
  renderTrend(entries) {
    const chart = document.getElementById('trendChart');
    const labels = document.getElementById('trendLabels');
    const empty = document.getElementById('trendEmpty');
    if (!chart) return;

    // Group by day
    const dayMap = {};
    entries.forEach(e => {
      if (e.score == null) return;
      const key = Streak.dateKey(e.ts);
      if (!dayMap[key]) dayMap[key] = [];
      dayMap[key].push(e.score);
    });

    const days = Object.keys(dayMap).sort();
    if (days.length < 2) {
      chart.innerHTML = '';
      labels.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    // Limit to last N days based on period
    const maxBars = this.period === 'week' ? 7 : this.period === 'month' ? 30 : 60;
    const sliced = days.slice(-maxBars);

    let html = '<div class="trend-chart__bars">';
    sliced.forEach(day => {
      const arr = dayMap[day];
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      const pct = (avg / 10) * 100;
      const cls = this.barColorClass(avg);
      const parts = day.split('-');
      const label = parts[2] + '.' + parts[1];
      html += '<div class="trend-bar" title="' + label + ': ' + avg.toFixed(1) + '">';
      html += '<div class="trend-bar__fill ' + cls + '" style="height:' + pct + '%"></div>';
      html += '</div>';
    });
    html += '</div>';
    chart.innerHTML = html;

    // Labels (first, middle, last)
    let lblHtml = '';
    if (sliced.length > 0) {
      const first = sliced[0].split('-');
      const last = sliced[sliced.length - 1].split('-');
      lblHtml = '<span>' + first[2] + '.' + first[1] + '</span><span>' + last[2] + '.' + last[1] + '</span>';
    }
    labels.innerHTML = lblHtml;
  },

  barColorClass(score) {
    if (score <= 3) return 'trend-bar__fill--red';
    if (score <= 5) return 'trend-bar__fill--yellow';
    if (score <= 7) return 'trend-bar__fill--green';
    return 'trend-bar__fill--blue';
  },

  /** Correlations */
  renderCorrelations(entries) {
    const el = document.getElementById('correlationsList');
    const empty = document.getElementById('correlationsEmpty');
    if (!el) return;

    const minSamples = this.period === 'all' ? 5 : 3;
    const results = this.calculateCorrelations(entries, minSamples);

    if (results.length === 0) {
      el.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    // Show top 10
    const top = results.slice(0, 10);
    let html = '';
    top.forEach(r => {
      const icon = this.factorIcon(r.type);
      const sign = r.delta > 0 ? '+' : '';
      const cls = r.delta > 0 ? 'correlation--positive' : 'correlation--negative';
      html += '<div class="correlation-item ' + cls + '">';
      html += '<div class="correlation-item__left">';
      html += '<span class="correlation-item__icon">' + icon + '</span>';
      html += '<span class="correlation-item__name">' + r.name + '</span>';
      html += '</div>';
      html += '<div class="correlation-item__right">';
      html += '<span class="correlation-item__delta">' + sign + r.delta + '</span>';
      html += '<span class="correlation-item__count">(' + r.count + ')</span>';
      html += '</div>';
      html += '</div>';
    });
    el.innerHTML = html;
  },

  factorIcon(type) {
    // Ищем иконку в динамических группах
    var groups = (this.state && this.state.custom && this.state.custom.tagGroups) || [];
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].id === type) return groups[i].icon;
    }
    var icons = { activity: '🏃', people: '👥', place: '📍', weather: '🌤', sleep: '💤', body: '🧘',
                  activities: '🏃', places: '📍' };
    return icons[type] || '📌';
  },

  /** Patterns: best/worst days of week, best/worst time of day */
  renderPatterns(entries) {
    const el = document.getElementById('patternsList');
    const empty = document.getElementById('patternsEmpty');
    if (!el) return;

    if (entries.length < 5) {
      el.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    let html = '';

    // Day of week analysis
    const dowNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dowScores = {};
    entries.forEach(e => {
      if (e.score == null) return;
      const dow = new Date(e.ts).getDay();
      if (!dowScores[dow]) dowScores[dow] = [];
      dowScores[dow].push(e.score);
    });

    const dowAvgs = [];
    Object.keys(dowScores).forEach(d => {
      const arr = dowScores[d];
      if (arr.length >= 2) {
        dowAvgs.push({ day: +d, avg: arr.reduce((a, b) => a + b, 0) / arr.length, count: arr.length });
      }
    });

    if (dowAvgs.length >= 2) {
      dowAvgs.sort((a, b) => b.avg - a.avg);
      const best = dowAvgs[0];
      const worst = dowAvgs[dowAvgs.length - 1];

      html += '<div class="pattern-section">';
      html += '<h3 class="pattern-section__title">📅 Дни недели</h3>';
      html += '<div class="pattern-bars">';
      // Show all days in order Mon-Sun
      const orderedDays = [1, 2, 3, 4, 5, 6, 0];
      orderedDays.forEach(d => {
        const data = dowAvgs.find(x => x.day === d);
        const avg = data ? data.avg : 0;
        const pct = data ? (avg / 10) * 100 : 0;
        const cls = data ? this.barColorClass(avg) : '';
        html += '<div class="pattern-bar-col">';
        html += '<div class="pattern-bar">';
        if (data) {
          html += '<div class="pattern-bar__fill ' + cls + '" style="height:' + pct + '%"></div>';
        }
        html += '</div>';
        html += '<span class="pattern-bar__label">' + dowNames[d] + '</span>';
        html += '</div>';
      });
      html += '</div>';
      html += '<p class="pattern-insight">Лучший день — <b>' + dowNames[best.day] + '</b> (' + best.avg.toFixed(1) + '), худший — <b>' + dowNames[worst.day] + '</b> (' + worst.avg.toFixed(1) + ')</p>';
      html += '</div>';
    }

    // Time of day analysis
    const timeSlots = { 'Утро (6–12)': [6, 12], 'День (12–18)': [12, 18], 'Вечер (18–24)': [18, 24], 'Ночь (0–6)': [0, 6] };
    const timeScores = {};
    entries.forEach(e => {
      if (e.score == null) return;
      const h = new Date(e.ts).getHours();
      Object.keys(timeSlots).forEach(name => {
        const [start, end] = timeSlots[name];
        if (h >= start && h < end) {
          if (!timeScores[name]) timeScores[name] = [];
          timeScores[name].push(e.score);
        }
      });
    });

    const timeAvgs = [];
    Object.keys(timeScores).forEach(name => {
      const arr = timeScores[name];
      if (arr.length >= 2) {
        timeAvgs.push({ name, avg: arr.reduce((a, b) => a + b, 0) / arr.length, count: arr.length });
      }
    });

    if (timeAvgs.length >= 2) {
      timeAvgs.sort((a, b) => b.avg - a.avg);
      html += '<div class="pattern-section mt-16">';
      html += '<h3 class="pattern-section__title">🕐 Время суток</h3>';
      timeAvgs.forEach(t => {
        const pct = (t.avg / 10) * 100;
        const cls = this.barColorClass(t.avg);
        html += '<div class="pattern-time-row">';
        html += '<span class="pattern-time-row__label">' + t.name + '</span>';
        html += '<div class="pattern-time-row__bar">';
        html += '<div class="pattern-time-row__fill ' + cls + '" style="width:' + pct + '%"></div>';
        html += '</div>';
        html += '<span class="pattern-time-row__val">' + t.avg.toFixed(1) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    el.innerHTML = html || '<p class="text-muted">Недостаточно данных</p>';
  },

  /** Emotion distribution */
  renderEmotions(entries) {
    const el = document.getElementById('emotionDistribution');
    if (!el) return;

    const counts = {};
    let total = 0;
    entries.forEach(e => {
      if (e.emotion) {
        const key = (e.emotionEmoji || '') + ' ' + e.emotion;
        counts[key] = (counts[key] || 0) + 1;
        total++;
      }
    });

    if (total === 0) {
      el.innerHTML = '<p class="text-muted">Нет записей с эмоциями</p>';
      return;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    let html = '';
    sorted.forEach(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      html += '<div class="emotion-dist-row">';
      html += '<span class="emotion-dist-row__name">' + name + '</span>';
      html += '<div class="emotion-dist-row__bar">';
      html += '<div class="emotion-dist-row__fill" style="width:' + pct + '%"></div>';
      html += '</div>';
      html += '<span class="emotion-dist-row__val">' + pct + '%</span>';
      html += '</div>';
    });
    el.innerHTML = html;
  },

  /** Year in Pixels */
  renderPixels() {
    const el = document.getElementById('pixelsGrid');
    const yearEl = document.getElementById('pixelsYear');
    if (!el) return;
    if (yearEl) yearEl.textContent = this.pixelsYear;

    // Build day scores map for the year
    const scores = {};
    (this.state.entries || []).forEach(e => {
      if (e.hidden || e.score == null) return;
      const d = new Date(e.ts);
      if (d.getFullYear() !== this.pixelsYear) return;
      const key = Streak.dateKey(e.ts);
      if (!scores[key]) scores[key] = [];
      scores[key].push(e.score);
    });

    const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const now = new Date();
    let html = '';

    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(this.pixelsYear, m + 1, 0).getDate();
      html += '<div class="pixels__month">';
      html += '<div class="pixels__month-name">' + MONTH_NAMES[m] + '</div>';
      html += '<div class="pixels__month-days">';
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(this.pixelsYear, m, d);
        const key = Streak.dateKey(dateObj.getTime());
        const isFuture = dateObj > now;
        let cls = 'pixels__day';

        if (isFuture) {
          cls += ' pixels__day--future';
        } else if (scores[key]) {
          const avg = scores[key].reduce((a, b) => a + b, 0) / scores[key].length;
          cls += ' ' + this.pixelClass(avg);
        } else {
          cls += ' pixels__day--none';
        }

        html += '<div class="' + cls + '" title="' + d + ' ' + MONTH_NAMES[m] + '"></div>';
      }
      html += '</div></div>';
    }
    el.innerHTML = html;
  },

  pixelClass(score) {
    const s = Math.round(score);
    if (s <= 3) return 'pixels__day--1';
    if (s <= 5) return 'pixels__day--4';
    if (s <= 7) return 'pixels__day--6';
    return 'pixels__day--8';
  },

  /** Расчёт корреляций */
  calculateCorrelations(entries, minSamples) {
    minSamples = minSamples || 5;
    const factors = new Map();

    entries.forEach(function(entry) {
      if (!entry.context) return;
      var score = entry.score;
      if (score == null) return;
      var allFactors = new Set();

      // Динамические группы тегов
      var ctx = entry.context;
      var groups = (Analytics.state && Analytics.state.custom && Analytics.state.custom.tagGroups) || [];
      groups.forEach(function(g) {
        (ctx[g.id] || []).forEach(function(t) { allFactors.add(g.id + ':' + t); });
      });
      // Обратная совместимость: стандартные ключи
      if (groups.length === 0) {
        (ctx.activities || []).forEach(function(a) { allFactors.add('activities:' + a); });
        (ctx.people || []).forEach(function(p) { allFactors.add('people:' + p); });
        (ctx.places || []).forEach(function(p) { allFactors.add('places:' + p); });
        (ctx.body || []).forEach(function(b) { allFactors.add('body:' + b); });
      }
      if (ctx.weather) allFactors.add('weather:' + ctx.weather);
      if (ctx.sleepHours != null) {
        var h = ctx.sleepHours;
        var cat = h < 5 ? '<5ч' : h < 6 ? '5-6ч' : h < 7 ? '6-7ч' : h < 8 ? '7-8ч' : h < 9 ? '8-9ч' : '>9ч';
        allFactors.add('sleep:' + cat);
      }

      allFactors.forEach(function(f) {
        if (!factors.has(f)) factors.set(f, { with: [], without: [] });
        factors.get(f).with.push(score);
      });

      factors.forEach(function(data, key) {
        if (!allFactors.has(key)) {
          data.without.push(score);
        }
      });
    });

    var results = [];
    factors.forEach(function(data, key) {
      if (data.with.length < minSamples) return;
      var avgWith = data.with.reduce(function(a, b) { return a + b; }, 0) / data.with.length;
      var avgWithout = data.without.length > 0
        ? data.without.reduce(function(a, b) { return a + b; }, 0) / data.without.length
        : null;
      if (avgWithout === null) return;

      var delta = +(avgWith - avgWithout).toFixed(1);
      var parts = key.split(':');
      results.push({ type: parts[0], name: parts[1], delta: delta, count: data.with.length });
    });

    results.sort(function(a, b) { return Math.abs(b.delta) - Math.abs(a.delta); });
    return results;
  }
};
