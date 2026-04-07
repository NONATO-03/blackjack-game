/**
 * Global Constants - Configurações centralizadas
 */

export const GameConstants = {
  // Card properties
  SUITS: ['H', 'D', 'C', 'S'],
  SUIT_NAMES: {
    'H': 'Copas',
    'D': 'Ouros',
    'C': 'Paus',
    'S': 'Espadas'
  },

  RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],

  // Deck
  DECK_SIZE: 52,
  INITIAL_DECK_COUNT: 1, // Número de baralhos iniciais

  // Game
  STARTING_BALANCE: 4000,
  MINIMUM_BET: 100,
  MAXIMUM_BET: 5000,
  DEFAULT_BET: 300,

  // Payout
  BASE_PAYOUT_MULTIPLIER: 1.45, // Vitória paga 145% da aposta
  BLACKJACK_MULTIPLIER: 1.5,    // Blackjack paga 150%
  PUSH_REFUND: 1.0,             // Empate retorna aposta

  // Timings (em ms)
  CARD_DRAW_DELAY: 500,      // Delay entre cartas sendo sacadas
  DEALER_DELAY: 1000,        // Delay do turno dealer
  RESULT_ANIMATION_DELAY: 300, // Delay do painel de resultado
  SELLER_BLINK_SPEED: 150,   // Velocidade de piscada
  SELLER_TALK_SPEED: 200,    // Velocidade de fala
  SELLER_BREATHE_SPEED: 2000, // Velocidade de respiração

  // Log
  LOG_MAX_LINES: 14,

  // Shop
  SHOP_PAGE_SIZE: 6,
  SHOP_TABS: ['ITENS', 'MELHORIAS', 'BEBIDAS', 'OUTROS'],

  // CRT Effects
  CRT_WARP_SCALE: 46,
  CRT_WARP_PULSE_SPEED: 0.55,
  CRT_WARP_PULSE_AMOUNT: 1.8,

  // Version
  VERSION: '1.0.0-beta',
  BUILD_DATE: new Date().toISOString()
};

export const DealerTypes = {
  INITIANTE: 'iniciante',
  PROFISSIONAL: 'profissional',
  MAGO: 'mago',
  TUBARON: 'tubaron'
};

export const ItemCategories = {
  ITENS: 'ITENS',
  MELHORIAS: 'MELHORIAS',
  BEBIDAS: 'BEBIDAS',
  OUTROS: 'OUTROS'
};

export default GameConstants;
