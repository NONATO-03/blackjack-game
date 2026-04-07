/**
 * Cards Asset Config
 * Mapeia ranks e suits para paths de imagem
 */

export const CardAssets = {
  // Mapeamento de rank para nome de arquivo
  rankMap: {
    'A': 'a',
    'K': 'k',
    'Q': 'q',
    'J': 'j',
    '10': '10',
    '9': '9',
    '8': '8',
    '7': '7',
    '6': '6',
    '5': '5',
    '4': '4',
    '3': '3',
    '2': '2'
  },

  // Mapeamento de suit para nome de arquivo
  suitMap: {
    'H': 'copas',      // Hearts
    'D': 'ouros',      // Diamonds
    'C': 'paus',       // Clubs
    'S': 'espadas'     // Spades
  },

  /**
   * Retorna path da carta
   * @param {Card} card
   * @returns {string}
   */
  getCardPath(card) {
    const rankKey = CardAssets.rankMap[card.rank] || card.rank.toLowerCase();
    const suitKey = CardAssets.suitMap[card.suit] || 'copas';
    return `cartas/${rankKey}-${suitKey}.png`;
  },

  /**
   * Retorna path do verso
   * @returns {string}
   */
  getBackPath() {
    return 'cartas/costas-carta.png';
  },

  /**
   * Retorna símbolos dos naipes (para renderização sem imagem)
   */
  suitSymbols: {
    'H': '♥',
    'D': '♦',
    'C': '♣',
    'S': '♠'
  },

  /**
   * Retorna cor do naipe
   */
  suitColors: {
    'H': '#ff0000',  // Red
    'D': '#ff0000',  // Red
    'C': '#000000',  // Black
    'S': '#000000'   // Black
  }
};

export default CardAssets;
