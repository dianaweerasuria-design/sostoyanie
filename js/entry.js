/* ===== entry.js — Multi-step flow записи ===== */

const Entry = {
  state: null,
  step: 1,
  selected: {
    date: null,
    emotion: null,
    emotionEmoji: null,
    intensity: 5,
    sleepHours: null,
    weather: null,
    tags: {},    // { groupId: [selectedItems] }
    text: ''
  },

  init(state) {
    this.state = state;
    this.bindFlowEvents();
  },

  /** Open the flow */
  openFlow() {
    this.resetSelected();
    this.step = 1;
    this.renderStep1();
    this.renderStep2();
    this.updateFlowUI();
    document.getElementById('flowOverlay').classList.add('active');
  },

  closeFlow() {
    document.getElementById('flowOverlay').classList.remove('active');
  },

  /** Check if anything is filled */
  hasData() {
    if (this.selected.emotion || this.selected.weather ||
        this.selected.sleepHours != null ||
        (this.selected.text && this.selected.text.trim())) return true;
    // Check any tag group
    const tags = this.selected.tags;
    for (var k in tags) {
      if (tags[k] && tags[k].length > 0) return true;
    }
    return false;
  },

  tryClose() {
    if (this.hasData()) {
      if (confirm('Отменить запись?')) this.closeFlow();
    } else {
      this.closeFlow();
    }
  },

  resetSelected() {
    this.selected = {
      date: new Date(),
      emotion: null,
      emotionEmoji: null,
      intensity: 5,
      sleepHours: null,
      weather: null,
      tags: {},
      text: ''
    };
  },

  updateFlowUI() {
    for (var i = 1; i <= 3; i++) {
      var el = document.getElementById('flowStep' + i);
      if (el) el.classList.toggle('active', i === this.step);
    }
    document.getElementById('flowStepResult').style.display = 'none';

    document.querySelectorAll('.flow__dot').forEach(function(dot) {
      var s = parseInt(dot.dataset.step);
      dot.classList.toggle('active', s === this.step);
      dot.classList.toggle('done', s < this.step);
    }.bind(this));

    document.getElementById('flowStepLabel').textContent = this.step + ' / 3';

    var backBtn = document.getElementById('flowBack');
    backBtn.style.visibility = this.step > 1 ? 'visible' : 'hidden';

    var nextBtn = document.getElementById('flowNext');
    if (this.step === 3) {
      nextBtn.textContent = 'Сохранить';
      nextBtn.disabled = !this.hasData();
    } else {
      nextBtn.textContent = 'Далее →';
      nextBtn.disabled = false;
    }

    document.querySelector('.flow__nav').style.display = 'flex';
    this.updateDateDisplay();
  },

  showResultScreen(entry, reward) {
    for (var i = 1; i <= 3; i++) {
      var el = document.getElementById('flowStep' + i);
      if (el) el.classList.remove('active');
    }
    var result = document.getElementById('flowStepResult');
    result.style.display = 'block';
    result.classList.add('active');

    document.getElementById('flowResultEmoji').textContent = entry.emotionEmoji || '📝';
    document.getElementById('flowResultEmotion').textContent = entry.emotion || 'Запись сохранена';

    // Gather tags from all groups for display
    var tagList = [];
    var ctx = entry.context || {};
    var groups = this.state.custom.tagGroups || [];
    groups.forEach(function(g) {
      (ctx[g.id] || []).forEach(function(t) { tagList.push(t); });
    });
    if (ctx.weather) tagList.push(ctx.weather);
    document.getElementById('flowResultTags').textContent = tagList.length > 0 ? tagList.join(' · ') : '';
    document.getElementById('flowResultCrystals').textContent = '+' + reward + ' 💎';

    document.getElementById('flowBack').style.visibility = 'hidden';
    var nextBtn = document.getElementById('flowNext');
    nextBtn.textContent = 'Готово';
    nextBtn.disabled = false;

    document.querySelectorAll('.flow__dot').forEach(function(dot) { dot.classList.add('done'); });
    document.getElementById('flowStepLabel').textContent = '✓';
  },

  bindFlowEvents() {
    var self = this;

    var addBtn = document.getElementById('addEntryBtn');
    if (addBtn) addBtn.addEventListener('click', function() { self.openFlow(); });

    document.getElementById('flowClose').addEventListener('click', function() { self.tryClose(); });

    document.getElementById('flowBack').addEventListener('click', function() {
      if (self.step > 1) { self.step--; self.updateFlowUI(); }
    });

    document.getElementById('flowNext').addEventListener('click', function() {
      if (document.getElementById('flowStepResult').style.display !== 'none' &&
          document.getElementById('flowStepResult').classList.contains('active')) {
        self.closeFlow();
        App.save();
        return;
      }
      if (self.step < 3) {
        self.step++;
        self.updateFlowUI();
      } else {
        self.save();
      }
    });

    var dateInput = document.getElementById('flowDateInput');
    var dateBtn = document.getElementById('flowDateBtn');
    if (dateInput) {
      dateInput.addEventListener('change', function() {
        if (dateInput.value) {
          var parts = dateInput.value.split('-');
          self.selected.date = new Date(+parts[0], +parts[1] - 1, +parts[2], 12, 0, 0);
          self.updateDateDisplay();
        }
      });
      // Клик по кнопке программно открывает date picker
      if (dateBtn) {
        dateBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (dateInput.showPicker) {
            try { dateInput.showPicker(); } catch(err) {}
          } else {
            // Фоллбек для браузеров без showPicker
            dateInput.style.pointerEvents = 'auto';
            dateInput.style.opacity = '1';
            dateInput.style.width = 'auto';
            dateInput.style.height = 'auto';
            dateInput.style.position = 'static';
            dateInput.focus();
            dateInput.click();
          }
        });
      }
    }

    var intensityRange = document.getElementById('flowIntensityRange');
    var intensityVal = document.getElementById('flowIntensityValue');
    if (intensityRange) {
      intensityRange.addEventListener('input', function() {
        self.selected.intensity = parseInt(intensityRange.value);
        intensityVal.textContent = intensityRange.value;
      });
    }

    var sleepRange = document.getElementById('flowSleepRange');
    var sleepVal = document.getElementById('flowSleepVal');
    if (sleepRange) {
      sleepRange.addEventListener('input', function() {
        var v = parseInt(sleepRange.value);
        if (v < 0) {
          self.selected.sleepHours = null;
          sleepVal.textContent = '—';
        } else {
          var hours = v / 2;
          self.selected.sleepHours = hours;
          sleepVal.textContent = hours % 1 === 0 ? hours : hours.toFixed(1);
        }
      });
    }

    var textEl = document.getElementById('flowText');
    if (textEl) {
      textEl.addEventListener('input', function() {
        self.selected.text = textEl.value;
        var clearBtn = document.getElementById('flowClearText');
        if (clearBtn) clearBtn.style.display = textEl.value ? 'inline-flex' : 'none';
        if (self.step === 3) {
          document.getElementById('flowNext').disabled = !self.hasData();
        }
      });
    }

    var clearBtn = document.getElementById('flowClearText');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        document.getElementById('flowText').value = '';
        self.selected.text = '';
        clearBtn.style.display = 'none';
        if (self.step === 3) {
          document.getElementById('flowNext').disabled = !self.hasData();
        }
      });
    }

    var resetTags = document.getElementById('flowResetTags');
    if (resetTags) {
      resetTags.addEventListener('click', function() {
        self.selected.tags = {};
        document.querySelectorAll('#flowTagGroups .chip.selected').forEach(function(c) { c.classList.remove('selected'); });
      });
    }
  },

  renderStep1() {
    var self = this;
    var grid = document.getElementById('flowEmotionGrid');
    if (!grid) return;
    var emotions = this.state.custom.emotions;
    grid.innerHTML = emotions.map(function(e) {
      return '<button class="chip chip--emotion" data-emotion="' + e.name + '" data-emoji="' + e.emoji + '">' +
        '<span class="chip__emoji">' + e.emoji + '</span>' +
        '<span class="chip__label">' + e.name + '</span>' +
      '</button>';
    }).join('');

    grid.onclick = function(ev) {
      var btn = ev.target.closest('.chip--emotion');
      if (!btn) return;
      grid.querySelectorAll('.chip--emotion').forEach(function(c) { c.classList.remove('selected'); });
      btn.classList.add('selected');
      self.selected.emotion = btn.dataset.emotion;
      self.selected.emotionEmoji = btn.dataset.emoji;
      document.getElementById('flowIntensityBlock').style.display = 'block';
    };

    var weatherEl = document.getElementById('flowWeatherChips');
    if (weatherEl) {
      weatherEl.innerHTML = WEATHER_OPTIONS.map(function(w) {
        return '<button class="chip chip--weather" data-value="' + w + '">' + w + '</button>';
      }).join('');
      weatherEl.onclick = function(ev) {
        var btn = ev.target.closest('.chip--weather');
        if (!btn) return;
        var wasSelected = btn.classList.contains('selected');
        weatherEl.querySelectorAll('.chip--weather').forEach(function(c) { c.classList.remove('selected'); });
        if (!wasSelected) { btn.classList.add('selected'); self.selected.weather = btn.dataset.value; }
        else { self.selected.weather = null; }
      };
    }

    document.getElementById('flowIntensityBlock').style.display = 'none';
    document.getElementById('flowIntensityRange').value = 5;
    document.getElementById('flowIntensityValue').textContent = '5';
    document.getElementById('flowSleepRange').value = -1;
    document.getElementById('flowSleepVal').textContent = '—';
    document.getElementById('flowText').value = '';
    document.getElementById('flowClearText').style.display = 'none';

    this.updateDateDisplay();
  },

  /** Render Step 2 — dynamic tag groups */
  renderStep2() {
    var self = this;
    var container = document.getElementById('flowTagGroups');
    if (!container) return;

    var groups = this.state.custom.tagGroups || [];
    var html = '';

    groups.forEach(function(group) {
      var colId = 'flowCtx_' + group.id;
      html += '<div class="collapsible open" id="' + colId + '">';
      html += '<div class="collapsible__header" data-toggle="' + colId + '">';
      html += '<h3>' + group.icon + ' ' + group.name + '</h3>';
      html += '<span class="collapsible__arrow">▼</span>';
      html += '</div>';
      html += '<div class="collapsible__body">';
      html += '<div class="chip-group" data-group-id="' + group.id + '">';
      group.items.forEach(function(item) {
        html += '<button class="chip" data-value="' + item + '">' + item + '</button>';
      });
      html += '</div></div></div>';
    });

    container.innerHTML = html;

    // Bind collapsible toggles
    container.querySelectorAll('.collapsible__header').forEach(function(header) {
      header.addEventListener('click', function() {
        var el = document.getElementById(header.dataset.toggle);
        if (el) el.classList.toggle('open');
      });
    });

    // Bind chip clicks
    container.querySelectorAll('.chip-group').forEach(function(chipGroup) {
      var gid = chipGroup.dataset.groupId;
      chipGroup.addEventListener('click', function(ev) {
        var btn = ev.target.closest('.chip');
        if (!btn) return;
        var val = btn.dataset.value;
        btn.classList.toggle('selected');
        if (!self.selected.tags[gid]) self.selected.tags[gid] = [];
        var idx = self.selected.tags[gid].indexOf(val);
        if (idx >= 0) { self.selected.tags[gid].splice(idx, 1); }
        else { self.selected.tags[gid].push(val); }
      });
    });
  },

  updateDateDisplay() {
    var d = this.selected.date || new Date();
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    var MONTHS = Calendar.MONTHS;
    var dateStr = d.getDate() + ' ' + MONTHS[d.getMonth()].toLowerCase();
    var prefix = '';

    if (d.toDateString() === today.toDateString()) {
      prefix = 'Сегодня, ';
    } else if (d.toDateString() === yesterday.toDateString()) {
      prefix = 'Вчера, ';
    }

    var btn = document.getElementById('flowDateBtn');
    if (btn) {
      btn.innerHTML = prefix + '<span id="flowDateText">' + dateStr + '</span>';
    }

    var inp = document.getElementById('flowDateInput');
    if (inp) {
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      inp.value = y + '-' + m + '-' + dd;
    }
  },

  /** Save entry */
  save() {
    this.selected.text = (document.getElementById('flowText') || {}).value || '';

    var d = this.selected.date || new Date();
    var now = new Date();
    d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    var ts = d.getTime();

    var context = {
      sleepBed: null,
      sleepWake: null,
      sleepHours: this.selected.sleepHours,
      sleepQuality: null,
      weather: this.selected.weather
    };

    // Store tags by group id in context (backward-compatible)
    var groups = this.state.custom.tagGroups || [];
    var tags = this.selected.tags;
    groups.forEach(function(g) {
      context[g.id] = tags[g.id] ? [].concat(tags[g.id]) : [];
    });

    var entry = {
      id: ts,
      ts: ts,
      emotion: this.selected.emotion || null,
      emotionEmoji: this.selected.emotionEmoji || null,
      intensity: this.selected.intensity || 5,
      score: this.selected.intensity || 5,
      text: (this.selected.text || '').trim(),
      context: context
    };

    var reward = this.calculateReward(entry);

    this.state.entries.push(entry);
    this.state.crystals += reward;
    this.state.totalCrystals += reward;
    App.save();
    History.render();

    this.showResultScreen(entry, reward);
  },

  calculateReward(entry) {
    var reward = 0;
    if (entry.emotion) reward += 3;
    if (entry.text && entry.text.length > 10) reward += 3;
    var ctx = entry.context;
    var hasContext = ctx.weather || ctx.sleepHours != null;
    if (!hasContext) {
      var groups = this.state.custom.tagGroups || [];
      for (var i = 0; i < groups.length; i++) {
        if (ctx[groups[i].id] && ctx[groups[i].id].length > 0) { hasContext = true; break; }
      }
    }
    if (hasContext) reward += 2;
    if ((this.state.streak || 0) >= 7) reward = Math.ceil(reward * 1.5);
    return reward;
  },

  toggleSection(id) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('open');
  }
};
