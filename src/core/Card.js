/**
 * Card - Representa uma carta no baralho
 * Immutable entity
 */

export class Card {
  /**
   * @param {string} rank - Rank: '2'-'10', 'J', 'Q', 'K', 'A'
   * @param {string} suit - Naipe: 'H' (Copas), 'D' (Ouros), 'C' (Paus), 'S' (Espadas)
   */
  constructor(rank, suit) {
    if (!this.#isValidRank(rank)) {
      throw new Error(`Invalid rank: ${rank}`);
    }
    if (!this.#isValidSuit(suit)) {
      throw new Error(`Invalid suit: ${suit}`);
    }

    this.rank = rank;
    this.suit = suit;
    this.value = this.#computeValue();
    this.isNew = false; // Flag para animações
  }

  /**
   * Calcula o valor numérico da carta
   * @returns {number} Valor (11 para Ás, 10 para J/Q/K, número para outras)
   */
  #computeValue() {
    if (['J', 'Q', 'K'].includes(this.rank)) return 10;
    if (this.rank === 'A') return 11;
    return parseInt(this.rank, 10);
  }

  /**
   * Verifica se é um Ás
   * @returns {boolean}
   */
  isAce() {
    return this.rank === 'A';
  }

  /**
   * Verifica se é figura (J, Q, K)
   * @returns {boolean}
   */
  isFace() {
    return ['J', 'Q', 'K'].includes(this.rank);
  }

  /**
   * String representation para debug
   * @returns {string} Ex: "AS" (Ace of Spades)
   */
  toString() {
    return `${this.rank}${this.suit}`;
  }

  /**
   * Validação interna
   */
  #isValidRank(rank) {
    const validRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return validRanks.includes(rank);
  }

  #isValidSuit(suit) {
    return ['H', 'D', 'C', 'S'].includes(suit);
  }
}

export default Card;
