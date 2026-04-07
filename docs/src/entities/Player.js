/**
 * Player - Entidade do jogador
 * Gerencia balance, inventory, habilidades, estatísticas
 */

import { Hand } from '../core/Hand.js';
import { EventBus } from '../events/EventBus.js';

export class Player {
  #name;
  #balance;
  #bet;
  #hand;
  #inventory = {};
  #stats = {
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    totalPushes: 0,
    totalBalanceGained: 0,
    winMultiplier: 1.0,
    largestWin: 0,
    largestLoss: 0
  };
  #skillsUnlocked = new Set();

  constructor(name = 'Player 1') {
    this.#name = name;
    this.#balance = 4000; // Starting balance
    this.#bet = 300;
    this.#hand = new Hand();
  }

  /**
   * Compra item da loja
   * @param {Item} item - Item a comprar
   * @throws {Error} Se saldo insuficiente ou sem estoque
   */
  buyItem(item) {
    if (this.#balance < item.cost) {
      throw new Error('Saldo insuficiente');
    }
    if (item.stock !== 'INF' && item.stock <= 0) {
      throw new Error('Sem estoque');
    }

    this.#balance -= item.cost;
    this.#inventory[item.key] = (this.#inventory[item.key] || 0) + 1;

    EventBus.emit('player:item-purchased', {
      item,
      newBalance: this.#balance
    });
  }

  /**
   * Usa item do inventário
   * @param {string} itemKey - Chave do item
   * @throws {Error} Se não tiver no inventário
   */
  useItem(itemKey) {
    if (!this.hasItem(itemKey)) {
      throw new Error(`Item não pode ser usado: ${itemKey}`);
    }

    this.#inventory[itemKey]--;
    if (this.#inventory[itemKey] === 0) {
      delete this.#inventory[itemKey];
    }

    EventBus.emit('player:item-used', { itemKey });
  }

  /**
   * Verifica se tem item em estoque
   * @param {string} itemKey
   * @returns {number} Quantidade
   */
  hasItem(itemKey) {
    return (this.#inventory[itemKey] || 0) > 0;
  }

  /**
   * Ganha saldo (vitória, bônus, etc)
   * @param {number} amount - Valor positivo
   */
  addBalance(amount) {
    if (amount < 0) {
      throw new Error('Use loseBalance para valores negativos');
    }
    this.#balance += amount;
    this.#stats.totalBalanceGained += amount;

    EventBus.emit('player:balance-changed', {
      newBalance: this.#balance,
      delta: amount,
      type: 'gain'
    });
  }

  /**
   * Perde saldo (derrota, etc)
   * @param {number} amount - Valor positivo
   */
  loseBalance(amount) {
    if (amount < 0) {
      throw new Error('Use addBalance para valores positivos');
    }
    this.#balance -= amount;

    EventBus.emit('player:balance-changed', {
      newBalance: this.#balance,
      delta: -amount,
      type: 'loss'
    });
  }

  /**
   * Registra resultado de rodada
   * @param {string} result - 'win', 'loss', 'push'
   * @param {number} gain - Valor ganho/perdido
   */
  recordRound(result, gain) {
    this.#stats.totalGames++;

    switch (result) {
      case 'win':
        this.#stats.totalWins++;
        if (gain > this.#stats.largestWin) this.#stats.largestWin = gain;
        this.addBalance(gain);
        break;
      case 'loss':
        this.#stats.totalLosses++;
        if (gain < this.#stats.largestLoss) this.#stats.largestLoss = gain;
        this.loseBalance(Math.abs(gain));
        break;
      case 'push':
        this.#stats.totalPushes++;
        this.addBalance(gain);
        break;
    }

    EventBus.emit('player:round-recorded', {
      result,
      gain,
      stats: { ...this.#stats }
    });
  }

  /**
   * Inicia nova mão
   */
  startHand() {
    this.#hand = new Hand();
  }

  /**
   * Getters
   */
  get name() { return this.#name; }
  get balance() { return this.#balance; }
  get bet() { return this.#bet; }
  set bet(value) { this.#bet = value; }
  get hand() { return this.#hand; }
  get inventory() { return { ...this.#inventory }; }
  get stats() { return { ...this.#stats }; }
  get skillsUnlocked() { return new Set(this.#skillsUnlocked); }

  /**
   * Exportar estado para persistência
   */
  toJSON() {
    return {
      name: this.#name,
      balance: this.#balance,
      bet: this.#bet,
      inventory: { ...this.#inventory },
      stats: { ...this.#stats },
      skillsUnlocked: Array.from(this.#skillsUnlocked)
    };
  }

  /**
   * Restaurar estado da persistência
   */
  static fromJSON(data) {
    const player = new Player(data.name);
    player.#balance = data.balance;
    player.#bet = data.bet;
    player.#inventory = { ...data.inventory };
    player.#stats = { ...data.stats };
    player.#skillsUnlocked = new Set(data.skillsUnlocked || []);
    return player;
  }
}

export default Player;
