/* ===== morning.js — Утренний дневник ===== */

const MorningDiary = {
  state: null,
  currentDateKey: null,

  init(state) {
    this.state = state;
    const back = document.getElementById('morningBack');
    const save = document.getElementById('morningSave');
    const hintToggle = document.getElementById('morningHintToggle');
    if (back) back.addEventListener('click', () => this.close());
    if (save) save.addEventListener('click', () => this.save());
    if (hintToggle) hintToggle.addEventListener('click', () => this.toggleHint());
  },

  open(dateKey) {
    this.currentDateKey = dateKey || Streak.dateKey(Date.now());
    this.render(this.currentDateKey);
    const overlay = document.getElementById('morningOverlay');
    if (overlay) overlay.classList.add('active');
  },

  close() {
    const overlay = document.getElementById('morningOverlay');
    if (overlay) overlay.classList.remove('active');
  },

  toggleHint() {
    const body = document.getElementById('morningHintBody');
    const arrow = document.getElementById('morningHintArrow');
    if (!body) return;
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    if (arrow) arrow.textContent = open ? '▼' : '▲';
  },

  render(dateKey) {
    const existing = (this.state.morningDiaries || {})[dateKey] || {};
    const titleEl = document.getElementById('morningDateTitle');
    if (titleEl) {
      const parts = dateKey.split('-');
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      titleEl.textContent = 'Утро — ' + parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1];
    }
    const fields = ['priorities', 'feelings', 'attitude', 'improve', 'gratitude'];
    fields.forEach(f => {
      const el = document.getElementById('morning_' + f);
      if (el) el.value = existing[f] || '';
    });
  },

  save() {
    const fields = ['priorities', 'feelings', 'attitude', 'improve', 'gratitude'];
    const entry = { date: this.currentDateKey, ts: Date.now() };
    fields.forEach(f => {
      const el = document.getElementById('morning_' + f);
      entry[f] = el ? el.value.trim() : '';
    });
    if (!this.state.morningDiaries) this.state.morningDiaries = {};
    this.state.morningDiaries[this.currentDateKey] = entry;
    App.save();
    this.close();
    if (typeof HomeScreen !== 'undefined') HomeScreen.render();
  }
};
