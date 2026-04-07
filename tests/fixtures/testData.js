/**
 * Test Fixtures - Reusable test data and builders
 */

import { Card } from '../src/core/Card.js';
import { Hand } from '../src/core/Hand.js';
import { Deck } from '../src/core/Deck.js';
import { Player } from '../src/entities/Player.js';
import { Dealer } from '../src/entities/Dealer.js';

/**
 * Creates a card for testing
 */
export const createCard = (rank = '5', suit = 'H') => {
  return new Card(rank, suit);
};

/**
 * Creates a hand with specific cards
 */
export const createHand = (...cards) => {
  const hand = new Hand();
  cards.forEach(card => hand.addCard(card));
  return hand;
};

/**
 * Creates a hand with value 21 (blackjack)
 */
export const createBlackjackHand = () => {
  const hand = new Hand();
  hand.addCard(new Card('A', 'H'));
  hand.addCard(new Card('K', 'S'));
  return hand;
};

/**
 * Creates a hand with bust (>21)
 */
export const createBustHand = () => {
  const hand = new Hand();
  hand.addCard(new Card('K', 'H'));
  hand.addCard(new Card('Q', 'S'));
  hand.addCard(new Card('5', 'D'));
  return hand;
};

/**
 * Creates a hand with soft ace (can be 11 without busting)
 */
export const createSoftAceHand = () => {
  const hand = new Hand();
  hand.addCard(new Card('A', 'H'));
  hand.addCard(new Card('6', 'S'));
  return hand;
};

/**
 * Creates a hand with multiple aces
 */
export const createMultiAceHand = () => {
  const hand = new Hand();
  hand.addCard(new Card('A', 'H'));
  hand.addCard(new Card('A', 'S'));
  hand.addCard(new Card('9', 'D'));
  return hand;
};

/**
 * Creates a new player for testing
 */
export const createPlayer = (name = 'TestPlayer', balance = 4000) => {
  const player = new Player(name);
  player.balance = balance;
  return player;
};

/**
 * Creates a new dealer for testing
 */
export const createDealer = (type = 'iniciante', difficulty = 1) => {
  return new Dealer(type, difficulty);
};

/**
 * Creates a fresh deck
 */
export const createDeck = () => {
  return new Deck();
};

/**
 * Test data sets for Card tests
 */
export const VALID_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const VALID_SUITS = ['H', 'D', 'C', 'S'];
export const INVALID_RANKS = ['1', '11', 'X', 'Joker', ''];
export const INVALID_SUITS = ['Hearts', 'X', 'Spades', ''];

/**
 * Test data sets for Hand value calculations
 */
export const HAND_VALUES = [
  { cards: ['2', '3'], expectedValue: 5, description: 'Simple sum' },
  { cards: ['K', 'Q'], expectedValue: 20, description: 'Face cards' },
  { cards: ['A', 'K'], expectedValue: 21, description: 'Blackjack' },
  { cards: ['A', '5'], expectedValue: 16, description: 'Soft 16 (counted as 1+5)' },
  { cards: ['A', '6'], expectedValue: 17, description: 'Soft 17' },
  { cards: ['A', 'A', '9'], expectedValue: 21, description: 'Multiple aces (counted 1+1+9)' },
  { cards: ['K', 'Q', '5'], expectedValue: 25, description: 'Bust' },
];

/**
 * Game states for testing
 */
export const GAME_STATES = {
  MENU: 'MENU',
  SHOP: 'SHOP',
  BETTING: 'BETTING',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  RESULT: 'RESULT',
};

/**
 * Valid state transitions for testing
 */
export const VALID_TRANSITIONS = [
  { from: 'MENU', to: 'SHOP' },
  { from: 'SHOP', to: 'BETTING' },
  { from: 'BETTING', to: 'PLAYER_TURN' },
  { from: 'PLAYER_TURN', to: 'DEALER_TURN' },
  { from: 'PLAYER_TURN', to: 'RESULT' },
  { from: 'DEALER_TURN', to: 'RESULT' },
  { from: 'RESULT', to: 'SHOP' },
];

/**
 * Invalid state transitions
 */
export const INVALID_TRANSITIONS = [
  { from: 'MENU', to: 'PLAYER_TURN' },
  { from: 'PLAYER_TURN', to: 'MENU' },
  { from: 'RESULT', to: 'BETTING' },
  { from: 'SHOP', to: 'DEALER_TURN' },
];

/**
 * Sample event payloads for testing
 */
export const EVENT_PAYLOADS = {
  cardDrawn: {
    who: 'player',
    card: createCard('5', 'H'),
  },
  gameRoundResult: {
    result: 'win',
    gain: 435,
    playerValue: 21,
    dealerValue: 19,
  },
  playerBalanceChanged: {
    newBalance: 4435,
    delta: 435,
  },
};

export default {
  createCard,
  createHand,
  createBlackjackHand,
  createBustHand,
  createSoftAceHand,
  createMultiAceHand,
  createPlayer,
  createDealer,
  createDeck,
  VALID_RANKS,
  VALID_SUITS,
  INVALID_RANKS,
  INVALID_SUITS,
  HAND_VALUES,
  GAME_STATES,
  VALID_TRANSITIONS,
  INVALID_TRANSITIONS,
  EVENT_PAYLOADS,
};
