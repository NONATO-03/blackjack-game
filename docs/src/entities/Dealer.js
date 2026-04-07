/**
 * Dealer - Entidade do dealer/inimigo
 * Diferentes tipos com diferentes estratégias de hit/stand
 */

import { Hand } from '../core/Hand.js';
import { DealerTypes } from '../config/constants.js';

export class Dealer {
  #type;
  #difficulty; // 1-5 (affects decision making)
  #hand;
  #name;
  #isRevealed = false;

  constructor(type = DealerTypes.INITIANTE, difficulty = 1) {
    this.#type = type;
    this.#difficulty = Math.max(1, Math.min(5, difficulty));
    this.#hand = new Hand();
    this.#name = this.#getNameForType(type);
  }

  /**
   * Determina nome baseado no tipo
   * @private
   */
  #getNameForType(type) {
    const names = {
      [DealerTypes.INITIANTE]: 'Iniciante',
      [DealerTypes.PROFISSIONAL]: 'Profissional',
      [DealerTypes.MAGO]: 'Mago',
      [DealerTypes.TUBARON]: 'Tubarão'
    };
    return names[type] || 'Dealer';
  }

  /**
   * Decide se deve comprar carta
   * Estratégia depende do tipo e dificuldade
   * @returns {boolean}
   */
  shouldHit() {
    return this.#strategyForType();
  }

  /**
   * Estratégia specific do tipo
   * @private
   */
  #strategyForType() {
    const value = this.#hand.value();

    switch (this.#type) {
      case DealerTypes.INITIANTE:
        // Iniciante: simples, segue regra básica (hit < 17)
        return value < 17;

      case DealerTypes.PROFISSIONAL:
        // Profissional: soft 17 (A+6), mais agressivo
        return value < 17 || (value === 17 && this.#hand.hasSoftAce());

      case DealerTypes.MAGO:
        // Mago: depende também da dificuldade
        if (this.#difficulty <= 2) {
          return value < 17 || (value === 17 && this.#hand.hasSoftAce());
        }
        // Esmagador: tem "visão", joga agressivamente
        return value < 18;

      case DealerTypes.TUBARON:
        // Tubarão: muito agressivo, cheats liberados
        return value < 17;

      default:
        return value < 17;
    }
  }

  /**
   * Inicia nova mão
   */
  startHand() {
    this.#hand = new Hand();
    this.#isRevealed = false;
  }

  /**
   * Revela segunda carta
   */
  revealSecondCard() {
    this.#isRevealed = true;
  }

  /**
   * Getters
   */
  get type() { return this.#type; }
  get difficulty() { return this.#difficulty; }
  get hand() { return this.#hand; }
  get name() { return this.#name; }
  get isRevealed() { return this.#isRevealed; }

  /**
   * Debug
   */
  toString() {
    return `Dealer(${this.#name}, diff=${this.#difficulty})`;
  }
}

export default Dealer;
