/**
 * GameEngine - Singleton principal que orquestra o jogo
 * Gerencia estado global, transições, inicialização
 */

import { GameState, isValidTransition } from './GameState.js';
import { EventBus } from '../events/EventBus.js';
import { Player } from '../entities/Player.js';
import { Dealer } from '../entities/Dealer.js';
import { RoundManager } from './RoundManager.js';

export class GameEngine {
  static #instance = null;

  #currentState = GameState.MENU;
  #player = null;
  #roundManager = null;
  #isInitialized = false;

  // Dependências (injectadas ou criadas)
  #assetManager = null;
  #audioManager = null;
  #saveManager = null;
  #uiManager = null;
  #shopManager = null;

  static getInstance() {
    if (!GameEngine.#instance) {
      GameEngine.#instance = new GameEngine();
    }
    return GameEngine.#instance;
  }

  private constructor() {
    // Private para forçar singleton
  }

  /**
   * Inicialização assíncrona do jogo
   * @param {Object} dependencies - Gerenciadores injetados
   */
  async init(dependencies = {}) {
    if (this.#isInitialized) {
      console.warn('GameEngine já inicializado');
      return;
    }

    try {
      // Injetar dependências (com fallbacks)
      this.#assetManager = dependencies.assetManager || MockAssetManager;
      this.#audioManager = dependencies.audioManager || MockAudioManager;
      this.#saveManager = dependencies.saveManager || MockSaveManager;
      this.#uiManager = dependencies.uiManager || MockUIManager;
      this.#shopManager = dependencies.shopManager || null;

      // Pré-carregar assets
      console.log('[GameEngine] Carregando assets...');
      await this.#assetManager.preload?.();

      // Restaurar estado anterior
      console.log('[GameEngine] Restaurando estado...');
      const savedGame = await this.#saveManager.load?.();
      if (savedGame?.player) {
        this.#player = savedGame.player;
      } else {
        // TODO: Criar novo Player quando Player.js estiver pronto
        this.#player = { balance: 4000, inventory: {}, stats: {} };
      }

      // Emit initialization event
      EventBus.emit('game:initialized', {
        version: '1.0.0-beta',
        timestamp: Date.now()
      });

      this.#isInitialized = true;
      console.log('[GameEngine] Inicialização completa');

      // Transicionar para SHOP
      this.transitionTo(GameState.SHOP);
    } catch (error) {
      console.error('[GameEngine] Erro na inicialização:', error);
      EventBus.emit('game:init-error', { error });
    }
  }

  /**
   * Transiciona para novo estado validando transição
   * @param {string} newState - Novo estado
   * @param {Object} data - Dados da transição
   */
  transitionTo(newState, data = null) {
    if (!isValidTransition(this.#currentState, newState)) {
      const error = new Error(
        `Transição inválida: ${this.#currentState} → ${newState}`
      );
      console.error(error);
      EventBus.emit('game:transition-error', { from: this.#currentState, to: newState, error });
      return;
    }

    const oldState = this.#currentState;
    this.#currentState = newState;

    console.log(`[GameEngine] State: ${oldState} → ${newState}`);

    EventBus.emit('game:state-changed', {
      from: oldState,
      to: newState,
      data
    });
  }

  /**
   * Set game entities (Player, Dealer)
   */
  setGameEntities(player, dealer) {
    this.#player = player;
    // Note: dealer será criado por RoundManager quando starter nova rodada
  }

  /**
   * Inicia uma nova rodada
   */
  startRound() {
    if (!this.#player) {
      console.error('[GameEngine] Jogador não inicializado');
      return;
    }

    const dealer = new Dealer();
    this.#roundManager = new RoundManager(this.#player, dealer);

    console.log('[GameEngine] Iniciando rodada...');

    // Inicia a rodada (distribui cartas)
    this.#roundManager.start();

    EventBus.emit('game:round-started', {
      player: this.#player,
      dealer: dealer,
      bet: this.#player.bet
    });

    this.transitionTo(GameState.PLAYER_TURN);
  }

  /**
   * Jogador compra carta
   */
  playerHit() {
    if (this.#currentState !== GameState.PLAYER_TURN) {
      console.warn('[GameEngine] Hit é válido apenas durante PLAYER_TURN');
      return;
    }

    if (!this.#roundManager) {
      console.warn('[GameEngine] RoundManager não inicializado');
      return;
    }

    this.#roundManager.playerHit();
  }

  /**
   * Jogador passa
   */
  playerStand() {
    if (this.#currentState !== GameState.PLAYER_TURN) {
      console.warn('[GameEngine] Stand é válido apenas durante PLAYER_TURN');
      return;
    }

    if (!this.#roundManager) {
      console.warn('[GameEngine] RoundManager não inicializado');
      return;
    }

    this.#roundManager.playerStand();
  }

  /**
   * Finalizar rodada e voltar ao shop
   */
  finishRound() {
    EventBus.emit('game:round-finished');
    this.transitionTo(GameState.SHOP);
  }

  /**
   * Getters
   */
  get state() {
    return this.#currentState;
  }

  get player() {
    return this.#player;
  }

  get isInitialized() {
    return this.#isInitialized;
  }

  /**
   * Reset completo do jogo
   */
  reset() {
    this.#currentState = GameState.MENU;
    this.#player = null;
    this.#roundManager = null;
    this.#isInitialized = false;
    EventBus.clear();
    console.log('[GameEngine] Reset completo');
  }

  /**
   * Debug info
   */
  toString() {
    return `GameEngine(state=${this.#currentState}, player=${this.#player?.name || 'null'})`;
  }
}

// Mocks temporários (serão substituídos pelos managers reais)
const MockAssetManager = {
  async preload() {
    console.log('[MockAssetManager] Assets pré-carregados');
  }
};

const MockAudioManager = {
  async init() {
    console.log('[MockAudioManager] Audio inicializado');
  }
};

const MockSaveManager = {
  async load() {
    console.log('[MockSaveManager] Nenhum save encontrado');
    return null;
  }
};

const MockUIManager = {
  async init() {
    console.log('[MockUIManager] UI inicializada');
  }
};

export default GameEngine;
