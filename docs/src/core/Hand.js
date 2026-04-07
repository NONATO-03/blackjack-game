/**
 * Hand - Mão de cartas (jogador ou dealer)
 * Calcula valor, verifica bust, blackjack, soft ace
 */

export class Hand {
  #cards = [];

  constructor(cards = []) {
    this.#cards = [...cards]; // Shallow copy
  }

  /**
   * Adiciona carta à mão
   * @param {Card} card
   */
  addCard(card) {
    this.#cards.push(card);
  }

  /**
   * Remove todas as cartas
   */
  clear() {
    this.#cards = [];
  }

  /**
   * Retorna array imutável de cartas
   * @returns {Card[]}
   */
  getCards() {
    return Object.freeze([...this.#cards]);
  }

  /**
   * Quantidade de cartas
   * @returns {number}
   */
  length() {
    return this.#cards.length;
  }

  /**
   * Calcula valor total da mão
   * Ases contam como 11, mas diminuem para 1 se necessário
   * @returns {number}
   */
  value() {
    return this.#calculateValue();
  }

  #calculateValue() {
    let sum = 0;
    let aces = 0;

    // Soma todos os valores inicialmente
    for (const card of this.#cards) {
      sum += card.value;
      if (card.isAce()) aces++;
    }

    // Reduz ases de 11 para 1 enquanto houver bust
    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces--;
    }

    return sum;
  }

  /**
   * Verifica se mão é bust (>21)
   * @returns {boolean}
   */
  isBust() {
    return this.value() > 21;
  }

  /**
   * Verifica se é blackjack natural (2 cartas = 21)
   * @returns {boolean}
   */
  isBlackjack() {
    return this.#cards.length === 2 && this.value() === 21;
  }

  /**
   * Verifica se tem um soft ace (Ás contando como 11)
   * Significa que pode pedir carta sem risco de bust
   * @returns {boolean}
   */
  hasSoftAce() {
    const hasAce = this.#cards.some(card => card.isAce());
    return hasAce && this.value() <= 11;
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    const cardStrings = this.#cards.map(c => c.toString());
    return `Hand([${cardStrings.join(', ')}] = ${this.value()})`;
  }
}

export default Hand;
