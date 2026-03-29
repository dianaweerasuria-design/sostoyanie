/* ===== storage.js — Работа с localStorage, экспорт/импорт ===== */

const STORAGE_KEY = 'sostoyanie_data';

const Storage = {
  /** Загрузить состояние из localStorage */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const saved = JSON.parse(raw);
      // Мержим с дефолтами чтобы новые поля не пропали
      const state = { ...JSON.parse(JSON.stringify(DEFAULT_STATE)), ...saved };
      // Миграция: если нет tagGroups, создаём из старого формата tags
      if (!state.custom.tagGroups) {
        const tags = state.custom.tags || DEFAULT_TAGS;
        state.custom.tagGroups = [
          { id: 'places', name: 'Место', icon: '📍', items: tags.places || [] },
          { id: 'activities', name: 'Активности', icon: '🏃', items: tags.activities || [] },
          { id: 'people', name: 'Люди', icon: '👥', items: tags.people || [] },
          { id: 'body', name: 'Тело и самочувствие', icon: '🧘', items: tags.body || [] }
        ];
      }
      return state;
    } catch (e) {
      console.error('Ошибка загрузки данных:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  },

  /** Сохранить состояние в localStorage */
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Ошибка сохранения данных:', e);
    }
  },

  /** Экспорт данных как JSON-файл */
  exportData(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sostoyanie_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Импорт данных из JSON-файла */
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.entries || !Array.isArray(data.entries)) {
            reject(new Error('Неверный формат файла'));
            return;
          }
          resolve(data);
        } catch (err) {
          reject(new Error('Ошибка чтения файла'));
        }
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file);
    });
  },

  /** Полный сброс */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
};
