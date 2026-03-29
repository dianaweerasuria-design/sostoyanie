/* ===== evening.js — Вечерний дневник ===== */

const EveningDiary = {
  state: null,
  currentDateKey: null,

  init(state) {
    this.state = state;
    const back = document.getElementById('eveningBack');
    const save = document.getElementById('eveningSave');
    if (back) back.addEventListener('click', () => this.close());
    if (save) save.addEventListener('click', () => this.save());

    // Hint toggles
    const hint1Toggle = document.getElementById('eveningHint1Toggle');
    const hint2Toggle = document.getElementById('eveningHint2Toggle');
    if (hint1Toggle) hint1Toggle.addEventListener('click', () => this.toggleHint(1));
    if (hint2Toggle) hint2Toggle.addEventListener('click', () => this.toggleHint(2));

    // Score slider
    const slider = document.getElementById('evening_score');
    const val = document.getElementById('eveningScoreValue');
    if (slider && val) {
      slider.addEventListener('input', () => {
        val.textContent = slider.value;
        this.updateScoreColor(parseInt(slider.value));
      });
    }
  },

  open(dateKey) {
    this.currentDateKey = dateKey || Streak.dateKey(Date.now());
    this.render(this.currentDateKey);
    const overlay = document.getElementById('eveningOverlay');
    if (overlay) overlay.classList.add('active');
  },

  close() {
    const overlay = document.getElementById('eveningOverlay');
    if (overlay) overlay.classList.remove('active');
  },

  toggleHint(n) {
    const body = document.getElementById('eveningHint' + n + 'Body');
    const arrow = document.getElementById('eveningHint' + n + 'Arrow');
    if (!body) return;
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    if (arrow) arrow.textContent = open ? '▼' : '▲';
  },

  updateScoreColor(score) {
    const scoreEl = document.getElementById('eveningScoreValue');
    if (!scoreEl) return;
    if (score <= 3) scoreEl.style.color = 'var(--red, #C0634A)';
    else if (score <= 6) scoreEl.style.color = 'var(--gold)';
    else if (score <= 8) scoreEl.style.color = 'var(--accent3)';
    else scoreEl.style.color = 'var(--blue)';
  },

  render(dateKey) {
    const existing = (this.state.eveningDiaries || {})[dateKey] || {};
    const titleEl = document.getElementById('eveningDateTitle');
    if (titleEl) {
      const parts = dateKey.split('-');
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      titleEl.textContent = 'Вечер — ' + parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1];
    }
    const textFields = ['good', 'difficulties', 'improve', 'gratitude', 'tomorrow'];
    textFields.forEach(f => {
      const el = document.getElementById('evening_' + f);
      if (el) el.value = existing[f] || '';
    });
    const slider = document.getElementById('evening_score');
    const val = document.getElementById('eveningScoreValue');
    const score = existing.score || 5;
    if (slider) slider.value = score;
    if (val) val.textContent = score;
    this.updateScoreColor(score);
  },

  save() {
    const textFields = ['good', 'difficulties', 'improve', 'gratitude', 'tomorrow'];
    const entry = { date: this.currentDateKey, ts: Date.now() };
    textFields.forEach(f => {
      const el = document.getElementById('evening_' + f);
      entry[f] = el ? el.value.trim() : '';
    });
    const slider = document.getElementById('evening_score');
    entry.score = slider ? parseInt(slider.value) : 5;
    if (!this.state.eveningDiaries) this.state.eveningDiaries = {};
    this.state.eveningDiaries[this.currentDateKey] = entry;
    App.save();
    this.close();
    if (typeof HomeScreen !== 'undefined') HomeScreen.render();
  }
};
