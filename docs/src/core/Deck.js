/**
 * Deck - Gerenciamento de baralho
 * Factory e estado de cartas disponíveis
 */

import { Card } from './Card.js';

const SUITS = ['H', 'D', 'C', 'S'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class Deck {
  #cards = [];

  constructor() {
    this.#createDeck();
  }

  /**
   * Cria um baralho padrão de 52 cartas
   * @private
   */
  #createDeck() {
    this.#cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.#cards.push(new Card(rank, suit));
      }
    }
  }

  /**
   * Fisher-Yates shuffle algorithm
   * Modifica o array in-place
   */
  shuffle() {
    for (let i = this.#cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.#cards[i], this.#cards[j]] = [this.#cards[j], this.#cards[i]];
    }
    return this;
  }

  /**
   * Remove e retorna a próxima carta
   * @returns {Card} Próxima carta
   * @throws {Error} Se deck estiver vazio
   */
  draw() {
    if (this.#cards.length === 0) {
      // Reset deck se vazio
      this.#createDeck();
      this.shuffle();
    }
    const card = this.#cards.pop();
    card.isNew = true; // Marca para animação
    return card;
  }

  /**
   * Retorna quantidade de cartas restantes
   * @returns {number}
   */
  cardsRemaining() {
    return this.#cards.length;
  }

  /**
   * Reseta o deck
   */
  reset() {
    this.#createDeck();
  }

  /**
   * Debug info
   */
  toString() {
    return `Deck(${this.#cards.length}/52)`;
  }
}

export default Deck;
