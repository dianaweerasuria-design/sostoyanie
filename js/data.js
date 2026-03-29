/* ===== data.js — Константы и дефолтные данные ===== */

const DEFAULT_EMOTIONS = [
  { name: 'Радость', emoji: '😊' },
  { name: 'Спокойствие', emoji: '😌' },
  { name: 'Вдохновение', emoji: '✨' },
  { name: 'Тревога', emoji: '😰' },
  { name: 'Грусть', emoji: '😢' },
  { name: 'Усталость', emoji: '😴' },
  { name: 'Раздражение', emoji: '😤' },
  { name: 'Пусто', emoji: '🫥' }
];

const DEFAULT_TAGS = {
  places: ['Дом', 'Работа', 'Улица', 'Кафе', 'Транспорт', 'Природа'],
  activities: ['Прогулка', 'Спорт', 'Чтение', 'Игры', 'Творчество', 'Готовка', 'Уборка', 'Учёба', 'Шоппинг'],
  people: ['Один/а', 'Партнёр', 'Семья', 'Друзья', 'Коллеги', 'Незнакомцы'],
  body: ['Головная боль', 'Болит живот', 'Энергии много', 'Энергии мало', 'ПМС', 'Болит спина']
};

const DEFAULT_TAG_GROUPS = [
  { id: 'places', name: 'Место', icon: '📍', items: ['Дом', 'Работа', 'Улица', 'Кафе', 'Транспорт', 'Природа'] },
  { id: 'activities', name: 'Активности', icon: '🏃', items: ['Прогулка', 'Спорт', 'Чтение', 'Игры', 'Творчество', 'Готовка', 'Уборка', 'Учёба', 'Шоппинг'] },
  { id: 'people', name: 'Люди', icon: '👥', items: ['Один/а', 'Партнёр', 'Семья', 'Друзья', 'Коллеги', 'Незнакомцы'] },
  { id: 'body', name: 'Тело и самочувствие', icon: '🧘', items: ['Головная боль', 'Болит живот', 'Энергии много', 'Энергии мало', 'ПМС', 'Болит спина'] }
];

const WEATHER_OPTIONS = ['☀️', '🌤', '☁️', '🌧', '❄️', '🌩'];

const LEVELS = [
  { level: 1, name: 'Новичок', xp: 0 },
  { level: 2, name: 'Наблюдатель', xp: 50 },
  { level: 3, name: 'Исследователь', xp: 150 },
  { level: 4, name: 'Осознанный', xp: 350 },
  { level: 5, name: 'Мастер', xp: 700 },
  { level: 6, name: 'Гармония', xp: 1500 }
];

const ACHIEVEMENTS = {
  first_step:     { icon: '🌱', name: 'Первый шаг', desc: 'Первая запись' },
  week_fire:      { icon: '🔥', name: 'Неделя огня', desc: 'Серия 7 дней' },
  half_moon:      { icon: '🌙', name: 'Полумесяц', desc: 'Серия 14 дней' },
  month_power:    { icon: '⭐', name: 'Месяц силы', desc: 'Серия 30 дней' },
  unbreakable:    { icon: '🏔', name: 'Несгибаемый', desc: 'Серия 60 дней' },
  legend:         { icon: '👑', name: 'Легенда', desc: 'Серия 100 дней' },
  writer:         { icon: '📝', name: 'Писатель', desc: '10 записей с текстом' },
  explorer:       { icon: '🔍', name: 'Исследователь', desc: '50 записей с контекстом' },
  full_palette:   { icon: '🌈', name: 'Полная палитра', desc: 'Все 8 базовых эмоций' },
  collector:      { icon: '💎', name: 'Коллекционер', desc: '500 кристаллов' },
  goal_setter:    { icon: '🎯', name: 'Целеустремлённый', desc: '4 цели недели подряд' },
  analyst:        { icon: '📊', name: 'Аналитик', desc: '14+ записей + аналитика' }
};

const SHOP_ITEMS = [
  { id: 'freeze_1', name: 'Заморозка 1 день', icon: '🧊', price: 30, type: 'd1' },
  { id: 'freeze_3', name: 'Заморозка 3 дня', icon: '❄️', price: 80, type: 'd3' }
];

const DEFAULT_STATE = {
  myCode: null,
  partnerCode: null,
  partnerData: null,
  crystals: 0,
  totalCrystals: 0,
  streak: 0,
  maxStreak: 0,
  freezes: { d1: 0, d3: 0 },
  weekGoal: null,
  weekGoalStreak: 0,
  achievements: {},
  notifEnabled: false,
  notifTime: '21:00',
  custom: {
    emotions: [...DEFAULT_EMOTIONS],
    tags: JSON.parse(JSON.stringify(DEFAULT_TAGS)),
    tagGroups: JSON.parse(JSON.stringify(DEFAULT_TAG_GROUPS))
  },
  entries: [],
  weeklySummaries: {},
  morningDiaries: {},
  eveningDiaries: {},
  situations: [],
  userName: ''
};

const EMOTION_CATEGORIES_POSITIVE = [
  { id: 'joy', name: 'Радость', icon: '😊', emotions: ['Счастье', 'Восторг', 'Эйфория', 'Удовлетворение', 'Благодарность', 'Оптимизм', 'Восхищение', 'Вдохновение', 'Юмор', 'Энтузиазм'] },
  { id: 'love', name: 'Любовь', icon: '❤️', emotions: ['Привязанность', 'Нежность', 'Сострадание', 'Забота', 'Доверие', 'Симпатия', 'Уважение', 'Теплота'] },
  { id: 'calm', name: 'Спокойствие', icon: '😌', emotions: ['Умиротворение', 'Расслабление', 'Безопасность', 'Принятие', 'Гармония', 'Терпение', 'Ясность', 'Уверенность'] }
];

const EMOTION_CATEGORIES_NEGATIVE = [
  { id: 'anger', name: 'Гнев', icon: '😤', emotions: ['Раздражение', 'Злость', 'Ярость', 'Разочарование', 'Обида', 'Ненависть', 'Зависть', 'Ревность'] },
  { id: 'fear', name: 'Страх', icon: '😰', emotions: ['Тревога', 'Паника', 'Беспокойство', 'Неуверенность', 'Стресс', 'Напряжение'] },
  { id: 'sadness', name: 'Грусть', icon: '😢', emotions: ['Печаль', 'Уныние', 'Отчаяние', 'Одиночество', 'Ностальгия', 'Скорбь'] },
  { id: 'shame', name: 'Стыд', icon: '😳', emotions: ['Смущение', 'Вина', 'Неловкость', 'Сожаление', 'Самокритика'] }
];

const COGNITIVE_DISTORTIONS = [
  { id: 'overgeneralization', name: 'Сверхобобщение', desc: 'Делать общие выводы на основе единичных случаев' },
  { id: 'catastrophizing', name: 'Катастрофизация', desc: 'Ожидать самого плохого исхода без оснований' },
  { id: 'black_white', name: 'Чёрно-белое мышление', desc: 'Видеть ситуацию только в крайностях' },
  { id: 'personalization', name: 'Персонализация', desc: 'Принимать на свой счёт события, не связанные с тобой' },
  { id: 'mind_reading', name: 'Чтение мыслей', desc: 'Предполагать что другие думают о тебе плохое' },
  { id: 'disqualify_positive', name: 'Обесценивание позитива', desc: 'Игнорировать хорошее и фокусироваться на плохом' },
  { id: 'should_statements', name: 'Долженствование', desc: 'Жёсткие правила "должен", "обязан"' },
  { id: 'emotional_reasoning', name: 'Эмоциональное обоснование', desc: 'Если я чувствую так — значит так и есть' },
  { id: 'labeling', name: 'Навешивание ярлыков', desc: '"Я неудачник" вместо "я ошибся"' },
  { id: 'positive_disqualification', name: 'Позитивное обесценивание', desc: 'Принижать свои достижения' }
];
