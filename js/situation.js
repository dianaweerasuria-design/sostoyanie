/* ===== situation.js — Позитивные и негативные ситуации ===== */

const Situation = {
  state: null,
  currentDateKey: null,

  // Positive flow state
  posData: { description: '', emotions: [] },
  posStep: 1,
  posActiveCat: 0,

  // Negative (CBT) flow state
  negData: { description: '', negativeThought: '', thoughtBelief: 50, emotions: [], distortions: [], reframe: '', reframeBelief: 50 },
  negStep: 1,
  negActiveCat: 0,

  init(state) {
    this.state = state;

    // Positive overlay events
    const posBack = document.getElementById('situationPosBack');
    if (posBack) posBack.addEventListener('click', () => this.closePosStep());

    // Negative overlay events
    const negBack = document.getElementById('situationNegBack');
    if (negBack) negBack.addEventListener('click', () => this.closeNegStep());

    // Choice overlay
    const choiceBack = document.getElementById('situationChoiceBack');
    if (choiceBack) choiceBack.addEventListener('click', () => this.closeChoice());
    const choicePos = document.getElementById('situationChoicePos');
    if (choicePos) choicePos.addEventListener('click', () => { this.closeChoice(); this.openPositive(this.currentDateKey); });
    const choiceNeg = document.getElementById('situationChoiceNeg');
    if (choiceNeg) choiceNeg.addEventListener('click', () => { this.closeChoice(); this.openNegative(this.currentDateKey); });
  },

  openChoice(dateKey) {
    this.currentDateKey = dateKey || Streak.dateKey(Date.now());
    const overlay = document.getElementById('situationChoiceOverlay');
    if (overlay) overlay.classList.add('active');
  },

  closeChoice() {
    const overlay = document.getElementById('situationChoiceOverlay');
    if (overlay) overlay.classList.remove('active');
  },

  // ===== POSITIVE FLOW =====

  openPositive(dateKey) {
    this.currentDateKey = dateKey || Streak.dateKey(Date.now());
    this.posData = { description: '', emotions: [] };
    this.posStep = 1;
    this.posActiveCat = 0;
    this.renderPos();
    const overlay = document.getElementById('situationPosOverlay');
    if (overlay) overlay.classList.add('active');
  },

  closePosStep() {
    if (this.posStep > 1) {
      this.posStep--;
      this.renderPos();
    } else {
      const overlay = document.getElementById('situationPosOverlay');
      if (overlay) overlay.classList.remove('active');
    }
  },

  renderPos() {
    const titleEl = document.getElementById('situationPosTitle');
    const bodyEl = document.getElementById('situationPosBody');
    if (!bodyEl) return;

    if (this.posStep === 1) {
      if (titleEl) titleEl.textContent = 'Позитивная ситуация';
      bodyEl.innerHTML = `
        <div class="diary-question">
          <label class="diary-label">Что произошло?</label>
          <textarea id="posDescription" class="diary-textarea" rows="5" placeholder="Опиши ситуацию подробно...">${this.posData.description}</textarea>
        </div>
        <button class="btn btn--primary btn--full mt-16" id="posStep1Next">Далее →</button>
      `;
      document.getElementById('posStep1Next').addEventListener('click', () => {
        const val = document.getElementById('posDescription').value.trim();
        if (!val) { alert('Пожалуйста, опиши ситуацию'); return; }
        this.posData.description = val;
        this.posStep = 2;
        this.renderPos();
      });

    } else if (this.posStep === 2) {
      if (titleEl) titleEl.textContent = 'Эмоции';
      const cats = EMOTION_CATEGORIES_POSITIVE;
      let catTabs = '<div class="emotion-cat-tabs">';
      cats.forEach((cat, i) => {
        const active = i === this.posActiveCat ? ' active' : '';
        catTabs += `<button class="emotion-cat-tab${active}" data-ci="${i}">${cat.icon} ${cat.name}</button>`;
      });
      catTabs += '</div>';

      const cat = cats[this.posActiveCat];
      let emotionsHtml = '<div class="emotion-chips">';
      cat.emotions.forEach(em => {
        const sel = this.posData.emotions.includes(em) ? ' selected' : '';
        emotionsHtml += `<button class="chip chip--sm${sel}" data-em="${em}">${em}</button>`;
      });
      emotionsHtml += '</div>';

      const selectedHtml = this.posData.emotions.length > 0
        ? '<div class="selected-emotions-row mt-12"><span class="text-muted">Выбрано: </span>' +
          this.posData.emotions.map(e => `<span class="chip chip--sm selected">${e}</span>`).join(' ') + '</div>'
        : '';

      bodyEl.innerHTML = catTabs + emotionsHtml + selectedHtml + `
        <button class="btn btn--primary btn--full mt-16" id="posStep2Next">Далее →</button>
      `;

      bodyEl.querySelectorAll('.emotion-cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          this.posActiveCat = parseInt(btn.dataset.ci);
          this.renderPos();
        });
      });

      bodyEl.querySelectorAll('.chip[data-em]').forEach(btn => {
        btn.addEventListener('click', () => {
          const em = btn.dataset.em;
          const idx = this.posData.emotions.indexOf(em);
          if (idx >= 0) {
            this.posData.emotions.splice(idx, 1);
          } else {
            if (this.posData.emotions.length >= 5) { alert('Максимум 5 эмоций'); return; }
            this.posData.emotions.push(em);
          }
          this.renderPos();
        });
      });

      document.getElementById('posStep2Next').addEventListener('click', () => {
        this.posStep = 3;
        this.renderPos();
      });

    } else if (this.posStep === 3) {
      if (titleEl) titleEl.textContent = 'Итог';
      const emotionChips = this.posData.emotions.map(e => `<span class="chip chip--sm selected">${e}</span>`).join(' ');
      bodyEl.innerHTML = `
        <div class="situation-summary-card">
          <div class="situation-summary__type positive">✨ Позитивная ситуация</div>
          <div class="situation-summary__desc">${this.escapeHtml(this.posData.description)}</div>
          <div class="situation-summary__emotions mt-12">
            <span class="text-muted">Эмоции:</span>
            <div class="mt-8">${emotionChips || '<span class="text-muted">Не выбраны</span>'}</div>
          </div>
        </div>
        <button class="btn btn--primary btn--full mt-16" id="posSave">💚 Сохранить</button>
      `;
      document.getElementById('posSave').addEventListener('click', () => this.savePositive());
    }
  },

  savePositive() {
    const entry = {
      type: 'positive',
      date: this.currentDateKey,
      description: this.posData.description,
      emotions: [...this.posData.emotions],
      ts: Date.now()
    };
    if (!this.state.situations) this.state.situations = [];
    this.state.situations.push(entry);
    App.save();
    const overlay = document.getElementById('situationPosOverlay');
    if (overlay) overlay.classList.remove('active');
    if (typeof HomeScreen !== 'undefined') HomeScreen.render();
  },

  // ===== NEGATIVE / CBT FLOW =====

  openNegative(dateKey) {
    this.currentDateKey = dateKey || Streak.dateKey(Date.now());
    this.negData = { description: '', negativeThought: '', thoughtBelief: 50, emotions: [], distortions: [], reframe: '', reframeBelief: 50 };
    this.negStep = 1;
    this.negActiveCat = 0;
    this.renderNeg();
    const overlay = document.getElementById('situationNegOverlay');
    if (overlay) overlay.classList.add('active');
  },

  closeNegStep() {
    if (this.negStep > 1) {
      this.negStep--;
      this.renderNeg();
    } else {
      const overlay = document.getElementById('situationNegOverlay');
      if (overlay) overlay.classList.remove('active');
    }
  },

  renderNeg() {
    const titleEl = document.getElementById('situationNegTitle');
    const bodyEl = document.getElementById('situationNegBody');
    const stepEl = document.getElementById('situationNegStep');
    if (!bodyEl) return;
    if (stepEl) stepEl.textContent = 'Шаг ' + this.negStep + ' из 6';

    if (this.negStep === 1) {
      if (titleEl) titleEl.textContent = 'Ситуация';
      bodyEl.innerHTML = `
        <div class="diary-question">
          <label class="diary-label">Что произошло?</label>
          <textarea id="negDescription" class="diary-textarea" rows="5" placeholder="Опиши ситуацию объективно...">${this.negData.description}</textarea>
        </div>
        <button class="btn btn--primary btn--full mt-16" id="negStep1Next">Далее →</button>
      `;
      document.getElementById('negStep1Next').addEventListener('click', () => {
        const val = document.getElementById('negDescription').value.trim();
        if (!val) { alert('Опиши ситуацию'); return; }
        this.negData.description = val;
        this.negStep = 2;
        this.renderNeg();
      });

    } else if (this.negStep === 2) {
      if (titleEl) titleEl.textContent = 'Мысль';
      bodyEl.innerHTML = `
        <div class="diary-question">
          <label class="diary-label">Какая негативная мысль возникла?</label>
          <textarea id="negThought" class="diary-textarea" rows="4" placeholder="Например: «Я снова всё испортил»">${this.negData.negativeThought}</textarea>
        </div>
        <div class="cbt-slider-block mt-16">
          <div class="cbt-slider-header">
            <span class="diary-label">Насколько ты веришь в эту мысль?</span>
            <span class="cbt-slider-value" id="negBeliefValue">${this.negData.thoughtBelief}%</span>
          </div>
          <input type="range" id="negBelief" min="0" max="100" value="${this.negData.thoughtBelief}" class="cbt-range">
          <div class="intensity-labels"><span>0%</span><span>100%</span></div>
        </div>
        <button class="btn btn--primary btn--full mt-16" id="negStep2Next">Далее →</button>
      `;
      document.getElementById('negBelief').addEventListener('input', (e) => {
        document.getElementById('negBeliefValue').textContent = e.target.value + '%';
      });
      document.getElementById('negStep2Next').addEventListener('click', () => {
        const val = document.getElementById('negThought').value.trim();
        if (!val) { alert('Запиши мысль'); return; }
        this.negData.negativeThought = val;
        this.negData.thoughtBelief = parseInt(document.getElementById('negBelief').value);
        this.negStep = 3;
        this.renderNeg();
      });

    } else if (this.negStep === 3) {
      if (titleEl) titleEl.textContent = 'Эмоции';
      const cats = EMOTION_CATEGORIES_NEGATIVE;
      let catTabs = '<div class="emotion-cat-tabs">';
      cats.forEach((cat, i) => {
        const active = i === this.negActiveCat ? ' active' : '';
        catTabs += `<button class="emotion-cat-tab${active}" data-ci="${i}">${cat.icon} ${cat.name}</button>`;
      });
      catTabs += '</div>';

      const cat = cats[this.negActiveCat];
      let emotionsHtml = '<div class="emotion-chips">';
      cat.emotions.forEach(em => {
        const existing = this.negData.emotions.find(e => e.name === em);
        const sel = existing ? ' selected' : '';
        emotionsHtml += `<button class="chip chip--sm${sel}" data-em="${em}">${em}</button>`;
      });
      emotionsHtml += '</div>';

      let intensityHtml = '';
      if (this.negData.emotions.length > 0) {
        intensityHtml = '<div class="mt-12"><span class="diary-label">Интенсивность выбранных эмоций:</span>';
        this.negData.emotions.forEach((em, idx) => {
          intensityHtml += `
            <div class="cbt-emotion-intensity mt-8">
              <div class="cbt-slider-header">
                <span>${em.name}</span>
                <span class="cbt-slider-value" id="negEmInt${idx}">${em.intensity}%</span>
              </div>
              <input type="range" min="0" max="100" value="${em.intensity}" class="cbt-range neg-em-slider" data-idx="${idx}">
            </div>`;
        });
        intensityHtml += '</div>';
      }

      bodyEl.innerHTML = catTabs + emotionsHtml + intensityHtml + `
        <button class="btn btn--primary btn--full mt-16" id="negStep3Next">Далее →</button>
      `;

      bodyEl.querySelectorAll('.emotion-cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          this.negActiveCat = parseInt(btn.dataset.ci);
          this.renderNeg();
        });
      });

      bodyEl.querySelectorAll('.chip[data-em]').forEach(btn => {
        btn.addEventListener('click', () => {
          const em = btn.dataset.em;
          const idx = this.negData.emotions.findIndex(e => e.name === em);
          if (idx >= 0) {
            this.negData.emotions.splice(idx, 1);
          } else {
            if (this.negData.emotions.length >= 5) { alert('Максимум 5 эмоций'); return; }
            this.negData.emotions.push({ name: em, intensity: 50 });
          }
          this.renderNeg();
        });
      });

      bodyEl.querySelectorAll('.neg-em-slider').forEach(slider => {
        slider.addEventListener('input', () => {
          const idx = parseInt(slider.dataset.idx);
          this.negData.emotions[idx].intensity = parseInt(slider.value);
          const valEl = document.getElementById('negEmInt' + idx);
          if (valEl) valEl.textContent = slider.value + '%';
        });
      });

      document.getElementById('negStep3Next').addEventListener('click', () => {
        this.negStep = 4;
        this.renderNeg();
      });

    } else if (this.negStep === 4) {
      if (titleEl) titleEl.textContent = 'Когнитивные искажения';
      let html = '<p class="text-muted mb-12">Какие из этих искажений могли повлиять на твои мысли?</p>';
      html += '<div class="distortions-list">';
      COGNITIVE_DISTORTIONS.forEach(dist => {
        const sel = this.negData.distortions.includes(dist.id) ? ' selected' : '';
        html += `
          <div class="distortion-item${sel}" data-id="${dist.id}">
            <div class="distortion-item__header">
              <span class="distortion-item__check">${this.negData.distortions.includes(dist.id) ? '☑' : '☐'}</span>
              <span class="distortion-item__name">${dist.name}</span>
              <button class="distortion-item__toggle" data-id="${dist.id}">▼</button>
            </div>
            <div class="distortion-item__desc" id="distDesc_${dist.id}" style="display:none;">${dist.desc}</div>
          </div>`;
      });
      html += '</div>';
      html += '<button class="btn btn--primary btn--full mt-16" id="negStep4Next">Далее →</button>';
      bodyEl.innerHTML = html;

      bodyEl.querySelectorAll('.distortion-item').forEach(item => {
        item.querySelector('.distortion-item__header').addEventListener('click', (e) => {
          if (e.target.classList.contains('distortion-item__toggle')) {
            const id = e.target.dataset.id;
            const desc = document.getElementById('distDesc_' + id);
            if (desc) desc.style.display = desc.style.display === 'none' ? 'block' : 'none';
            e.target.textContent = desc.style.display === 'none' ? '▼' : '▲';
            return;
          }
          const id = item.dataset.id;
          const idx = this.negData.distortions.indexOf(id);
          if (idx >= 0) this.negData.distortions.splice(idx, 1);
          else this.negData.distortions.push(id);
          this.renderNeg();
        });
      });

      document.getElementById('negStep4Next').addEventListener('click', () => {
        this.negStep = 5;
        this.renderNeg();
      });

    } else if (this.negStep === 5) {
      if (titleEl) titleEl.textContent = 'Переосмысление';
      bodyEl.innerHTML = `
        <div class="diary-question">
          <label class="diary-label">Как можно взглянуть на ситуацию иначе?</label>
          <textarea id="negReframe" class="diary-textarea" rows="5" placeholder="Попробуй найти более реалистичный или позитивный взгляд...">${this.negData.reframe}</textarea>
        </div>
        <div class="cbt-slider-block mt-16">
          <div class="cbt-slider-header">
            <span class="diary-label">Насколько ты веришь в это переосмысление?</span>
            <span class="cbt-slider-value" id="negReframeBelValue">${this.negData.reframeBelief}%</span>
          </div>
          <input type="range" id="negReframeBelief" min="0" max="100" value="${this.negData.reframeBelief}" class="cbt-range">
          <div class="intensity-labels"><span>0%</span><span>100%</span></div>
        </div>
        <div class="ai-placeholder-card mt-16">
          <div class="ai-placeholder__icon">🤖</div>
          <div class="ai-placeholder__content">
            <div class="ai-placeholder__title">ИИ-анализ</div>
            <div class="ai-placeholder__text">⏳ Эта функция будет доступна позже</div>
          </div>
        </div>
        <button class="btn btn--primary btn--full mt-16" id="negStep5Next">Итог →</button>
      `;
      document.getElementById('negReframeBelief').addEventListener('input', (e) => {
        document.getElementById('negReframeBelValue').textContent = e.target.value + '%';
      });
      document.getElementById('negStep5Next').addEventListener('click', () => {
        this.negData.reframe = document.getElementById('negReframe').value.trim();
        this.negData.reframeBelief = parseInt(document.getElementById('negReframeBelief').value);
        this.negStep = 6;
        this.renderNeg();
      });

    } else if (this.negStep === 6) {
      if (titleEl) titleEl.textContent = 'Итог КПТ';
      const emotionsList = this.negData.emotions.map(e => `<span class="chip chip--sm">${e.name} ${e.intensity}%</span>`).join(' ');
      const distortionsList = this.negData.distortions.map(id => {
        const d = COGNITIVE_DISTORTIONS.find(x => x.id === id);
        return d ? `<span class="chip chip--sm">${d.name}</span>` : '';
      }).join(' ');

      bodyEl.innerHTML = `
        <div class="situation-summary-card">
          <div class="situation-summary__type negative">🔴 Негативная ситуация (КПТ)</div>
          <div class="situation-summary__section mt-12">
            <span class="diary-label">Ситуация:</span>
            <div class="mt-4">${this.escapeHtml(this.negData.description)}</div>
          </div>
          <div class="situation-summary__section mt-12">
            <span class="diary-label">Негативная мысль:</span>
            <div class="mt-4">${this.escapeHtml(this.negData.negativeThought)} <span class="text-muted">(убеждённость: ${this.negData.thoughtBelief}%)</span></div>
          </div>
          ${this.negData.emotions.length > 0 ? `<div class="situation-summary__section mt-12"><span class="diary-label">Эмоции:</span><div class="mt-8">${emotionsList}</div></div>` : ''}
          ${distortionsList ? `<div class="situation-summary__section mt-12"><span class="diary-label">Искажения:</span><div class="mt-8">${distortionsList}</div></div>` : ''}
          ${this.negData.reframe ? `<div class="situation-summary__section mt-12"><span class="diary-label">Переосмысление:</span><div class="mt-4">${this.escapeHtml(this.negData.reframe)} <span class="text-muted">(убеждённость: ${this.negData.reframeBelief}%)</span></div></div>` : ''}
        </div>
        <button class="btn btn--primary btn--full mt-16" id="negSave">💾 Сохранить</button>
      `;
      document.getElementById('negSave').addEventListener('click', () => this.saveNegative());
    }
  },

  saveNegative() {
    const entry = {
      type: 'negative',
      date: this.currentDateKey,
      description: this.negData.description,
      negativeThought: this.negData.negativeThought,
      thoughtBelief: this.negData.thoughtBelief,
      emotions: [...this.negData.emotions],
      distortions: [...this.negData.distortions],
      reframe: this.negData.reframe,
      reframeBelief: this.negData.reframeBelief,
      ts: Date.now()
    };
    if (!this.state.situations) this.state.situations = [];
    this.state.situations.push(entry);
    App.save();
    const overlay = document.getElementById('situationNegOverlay');
    if (overlay) overlay.classList.remove('active');
    if (typeof HomeScreen !== 'undefined') HomeScreen.render();
  },

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
