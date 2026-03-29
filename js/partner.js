/* ===== partner.js — Функционал партнёра ===== */

const Partner = {
  state: null,

  init(state) {
    this.state = state;
  },

  /** Сгенерировать 6-символьный код */
  generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
};
