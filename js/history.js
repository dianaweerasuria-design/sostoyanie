/* ===== history.js — Вкладка «Заметки» (день/неделя/месяц) ===== */

const History = {
  state: null,
  period: 'day', // 'day' | 'week' | 'month'
  offset: 0, // 0 = current, -1 = previous, etc.
  editingEntry: null,

  init(state) {
    this.state = state;
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    // Period tabs
    document.querySelectorAll('.notes__period-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.period = tab.dataset.period;
        this.offset = 0;
        document.querySelectorAll('.notes__period-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.render();
      });
    });

    // Navigation
    document.getElementById('notesPrev').addEventListener('click', () => { this.offset--; this.render(); });
    document.getElementById('notesNext').addEventListener('click', () => {
      if (this.offset < 0) { this.offset++; this.render(); }
    });

    // Edit modal
    const scoreRange = document.getElementById('editScore');
    const scoreVal = document.getElementById('editScoreValue');
    if (scoreRange) scoreRange.addEventListener('input', () => { scoreVal.textContent = scoreRange.value; });

    document.getElementById('editCancel').addEventListener('click', () => this.closeModal());
    document.getElementById('editModal').addEventListener('click', (e) => { if (e.target.id === 'editModal') this.closeModal(); });
    document.getElementById('editSave').addEventListener('click', () => this.saveEdit());
    document.getElementById('editHide').addEventListener('click', () => this.hideEntry());
  },

  /** Get date range for current period/offset */
  getRange() {
    const now = new Date();
    let start, end;

    if (this.period === 'day') {
      const d = new Date(now);
      d.setDate(d.getDate() + this.offset);
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    } else if (this.period === 'week') {
      const day = now.getDay();
      const mondayOff = day === 0 ? 6 : day - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOff + (this.offset * 7));
      start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else { // month
      const m = new Date(now.getFullYear(), now.getMonth() + this.offset, 1);
      start = new Date(m.getFullYear(), m.getMonth(), 1, 0, 0, 0);
      end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    return { start, end };
  },

  /** Get entries in range */
  getEntries() {
    const { start, end } = this.getRange();
    return (this.state.entries || []).filter(e =>
      e.ts >= start.getTime() && e.ts <= end.getTime()
    ).sort((a, b) => b.ts - a.ts);
  },

  /** Format navigation label */
  getNavLabel() {
    const now = new Date();
    const MONTHS = Calendar.MONTHS;

    if (this.period === 'day') {
      const d = new Date(now);
      d.setDate(d.getDate() + this.offset);
      if (this.offset === 0) return 'Сегодня';
      if (this.offset === -1) return 'Вчера';
      return d.getDate() + ' ' + MONTHS[d.getMonth()].toLowerCase();
    } else if (this.period === 'week') {
      if (this.offset === 0) return 'Эта неделя';
      if (this.offset === -1) return 'Прошлая неделя';
      const { start, end } = this.getRange();
      return start.getDate() + '–' + end.getDate() + ' ' + MONTHS[end.getMonth()].toLowerCase();
    } else {
      const d = new Date(now.getFullYear(), now.getMonth() + this.offset, 1);
      return MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    }
  },

  /** Show a specific day (from calendar click) */
  showDay(dateKey) {
    const parts = dateKey.split('-');
    const target = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);

    this.period = 'day';
    this.offset = diff;
    // Activate the day tab
    document.querySelectorAll('.notes__period-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.period === 'day');
    });
    this.render();
  },

  /** Generate summary HTML for a set of entries */
  renderSummaryHTML(entries) {
    const visible = entries.filter(e => !e.hidden);
    if (visible.length === 0) {
      return '<div class="history__empty">Нет записей</div>';
    }

    const scores = visible.filter(e => e.score).map(e => e.score);
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
    const best = scores.length > 0 ? Math.max(...scores) : '—';
    const worst = scores.length > 0 ? Math.min(...scores) : '—';

    const emotionCounts = {};
    visible.forEach(e => {
      if (e.emotion) {
        const key = (e.emotionEmoji || '') + ' ' + e.emotion;
        emotionCounts[key] = (emotionCounts[key] || 0) + 1;
      }
    });
    const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

    let html = '<div class="history__stats">';
    html += '<div class="history__stat"><span class="history__stat-val history__stat-val--accent">' + avg + '</span><span class="history__stat-label">Среднее</span></div>';
    html += '<div class="history__stat"><span class="history__stat-val history__stat-val--green">' + best + '</span><span class="history__stat-label">Лучший</span></div>';
    html += '<div class="history__stat"><span class="history__stat-val history__stat-val--red">' + worst + '</span><span class="history__stat-label">Худший</span></div>';
    html += '</div>';

    if (topEmotions.length > 0) {
      html += '<div class="history__top-emotions">';
      topEmotions.forEach(([name, count]) => {
        html += '<span class="chip">' + name + ' × ' + count + '</span>';
      });
      html += '</div>';
    }
    return html;
  },

  render() {
    const entries = this.getEntries();

    // Nav label
    document.getElementById('notesNavLabel').textContent = this.getNavLabel();

    // Disable next if at current
    document.getElementById('notesNext').style.opacity = this.offset >= 0 ? '0.3' : '1';

    // Summary
    document.getElementById('notesSummary').innerHTML = this.renderSummaryHTML(entries);

    // Entry list
    const el = document.getElementById('notesEntries');
    if (entries.length === 0) { el.innerHTML = ''; return; }

    let html = '';
    entries.forEach(e => {
      const hiddenCls = e.hidden ? ' entry-card--hidden' : '';
      const tags = [];
      if (e.context) {
        // Собираем теги из всех групп динамически
        var groups = (this.state.custom && this.state.custom.tagGroups) || [];
        groups.forEach(function(g) { (e.context[g.id] || []).forEach(function(t) { tags.push(t); }); });
        // Обратная совместимость: стандартные ключи если нет tagGroups
        if (groups.length === 0) {
          (e.context.places || []).forEach(t => tags.push(t));
          (e.context.activities || []).forEach(t => tags.push(t));
          (e.context.people || []).forEach(t => tags.push(t));
          (e.context.body || []).forEach(t => tags.push(t));
        }
        if (e.context.weather) tags.push(e.context.weather);
      }

      html += '<div class="entry-card' + hiddenCls + '" data-id="' + e.id + '">';
      html += '<div class="entry-card__header">';
      html += '<div class="entry-card__emotion">';
      html += '<span class="entry-card__emoji">' + (e.emotionEmoji || '📝') + '</span>';
      html += '<span class="entry-card__name">' + (e.emotion || 'Запись') + '</span>';
      html += '</div>';
      html += '<span class="entry-card__score">' + (e.score || '') + '</span>';
      html += '</div>';
      html += '<div class="entry-card__time">' + this.formatWeekday(e.ts) + ', ' + this.formatTime(e.ts) + '</div>';
      if (e.text) html += '<div class="entry-card__text">' + this.escapeHtml(e.text) + '</div>';
      if (tags.length > 0) {
        html += '<div class="entry-card__tags">';
        tags.forEach(t => { html += '<span class="entry-card__tag">' + t + '</span>'; });
        html += '</div>';
      }
      html += '</div>';
    });

    el.innerHTML = html;

    el.querySelectorAll('.entry-card').forEach(card => {
      card.addEventListener('click', () => this.openEditModal(parseInt(card.dataset.id)));
    });
  },

  formatTime(ts) {
    const d = new Date(ts);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  },

  formatWeekday(ts) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[new Date(ts).getDay()];
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /** Edit modal */
  openEditModal(id) {
    const entry = this.state.entries.find(e => e.id === id);
    if (!entry) return;
    this.editingEntry = entry;

    document.getElementById('editEmotion').textContent = (entry.emotionEmoji || '') + ' ' + (entry.emotion || 'Запись');
    document.getElementById('editScore').value = entry.score || 5;
    document.getElementById('editScoreValue').textContent = entry.score || 5;
    document.getElementById('editText').value = entry.text || '';
    document.getElementById('editHide').textContent = entry.hidden ? 'Показать запись' : 'Скрыть запись';
    document.getElementById('editModal').classList.add('active');
  },

  closeModal() {
    document.getElementById('editModal').classList.remove('active');
    this.editingEntry = null;
  },

  saveEdit() {
    if (!this.editingEntry) return;
    this.editingEntry.score = parseInt(document.getElementById('editScore').value);
    this.editingEntry.text = document.getElementById('editText').value;
    App.save();
    this.closeModal();
    this.render();
  },

  hideEntry() {
    if (!this.editingEntry) return;
    this.editingEntry.hidden = !this.editingEntry.hidden;
    App.save();
    this.closeModal();
    this.render();
  }
};
