/* ===== app.js — Инициализация, навигация, утилиты ===== */

const App = {
  state: null,

  init() {
    this.state = Storage.load();

    if (!this.state.myCode) {
      this.state.myCode = Partner.generateCode();
      Storage.save(this.state);
    }

    this.initNavigation();
    this.initSettings();
    this.updateHeader();
    this.startClock();

    // Migrate state: add new fields if missing
    if (!this.state.morningDiaries) this.state.morningDiaries = {};
    if (!this.state.eveningDiaries) this.state.eveningDiaries = {};
    if (!this.state.situations) this.state.situations = [];
    if (this.state.userName === undefined) this.state.userName = '';

    // Init modules
    Entry.init(this.state);
    Analytics.init(this.state);
    Streak.init(this.state);
    Calendar.init(this.state);
    History.init(this.state);
    Achieve.init(this.state);
    Partner.init(this.state);
    Settings.init(this.state);
    MorningDiary.init(this.state);
    EveningDiary.init(this.state);
    Situation.init(this.state);
    HomeScreen.init(this.state);

    this.initFAB();
    this.initHomeSituationBtn();
    this.renderHomeWeekStats();
  },

  /** Tab navigation */
  initNavigation() {
    const buttons = document.querySelectorAll('.tab-bar__btn');
    const panels = document.querySelectorAll('.tab-panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        if (!tabId) return;

        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const panel = document.getElementById(tabId);
        if (panel) panel.classList.add('active');

        window.scrollTo(0, 0);

        // Refresh when switching tabs
        if (tabId === 'tabNotes') History.render();
        if (tabId === 'tabAnalytics') Analytics.render();
        if (tabId === 'tabAchievements') Achieve.render();
      });
    });
  },

  /** Settings overlay */
  initSettings() {
    const btn = document.getElementById('settingsBtn');
    const overlay = document.getElementById('settingsOverlay');
    const back = document.getElementById('settingsBack');

    if (btn) btn.addEventListener('click', () => overlay.classList.add('active'));
    if (back) back.addEventListener('click', () => overlay.classList.remove('active'));
  },

  updateHeader() {
    const crystalsEl = document.getElementById('headerCrystals');
    if (crystalsEl) crystalsEl.textContent = '💎 ' + (this.state.crystals || 0);
    // Greet by name
    const logoEl = document.getElementById('headerLogo');
    if (logoEl && this.state.userName) {
      logoEl.innerHTML = 'Привет, <span class="header__logo-accent">' + this.state.userName + '</span>!';
    } else if (logoEl) {
      logoEl.innerHTML = '<span class="header__logo-accent">С</span>остояние';
    }
  },

  /** FAB bottom sheet */
  initFAB() {
    const addBtn = document.getElementById('addEntryBtn');
    const sheet = document.getElementById('fabBottomSheet');
    const backdrop = document.getElementById('bottomSheetBackdrop');

    const openSheet = () => {
      sheet.classList.add('active');
      backdrop.classList.add('active');
    };
    const closeSheet = () => {
      sheet.classList.remove('active');
      backdrop.classList.remove('active');
    };

    if (addBtn) addBtn.addEventListener('click', openSheet);
    if (backdrop) backdrop.addEventListener('click', closeSheet);

    const todayKey = () => Streak.dateKey(Date.now());

    const fabMood = document.getElementById('fabMoodEntry');
    const fabMorning = document.getElementById('fabMorning');
    const fabEvening = document.getElementById('fabEvening');
    const fabPositive = document.getElementById('fabPositive');
    const fabNegative = document.getElementById('fabNegative');

    if (fabMood) fabMood.addEventListener('click', () => { closeSheet(); Entry.openFlow(); });
    if (fabMorning) fabMorning.addEventListener('click', () => { closeSheet(); MorningDiary.open(todayKey()); });
    if (fabEvening) fabEvening.addEventListener('click', () => { closeSheet(); EveningDiary.open(todayKey()); });
    if (fabPositive) fabPositive.addEventListener('click', () => { closeSheet(); Situation.openPositive(todayKey()); });
    if (fabNegative) fabNegative.addEventListener('click', () => { closeSheet(); Situation.openNegative(todayKey()); });
  },

  initHomeSituationBtn() {
    const btn = document.getElementById('homeSituationBtn');
    if (btn) btn.addEventListener('click', () => {
      const dateKey = HomeScreen ? HomeScreen.dateKey(HomeScreen.selectedDate) : Streak.dateKey(Date.now());
      Situation.openChoice(dateKey);
    });
  },

  startClock() {
    const timeEl = document.getElementById('headerTime');
    const update = () => {
      const now = new Date();
      timeEl.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    };
    update();
    setInterval(update, 30000);
  },

  switchTab(tabId) {
    const btn = document.querySelector('.tab-bar__btn[data-tab="' + tabId + '"]');
    if (btn) btn.click();
  },

  /** Save state + refresh widgets */
  save() {
    Storage.save(this.state);
    this.updateHeader();
    Streak.calculateStreak();
    Streak.render();
    Calendar.render();
    Achieve.checkAll();
    Storage.save(this.state);
    this.renderHomeWeekStats();
    if (typeof HomeScreen !== 'undefined') HomeScreen.render();
  },

  /** Render week stats on home screen */
  renderHomeWeekStats() {
    const el = document.getElementById('homeWeekStatsContent');
    if (!el) return;

    // Get this week's entries
    const now = new Date();
    const day = now.getDay();
    const mondayOff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOff);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const entries = (this.state.entries || []).filter(e =>
      e.ts >= monday.getTime() && e.ts <= sunday.getTime()
    );

    el.innerHTML = History.renderSummaryHTML(entries);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function() {});
  }
});
