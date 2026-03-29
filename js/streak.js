/* ===== streak.js — Серии, кристаллы, уровни, достижения ===== */

const Streak = {
  state: null,

  init(state) {
    this.state = state;
    this.calculateStreak();
    this.render();
  },

  /** Получить дату (YYYY-MM-DD) из timestamp */
  dateKey(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  },

  /** Получить сегодняшнюю дату-ключ */
  todayKey() {
    return this.dateKey(Date.now());
  },

  /** Получить вчерашнюю дату-ключ */
  yesterdayKey() {
    return this.dateKey(Date.now() - 86400000);
  },

  /** Набор уникальных дней с записями */
  getEntryDays() {
    const days = new Set();
    (this.state.entries || []).forEach(e => {
      days.add(this.dateKey(e.ts));
    });
    return days;
  },

  /** Рассчитать текущую серию */
  calculateStreak() {
    const days = this.getEntryDays();
    const today = this.todayKey();
    const yesterday = this.yesterdayKey();

    // Определяем стартовый день отсчёта
    let checkDate;
    if (days.has(today)) {
      checkDate = today;
    } else if (days.has(yesterday)) {
      checkDate = yesterday;
    } else {
      // Нет записей ни сегодня ни вчера — серия 0
      // Но можем использовать заморозки
      checkDate = this.tryFreeze(days);
      if (!checkDate) {
        this.state.streak = 0;
        return;
      }
    }

    // Считаем серию назад
    let streak = 0;
    let d = new Date(checkDate + 'T12:00:00');
    while (true) {
      const key = this.dateKey(d.getTime());
      if (days.has(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }

    this.state.streak = streak;
    if (streak > (this.state.maxStreak || 0)) {
      this.state.maxStreak = streak;
    }
  },

  /** Попытка использовать заморозку */
  tryFreeze(days) {
    // Простая логика: если вчера не было записи, но позавчера — была,
    // можно использовать заморозку на 1 день
    // Для MVP не расходуем заморозки автоматически
    return null;
  },

  /** Среднее настроение за последние N дней */
  avgMood(nDays) {
    const now = Date.now();
    const cutoff = now - nDays * 86400000;
    const scores = this.state.entries
      .filter(e => e.ts >= cutoff && e.score)
      .map(e => e.score);
    if (scores.length === 0) return null;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  },

  /** Количество дней с записями на текущей неделе (пн-вс) */
  weekEntryDays() {
    const now = new Date();
    const day = now.getDay(); // 0=вс
    const mondayOffset = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const days = this.getEntryDays();
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      if (d > now) break;
      if (days.has(this.dateKey(d.getTime()))) count++;
    }
    return count;
  },

  /** Установить цель недели */
  setWeekGoal(n) {
    this.state.weekGoal = n;
    App.save();
    this.render();
  },

  /** Рендер виджета серии и цели */
  render() {
    this.renderStreak();
    this.renderWeekGoal();
  },

  renderStreak() {
    // Серия
    const countEl = document.getElementById('streakCount');
    if (countEl) countEl.textContent = this.state.streak || 0;

    // Заморозки
    const freezeEl = document.getElementById('streakFreezes');
    if (freezeEl) {
      const f = this.state.freezes || { d1: 0, d3: 0 };
      const total = (f.d1 || 0) + (f.d3 || 0);
      let slots = '';
      for (let i = 0; i < 3; i++) {
        if (i < total) {
          slots += '<span class="freeze-slot freeze-slot--active">🧊</span>';
        } else {
          slots += '<span class="freeze-slot">🧊</span>';
        }
      }
      freezeEl.innerHTML = slots;
    }

    // Уровень
    const level = this.getLevel(this.state.totalCrystals || 0);
    const next = this.getNextLevel(this.state.totalCrystals || 0);
    const progress = this.getLevelProgress(this.state.totalCrystals || 0);

    const nameEl = document.getElementById('levelName');
    const xpEl = document.getElementById('levelXp');
    const progressEl = document.getElementById('levelProgress');

    if (nameEl) nameEl.textContent = level.name;
    if (xpEl) {
      if (next) {
        xpEl.textContent = (this.state.totalCrystals || 0) + ' / ' + next.xp + ' 💎';
      } else {
        xpEl.textContent = 'Макс. уровень ✨';
      }
    }
    if (progressEl) progressEl.style.width = Math.round(progress * 100) + '%';

    // Среднее за 7 дней
    const avgEl = document.getElementById('avgMood7');
    if (avgEl) {
      const avg = this.avgMood(7);
      avgEl.textContent = avg !== null ? avg : '—';
    }
  },

  renderWeekGoal() {
    const selector = document.getElementById('weekGoalSelector');
    const progressBlock = document.getElementById('weekGoalProgress');
    if (!selector || !progressBlock) return;

    if (!this.state.weekGoal) {
      selector.style.display = 'block';
      progressBlock.style.display = 'none';
    } else {
      selector.style.display = 'none';
      progressBlock.style.display = 'block';

      const goal = this.state.weekGoal;
      const done = this.weekEntryDays();
      const pct = Math.min(100, Math.round((done / goal) * 100));
      const completed = done >= goal;

      document.getElementById('weekGoalText').textContent = done + ' / ' + goal + ' дней';
      document.getElementById('weekGoalBar').style.width = pct + '%';

      const rewardEl = document.getElementById('weekGoalReward');
      if (rewardEl) {
        if (completed) {
          rewardEl.textContent = 'Цель выполнена! 🎉';
        } else {
          const remaining = goal - done;
          rewardEl.textContent = 'Ещё ' + remaining + ' ' + this.pluralDays(remaining);
        }
      }
    }
  },

  /** Склонение слова "день" */
  pluralDays(n) {
    const abs = Math.abs(n) % 100;
    const last = abs % 10;
    if (abs > 10 && abs < 20) return 'дней';
    if (last > 1 && last < 5) return 'дня';
    if (last === 1) return 'день';
    return 'дней';
  },

  // === Уровни (сохраняем из прошлого) ===

  getLevel(totalCrystals) {
    let current = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalCrystals >= LEVELS[i].xp) {
        current = LEVELS[i];
        break;
      }
    }
    return current;
  },

  getNextLevel(totalCrystals) {
    for (let i = 0; i < LEVELS.length; i++) {
      if (totalCrystals < LEVELS[i].xp) {
        return LEVELS[i];
      }
    }
    return null;
  },

  getLevelProgress(totalCrystals) {
    const current = this.getLevel(totalCrystals);
    const next = this.getNextLevel(totalCrystals);
    if (!next) return 1;
    const range = next.xp - current.xp;
    const progress = totalCrystals - current.xp;
    return range > 0 ? progress / range : 1;
  }
};
