/**
 * Asset Paths Index - Centraliza todos os paths de assets
 * Evita hardcoding strings
 */

export const AssetPaths = {
  // Base
  base: '../assets/img',

  // Cards
  cards: {
    folder: 'cartas',
    back: 'cartas/costas-carta.png'
  },

  // Enemies
  enemies: {
    iniciantes: 'enemies/iniciantes',
    profissionais: 'enemies/profissionais',
    mago: 'enemies/mago',
    tubaron: 'enemies/tubaron'
  },

  // Sellers
  sellers: {
    vendedor: 'sellers/vendedor',
    desconhecido: 'sellers/desconhecido'
  },

  // Icones
  icons: {
    folder: 'icones',
    placeholder: 'icones/placeholder.png'
  },

  // Game modes
  modes: {
    blackjack: 'modos/blackjack'
  },

  // Players
  players: {
    folder: 'jogadores'
  },

  // Effects
  effects: {
    explosao: 'explosao',
    cutscenes: 'cutscenes'
  },

  /**
   * Retorna path completo
   * @param {string} relativePath
   * @returns {string}
   */
  getPath(relativePath) {
    return `${AssetPaths.base}/${relativePath}`;
  },

  /**
   * Retorna path de carta específica
   * @param {string} rank
   * @param {string} suit
   * @returns {string}
   */
  getCardPath(rank, suit) {
    const rankMap = { 'A': 'a', 'K': 'k', 'Q': 'q', 'J': 'j' };
    const suitMap = { 'H': 'copas', 'D': 'ouros', 'C': 'paus', 'S': 'espadas' };
    const r = rankMap[rank] || rank.toLowerCase();
    const s = suitMap[suit] || 'copas';
    return `cartas/${r}-${s}.png`;
  }
};

export default AssetPaths;
