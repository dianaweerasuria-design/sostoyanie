/* ===== settings.js — Настройки, редакторы эмоций/тегов, данные ===== */

const Settings = {
  state: null,

  init(state) {
    this.state = state;
    this.bindEvents();
  },

  bindEvents() {
    var self = this;

    // Emotion add
    document.getElementById('settingsEmotionAdd').addEventListener('click', function() { self.addEmotion(); });
    document.getElementById('settingsEmotionReset').addEventListener('click', function() { self.resetEmotions(); });

    // Partner
    document.getElementById('partnerCopyCode').addEventListener('click', function() { self.copyMyCode(); });
    document.getElementById('partnerConnect').addEventListener('click', function() { self.connectPartner(); });

    // Data
    document.getElementById('settingsExport').addEventListener('click', function() { Storage.exportData(self.state); });
    document.getElementById('settingsImport').addEventListener('change', function(e) { self.importData(e); });
    document.getElementById('settingsReset').addEventListener('click', function() { self.resetAllData(); });

    // Add group button
    document.getElementById('settingsAddGroup').addEventListener('click', function() { self.addGroup(); });

    // Reset tags
    document.getElementById('settingsTagReset').addEventListener('click', function() { self.resetTags(); });

    // Render on open
    document.getElementById('settingsBtn').addEventListener('click', function() { self.render(); });
  },

  render() {
    this.renderEmotions();
    this.renderTagGroups();
    this.renderPartner();
  },

  // === Emotions ===

  renderEmotions() {
    var self = this;
    var el = document.getElementById('settingsEmotionList');
    if (!el) return;
    var emotions = this.state.custom.emotions;

    var html = '';
    emotions.forEach(function(e, i) {
      html += '<div class="settings-list__item">';
      html += '<span class="settings-list__emoji">' + e.emoji + '</span>';
      html += '<span class="settings-list__name">' + e.name + '</span>';
      html += '<button class="settings-list__del" data-idx="' + i + '">✕</button>';
      html += '</div>';
    });
    el.innerHTML = html;

    el.querySelectorAll('.settings-list__del').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.dataset.idx);
        self.state.custom.emotions.splice(idx, 1);
        App.save();
        self.renderEmotions();
      });
    });
  },

  addEmotion() {
    var emojiEl = document.getElementById('settingsEmotionEmoji');
    var nameEl = document.getElementById('settingsEmotionName');
    var emoji = emojiEl.value.trim();
    var name = nameEl.value.trim();
    if (!name) return;

    this.state.custom.emotions.push({ name: name, emoji: emoji || '📝' });
    App.save();
    emojiEl.value = '';
    nameEl.value = '';
    this.renderEmotions();
  },

  resetEmotions() {
    if (!confirm('Сбросить эмоции по умолчанию?')) return;
    this.state.custom.emotions = JSON.parse(JSON.stringify(DEFAULT_EMOTIONS));
    App.save();
    this.renderEmotions();
  },

  // === Dynamic Tag Groups ===

  renderTagGroups() {
    var self = this;
    var container = document.getElementById('settingsTagGroupsList');
    if (!container) return;

    var groups = this.state.custom.tagGroups || [];
    var html = '';

    groups.forEach(function(group, gi) {
      html += '<div class="settings-group" data-gidx="' + gi + '">';
      html += '<div class="settings-group__header">';
      html += '<div class="settings-group__name-row">';
      html += '<input type="text" class="settings-group__icon-input" value="' + group.icon + '" data-gidx="' + gi + '" data-field="icon" maxlength="4">';
      html += '<input type="text" class="settings-group__name-input" value="' + self.escapeAttr(group.name) + '" data-gidx="' + gi + '" data-field="name">';
      html += '<button class="settings-group__del" data-gidx="' + gi + '" title="Удалить группу">🗑</button>';
      html += '</div>';
      html += '</div>';

      // Tags inside group
      html += '<div class="settings-tags">';
      group.items.forEach(function(item, ti) {
        html += '<span class="settings-tag">';
        html += item;
        html += '<button class="settings-tag__del" data-gidx="' + gi + '" data-tidx="' + ti + '">✕</button>';
        html += '</span>';
      });
      html += '</div>';

      // Add tag input
      html += '<div class="settings-tag-add">';
      html += '<input type="text" class="settings-group__tag-input" placeholder="Новый тег" data-gidx="' + gi + '">';
      html += '<button class="btn btn--primary btn--sm settings-group__tag-add-btn" data-gidx="' + gi + '">+</button>';
      html += '</div>';

      html += '</div>';
    });

    container.innerHTML = html;

    // Bind events

    // Name/icon edit
    container.querySelectorAll('.settings-group__name-input, .settings-group__icon-input').forEach(function(input) {
      input.addEventListener('change', function() {
        var gi = parseInt(input.dataset.gidx);
        var field = input.dataset.field;
        self.state.custom.tagGroups[gi][field] = input.value.trim() || self.state.custom.tagGroups[gi][field];
        App.save();
      });
    });

    // Delete group
    container.querySelectorAll('.settings-group__del').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var gi = parseInt(btn.dataset.gidx);
        var gName = self.state.custom.tagGroups[gi].name;
        if (!confirm('Удалить группу «' + gName + '»?')) return;
        self.state.custom.tagGroups.splice(gi, 1);
        App.save();
        self.renderTagGroups();
      });
    });

    // Delete tag
    container.querySelectorAll('.settings-tag__del').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var gi = parseInt(btn.dataset.gidx);
        var ti = parseInt(btn.dataset.tidx);
        self.state.custom.tagGroups[gi].items.splice(ti, 1);
        App.save();
        self.renderTagGroups();
      });
    });

    // Add tag
    container.querySelectorAll('.settings-group__tag-add-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var gi = parseInt(btn.dataset.gidx);
        var input = container.querySelector('.settings-group__tag-input[data-gidx="' + gi + '"]');
        var val = input.value.trim();
        if (!val) return;
        if (self.state.custom.tagGroups[gi].items.indexOf(val) >= 0) return;
        self.state.custom.tagGroups[gi].items.push(val);
        App.save();
        input.value = '';
        self.renderTagGroups();
      });
    });

    // Enter key for add tag
    container.querySelectorAll('.settings-group__tag-input').forEach(function(input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var gi = parseInt(input.dataset.gidx);
          container.querySelector('.settings-group__tag-add-btn[data-gidx="' + gi + '"]').click();
        }
      });
    });
  },

  addGroup() {
    var id = 'group_' + Date.now();
    this.state.custom.tagGroups.push({
      id: id,
      name: 'Новая группа',
      icon: '📌',
      items: []
    });
    App.save();
    this.renderTagGroups();
  },

  resetTags() {
    if (!confirm('Сбросить все группы тегов по умолчанию?')) return;
    this.state.custom.tagGroups = JSON.parse(JSON.stringify(DEFAULT_TAG_GROUPS));
    App.save();
    this.renderTagGroups();
  },

  escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  },

  // === Partner ===

  renderPartner() {
    var codeEl = document.getElementById('partnerMyCode');
    if (codeEl) codeEl.textContent = this.state.myCode || '—';

    var self = this;
    var statusEl = document.getElementById('partnerStatus');
    if (statusEl) {
      if (this.state.partnerCode) {
        statusEl.innerHTML = '<span class="text-success">Связан с: ' + this.state.partnerCode + '</span>' +
          ' <button class="btn btn--secondary btn--sm" id="partnerDisconnect">Отвязать</button>';
        var disc = document.getElementById('partnerDisconnect');
        if (disc) disc.addEventListener('click', function() { self.disconnectPartner(); });
      } else {
        statusEl.textContent = 'Партнёр не подключён';
      }
    }
  },

  copyMyCode() {
    var code = this.state.myCode;
    if (!code) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    var btn = document.getElementById('partnerCopyCode');
    btn.textContent = 'Скопировано!';
    setTimeout(function() { btn.textContent = 'Копировать'; }, 1500);
  },

  connectPartner() {
    var input = document.getElementById('partnerCodeInput');
    var code = input.value.trim().toUpperCase();
    if (!code || code.length !== 6) {
      alert('Введите 6-символьный код партнёра');
      return;
    }
    if (code === this.state.myCode) {
      alert('Нельзя подключить свой собственный код');
      return;
    }
    this.state.partnerCode = code;
    App.save();
    input.value = '';
    this.renderPartner();
  },

  disconnectPartner() {
    if (!confirm('Отвязать партнёра?')) return;
    this.state.partnerCode = null;
    this.state.partnerData = null;
    App.save();
    this.renderPartner();
  },

  // === Data ===

  importData(e) {
    var self = this;
    var file = e.target.files[0];
    if (!file) return;

    Storage.importData(file).then(function(data) {
      if (confirm('Импортировать данные? Текущие данные будут заменены.')) {
        Object.assign(self.state, data);
        App.save();
        alert('Данные импортированы! Страница будет перезагружена.');
        location.reload();
      }
    }).catch(function(err) {
      alert('Ошибка: ' + err.message);
    });

    e.target.value = '';
  },

  resetAllData() {
    if (!confirm('Удалить ВСЕ данные? Это действие нельзя отменить!')) return;
    if (!confirm('Вы уверены? Все записи, достижения и настройки будут удалены.')) return;

    var fresh = Storage.reset();
    Object.keys(this.state).forEach(function(k) { delete this.state[k]; }.bind(this));
    Object.assign(this.state, fresh);
    this.state.myCode = Partner.generateCode();
    App.save();
    alert('Данные сброшены. Страница будет перезагружена.');
    location.reload();
  }
};
