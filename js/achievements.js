/* ===== achievements.js — Бейджи, магазин, проверка достижений ===== */

const Achieve = {
  state: null,

  init(state) {
    this.state = state;
  },

  /** Check and unlock achievements, returns newly unlocked */
  checkAll() {
    const state = this.state;
    const entries = state.entries || [];
    const visible = entries.filter(e => !e.hidden);
    const unlocked = state.achievements || {};
    const newlyUnlocked = [];

    // first_step: first entry
    if (!unlocked.first_step && visible.length >= 1) {
      unlocked.first_step = Date.now();
      newlyUnlocked.push('first_step');
    }

    // week_fire: streak 7
    if (!unlocked.week_fire && (state.maxStreak || 0) >= 7) {
      unlocked.week_fire = Date.now();
      newlyUnlocked.push('week_fire');
    }

    // half_moon: streak 14
    if (!unlocked.half_moon && (state.maxStreak || 0) >= 14) {
      unlocked.half_moon = Date.now();
      newlyUnlocked.push('half_moon');
    }

    // month_power: streak 30
    if (!unlocked.month_power && (state.maxStreak || 0) >= 30) {
      unlocked.month_power = Date.now();
      newlyUnlocked.push('month_power');
    }

    // unbreakable: streak 60
    if (!unlocked.unbreakable && (state.maxStreak || 0) >= 60) {
      unlocked.unbreakable = Date.now();
      newlyUnlocked.push('unbreakable');
    }

    // legend: streak 100
    if (!unlocked.legend && (state.maxStreak || 0) >= 100) {
      unlocked.legend = Date.now();
      newlyUnlocked.push('legend');
    }

    // writer: 10 entries with text > 10 chars
    if (!unlocked.writer) {
      const withText = visible.filter(e => e.text && e.text.length > 10).length;
      if (withText >= 10) {
        unlocked.writer = Date.now();
        newlyUnlocked.push('writer');
      }
    }

    // explorer: 50 entries with context
    if (!unlocked.explorer) {
      const withCtx = visible.filter(e => {
        if (!e.context) return false;
        return (e.context.places || []).length > 0 ||
               (e.context.activities || []).length > 0 ||
               (e.context.people || []).length > 0 ||
               (e.context.body || []).length > 0 ||
               e.context.weather || e.context.sleepHours != null;
      }).length;
      if (withCtx >= 50) {
        unlocked.explorer = Date.now();
        newlyUnlocked.push('explorer');
      }
    }

    // full_palette: all 8 default emotions used
    if (!unlocked.full_palette) {
      const usedEmotions = new Set(visible.map(e => e.emotion).filter(Boolean));
      const defaults = DEFAULT_EMOTIONS.map(e => e.name);
      const allUsed = defaults.every(name => usedEmotions.has(name));
      if (allUsed) {
        unlocked.full_palette = Date.now();
        newlyUnlocked.push('full_palette');
      }
    }

    // collector: 500 total crystals
    if (!unlocked.collector && (state.totalCrystals || 0) >= 500) {
      unlocked.collector = Date.now();
      newlyUnlocked.push('collector');
    }

    // goal_setter: 4 weekly goals completed in a row
    if (!unlocked.goal_setter && (state.weekGoalStreak || 0) >= 4) {
      unlocked.goal_setter = Date.now();
      newlyUnlocked.push('goal_setter');
    }

    // analyst: 14+ entries and used analytics
    if (!unlocked.analyst && visible.length >= 14) {
      unlocked.analyst = Date.now();
      newlyUnlocked.push('analyst');
    }

    state.achievements = unlocked;
    return newlyUnlocked;
  },

  /** Render the achievements tab */
  render() {
    this.checkAll();
    this.renderLevel();
    this.renderBadges();
    this.renderShop();
  },

  renderLevel() {
    const state = this.state;
    const total = state.totalCrystals || 0;
    const level = Streak.getLevel(total);
    const next = Streak.getNextLevel(total);
    const progress = Streak.getLevelProgress(total);

    const levelIcons = { 1: '🌱', 2: '👁', 3: '🔍', 4: '🧘', 5: '⭐', 6: '🌟' };

    const iconEl = document.getElementById('achieveLevelIcon');
    const nameEl = document.getElementById('achieveLevelName');
    const xpEl = document.getElementById('achieveLevelXp');
    const barEl = document.getElementById('achieveLevelBar');

    if (iconEl) iconEl.textContent = levelIcons[level.level] || '🌱';
    if (nameEl) nameEl.textContent = 'Ур. ' + level.level + ' — ' + level.name;
    if (xpEl) {
      if (next) {
        xpEl.textContent = total + ' / ' + next.xp + ' 💎';
      } else {
        xpEl.textContent = 'Макс. уровень ✨';
      }
    }
    if (barEl) barEl.style.width = Math.round(progress * 100) + '%';

    // Stats
    const entries = (state.entries || []).filter(e => !e.hidden);
    const totalEntriesEl = document.getElementById('achieveTotalEntries');
    const maxStreakEl = document.getElementById('achieveMaxStreak');
    const totalCrystalsEl = document.getElementById('achieveTotalCrystals');

    if (totalEntriesEl) totalEntriesEl.textContent = entries.length;
    if (maxStreakEl) maxStreakEl.textContent = state.maxStreak || 0;
    if (totalCrystalsEl) totalCrystalsEl.textContent = total;
  },

  renderBadges() {
    const grid = document.getElementById('badgeGrid');
    if (!grid) return;

    const unlocked = this.state.achievements || {};
    const keys = Object.keys(ACHIEVEMENTS);
    const unlockedCount = keys.filter(k => unlocked[k]).length;

    let html = '<div class="badge-counter">' + unlockedCount + ' / ' + keys.length + '</div>';

    keys.forEach(key => {
      const a = ACHIEVEMENTS[key];
      const isUnlocked = !!unlocked[key];
      const cls = 'badge' + (isUnlocked ? ' badge--unlocked' : '');

      html += '<div class="' + cls + '">';
      html += '<div class="badge__icon">' + a.icon + '</div>';
      html += '<div class="badge__name">' + a.name + '</div>';
      html += '<div class="badge__desc">' + a.desc + '</div>';
      if (isUnlocked) {
        const d = new Date(unlocked[key]);
        html += '<div class="badge__date">' + d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() + '</div>';
      }
      html += '</div>';
    });

    grid.innerHTML = html;
  },

  renderShop() {
    const balanceEl = document.getElementById('shopBalance');
    const itemsEl = document.getElementById('shopItems');
    if (!itemsEl) return;

    if (balanceEl) balanceEl.textContent = this.state.crystals || 0;

    let html = '';
    SHOP_ITEMS.forEach(item => {
      const canAfford = (this.state.crystals || 0) >= item.price;
      const owned = this.getItemCount(item.type);
      html += '<div class="shop-item">';
      html += '<div class="shop-item__left">';
      html += '<span class="shop-item__icon">' + item.icon + '</span>';
      html += '<div class="shop-item__info">';
      html += '<span class="shop-item__name">' + item.name + '</span>';
      html += '<span class="shop-item__owned">Есть: ' + owned + '</span>';
      html += '</div>';
      html += '</div>';
      html += '<button class="btn btn--primary shop-item__buy' + (canAfford ? '' : ' shop-item__buy--disabled') + '" data-item="' + item.id + '"' + (canAfford ? '' : ' disabled') + '>';
      html += item.price + ' 💎';
      html += '</button>';
      html += '</div>';
    });

    itemsEl.innerHTML = html;

    // Bind buy buttons
    itemsEl.querySelectorAll('.shop-item__buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.item;
        this.buyItem(itemId);
      });
    });
  },

  getItemCount(type) {
    const freezes = this.state.freezes || { d1: 0, d3: 0 };
    return freezes[type] || 0;
  },

  buyItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    if ((this.state.crystals || 0) < item.price) return;

    this.state.crystals -= item.price;
    if (!this.state.freezes) this.state.freezes = { d1: 0, d3: 0 };
    this.state.freezes[item.type] = (this.state.freezes[item.type] || 0) + 1;

    App.save();
    this.render();
  }
};
