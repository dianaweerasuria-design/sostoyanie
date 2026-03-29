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
  weeklySummaries: {}
};
