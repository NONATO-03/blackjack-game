/**
 * Main - Entry point da aplicação
 * Inicializa GameEngine, UIManager e conecta listeners
 */

import { GameEngine } from './game/GameEngine.js';
import { EventBus } from './events/EventBus.js';
import { GameState } from './game/GameState.js';
import { UIManager } from './ui/UIManager.js';
import { AssetManager } from './assets/AssetManager.js';
import { SaveManager } from './storage/SaveManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { SoundBank } from './audio/SoundBank.js';
import { Player } from './entities/Player.js';
import { Dealer } from './entities/Dealer.js';
import { RoundManager } from './game/RoundManager.js';

/**
 * Inicializa a aplicação
 */
async function initializeApp() {
  console.log('=== BLACKJACK GAME ENGINE INITIALIZE ===');

  try {
    const engine = GameEngine.getInstance();
    const uiManager = UIManager.getInstance();
    const assetManager = AssetManager.getInstance();
    const saveManager = SaveManager.getInstance();
    const audioManager = AudioManager.getInstance();

    // Inicializar UI primeiro (vai mostrar loading)
    await uiManager.init();

    // Pré-carregar assets
    console.log('[Main] Pré-carregando assets...');
    await assetManager.preload();

    // Inicializar áudio
    console.log('[Main] Inicializando áudio...');
    await audioManager.init(SoundBank);

    // Inicializar SaveManager (carrega save anterior se existir)
    await saveManager.init();

    // Configurar listeners de eventos globais
    setupGlobalListeners();

    // Inicializar engine
    await engine.init();

    // Restaurar jogador do save ou criar novo
    const savedPlayer = saveManager.loadPlayer();
    const player = savedPlayer ? Player.fromJSON(savedPlayer) : new Player('Jogador');

    engine.setGameEntities(player, null);

    console.log('✓ Aplicação inicializada com sucesso');
  } catch (error) {
    console.error('✗ Erro ao inicializar aplicação:', error);
    EventBus.emit('app:init-error', { error });
  }
}

/**
 * Configura listeners de eventos globais para debug e game flow
 */
function setupGlobalListeners() {
  EventBus.on('game:initialized', (data) => {
    console.log('📌 Evento: game:initialized', data);
  });

  EventBus.on('game:state-changed', (data) => {
    console.log(`📌 Evento: game:state-changed (${data.from} → ${data.to})`);
  });

  EventBus.on('game:round-started', (data) => {
    console.log('📌 Evento: game:round-started', data);
  });

  EventBus.on('game:round-finished', () => {
    console.log('📌 Evento: game:round-finished');
  });

  EventBus.on('game:round-result', (data) => {
    console.log('📌 Evento: game:round-result', data);
  });

  // UI Events
  EventBus.on('ui:player-action', (data) => {
    const engine = GameEngine.getInstance();
    if (data.action === 'hit') {
      engine.playerHit();
    } else if (data.action === 'stand') {
      engine.playerStand();
    }
  });

  EventBus.on('ui:start-round-clicked', () => {
    const engine = GameEngine.getInstance();
    const player = engine.player;

    if (player && player.balance >= 300) {
      engine.startRound();
    } else {
      console.warn('Saldo insuficiente para apostar');
      EventBus.emit('ui:show-notification', {
        message: 'Saldo insuficiente para apostar!',
        type: 'warning'
      });
    }
  });

  EventBus.on('ui:shop-buy-item', (data) => {
    const engine = GameEngine.getInstance();
    const player = engine.player;

    try {
      player.buyItem(data.item);
    } catch (error) {
      console.warn('Erro ao comprar item:', error.message);
      EventBus.emit('ui:show-notification', {
        message: error.message,
        type: 'warning'
      });
    }
  });

  EventBus.on('ui:next-round-clicked', () => {
    const engine = GameEngine.getInstance();
    engine.finishRound();
  });

  EventBus.on('ui:return-shop-clicked', () => {
    const engine = GameEngine.getInstance();
    engine.finishRound();
  });

  // Auto-save triggering
  EventBus.on('save:auto-save-triggered', () => {
    const engine = GameEngine.getInstance();
    if (engine.player) {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        player: engine.player,
        state: engine.state,
        totalRounds: 0
      });
    }
  });

  console.log('[Main] Global listeners configurados');
}

/**
 * Bootstrap - Espera o DOM estar pronto antes de inicializar
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM já está pronto
  initializeApp();
}

// Export para console debugging
window.__GameEngine = GameEngine;
window.__EventBus = EventBus;
window.__AssetManager = AssetManager;
window.__SaveManager = SaveManager;
window.__AudioManager = AudioManager;
console.log('✓ Debug: window.__GameEngine, window.__AssetManager, window.__SaveManager, window.__AudioManager, window.__EventBus disponíveis');
