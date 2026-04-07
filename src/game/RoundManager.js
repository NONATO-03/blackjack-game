/**
 * RoundManager - Gerencia uma rodada de blackjack
 * Fluxo completo: deal → player turn → dealer turn → resolve
 */

import { Deck } from '../core/Deck.js';
import { EventBus } from '../events/EventBus.js';
import { GameConstants } from '../config/constants.js';

export class RoundManager {
  #player;
  #dealer;
  #deck;
  #result = null;
  #gain = 0;
  #hasEnded = false;

  constructor(player, dealer) {
    this.#player = player;
    this.#dealer = dealer;
    this.#deck = new Deck();
  }

  /**
   * Inicia rodada: cria deck, distribui cartas
   */
  start() {
    this.#deck.shuffle();
    this.#player.startHand();
    this.#dealer.startHand();

    // Distribui 2 cartas para cada
    const playerCard1 = this.#deck.draw();
    const dealerCard1 = this.#deck.draw();
    const playerCard2 = this.#deck.draw();
    const dealerCard2 = this.#deck.draw();

    this.#player.hand.addCard(playerCard1);
    this.#player.hand.addCard(playerCard2);
    this.#dealer.hand.addCard(dealerCard1);
    this.#dealer.hand.addCard(dealerCard2);

    EventBus.emit('game:cards-dealt', {
      playerHand: this.#player.hand.getCards(),
      dealerHand: [dealerCard1], // Segunda carta oculta
      playerValue: this.#player.hand.value(),
      dealerValue: dealerCard1.value
    });

    // Verifica blackjacks naturais imediatamente
    this.#checkNaturalBlackjacks();
  }

  /**
   * Verifica blackjacks naturais (2 cartas = 21)
   * @private
   */
  #checkNaturalBlackjacks() {
    const playerBJ = this.#player.hand.isBlackjack();
    const dealerBJ = this.#dealer.hand.isBlackjack();

    if (playerBJ && dealerBJ) {
      // Push
      this.#resolveRound('push', this.#player.bet);
    } else if (playerBJ) {
      // Player wins com multiplier maior
      this.#resolveRound('win', this.#player.bet * GameConstants.BLACKJACK_MULTIPLIER);
    } else if (dealerBJ) {
      // Dealer wins
      this.#resolveRound('loss', -this.#player.bet);
    }
  }

  /**
   * Jogador compra carta
   */
  async playerHit() {
    const card = this.#deck.draw();
    this.#player.hand.addCard(card);

    EventBus.emit('card:drawn', {
      who: 'player',
      card: card.toString(),
      value: this.#player.hand.value()
    });

    // Delay de animação
    await this.#sleep(GameConstants.CARD_DRAW_DELAY);

    if (this.#player.hand.isBust()) {
      this.#resolveRound('loss', -this.#player.bet);
    }
  }

  /**
   * Jogador passa (stand)
   */
  async playerStand() {
    EventBus.emit('player:stand');

    // Revela segunda carta do dealer
    this.#dealer.revealSecondCard();
    EventBus.emit('card:revealed', {
      who: 'dealer',
      value: this.#dealer.hand.value()
    });

    // Turno do dealer
    await this.dealerTurn();
  }

  /**
   * Turno do dealer (loop automático)
   */
  async dealerTurn() {
    while (this.#dealer.shouldHit()) {
      await this.#sleep(GameConstants.DEALER_DELAY);

      const card = this.#deck.draw();
      this.#dealer.hand.addCard(card);

      EventBus.emit('card:drawn', {
        who: 'dealer',
        card: card.toString(),
        value: this.#dealer.hand.value()
      });

      if (this.#dealer.hand.isBust()) {
        this.#resolveRound('win', this.#player.bet * GameConstants.BASE_PAYOUT_MULTIPLIER);
        return;
      }
    }

    // Dealer stood, determinar vencedor
    this.#determineWinner();
  }

  /**
   * Determina vencedor (ambos com stand, sem bust)
   * @private
   */
  #determineWinner() {
    const pv = this.#player.hand.value();
    const dv = this.#dealer.hand.value();

    let result, gain;

    if (pv > dv) {
      result = 'win';
      gain = this.#player.bet * GameConstants.BASE_PAYOUT_MULTIPLIER;
    } else if (pv < dv) {
      result = 'loss';
      gain = -this.#player.bet;
    } else {
      result = 'push';
      gain = this.#player.bet;
    }

    this.#resolveRound(result, gain);
  }

  /**
   * Finaliza rodada, registra resultado
   * @private
   */
  #resolveRound(result, gain) {
    if (this.#hasEnded) return;

    this.#hasEnded = true;
    this.#result = result;
    this.#gain = gain;

    // Registrar stats
    this.#player.recordRound(result, gain);

    EventBus.emit('game:round-result', {
      result,
      gain,
      playerValue: this.#player.hand.value(),
      dealerValue: this.#dealer.hand.value(),
      playerCards: this.#player.hand.getCards(),
      dealerCards: this.#dealer.hand.getCards()
    });
  }

  /**
   * Utilitário de delay
   * @private
   */
  #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Getters
   */
  get hasEnded() { return this.#hasEnded; }
  get result() { return this.#result; }
  get gain() { return this.#gain; }

  /**
   * Debug
   */
  toString() {
    return `Round(${this.#result}, gain=${this.#gain})`;
  }
}

export default RoundManager;
