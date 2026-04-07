/**
 * Unit tests for Hand.js
 */

import { Hand } from '../../src/core/Hand.js';
import {
  createCard,
  createHand,
  createBlackjackHand,
  createBustHand,
  createSoftAceHand,
  createMultiAceHand,
  HAND_VALUES,
} from '../fixtures/testData.js';

describe('Hand', () => {
  describe('constructor', () => {
    it('should create empty hand by default', () => {
      const hand = new Hand();
      expect(hand.length()).toBe(0);
    });

    it('should create hand with initial cards', () => {
      const card1 = createCard('5', 'H');
      const card2 = createCard('K', 'S');
      const hand = new Hand([card1, card2]);
      expect(hand.length()).toBe(2);
    });
  });

  describe('addCard()', () => {
    it('should add card to hand', () => {
      const hand = new Hand();
      const card = createCard('5', 'H');
      hand.addCard(card);
      expect(hand.length()).toBe(1);
    });

    it('should handle multiple cards', () => {
      const hand = new Hand();
      hand.addCard(createCard('5', 'H'));
      hand.addCard(createCard('K', 'S'));
      hand.addCard(createCard('A', 'D'));
      expect(hand.length()).toBe(3);
    });
  });

  describe('clear()', () => {
    it('should remove all cards', () => {
      const hand = createHand(
        createCard('5', 'H'),
        createCard('K', 'S'),
        createCard('A', 'D')
      );
      expect(hand.length()).toBe(3);
      hand.clear();
      expect(hand.length()).toBe(0);
    });
  });

  describe('length()', () => {
    it('should return correct number of cards', () => {
      const hand = new Hand();
      expect(hand.length()).toBe(0);
      hand.addCard(createCard('5', 'H'));
      expect(hand.length()).toBe(1);
      hand.addCard(createCard('K', 'S'));
      expect(hand.length()).toBe(2);
    });
  });

  describe('getCards()', () => {
    it('should return array of cards', () => {
      const card1 = createCard('5', 'H');
      const card2 = createCard('K', 'S');
      const hand = createHand(card1, card2);
      const cards = hand.getCards();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(2);
    });

    it('should return frozen copy (immutable)', () => {
      const hand = createHand(createCard('5', 'H'));
      const cards = hand.getCards();
      expect(() => {
        cards.push(createCard('K', 'S'));
      }).toThrow();
    });
  });

  describe('value()', () => {
    it('should calculate correct value for simple hands', () => {
      const hand = createHand(createCard('2', 'H'), createCard('3', 'S'));
      expect(hand.value()).toBe(5);
    });

    it('should calculate correct value for face cards', () => {
      const hand = createHand(createCard('K', 'H'), createCard('Q', 'S'));
      expect(hand.value()).toBe(20);
    });

    it('should calculate blackjack (21)', () => {
      const hand = createBlackjackHand();
      expect(hand.value()).toBe(21);
    });

    it('should handle soft aces correctly', () => {
      const hand = createSoftAceHand(); // A + 6 = 17
      expect(hand.value()).toBe(17);
    });

    it('should handle multiple aces', () => {
      const hand = createMultiAceHand(); // A + A + 9 = 21 (counted as 1+1+9)
      expect(hand.value()).toBe(21);
    });

    it('should reduce aces when hand would bust', () => {
      const hand = createHand(
        createCard('A', 'H'),
        createCard('A', 'S'),
        createCard('A', 'D'),
        createCard('8', 'C')
      );
      // Sum would be 11+11+11+8 = 41, but aces reduce: 1+1+1+8 = 11
      expect(hand.value()).toBe(11);
    });

    HAND_VALUES.forEach(testData => {
      it(`should correctly calculate: ${testData.description}`, () => {
        const cards = testData.cards.map(rank => createCard(rank, 'H'));
        const hand = createHand(...cards);
        expect(hand.value()).toBe(testData.expectedValue);
      });
    });
  });

  describe('isBust()', () => {
    it('should return false for value <= 21', () => {
      const hand = createBlackjackHand();
      expect(hand.isBust()).toBe(false);
    });

    it('should return true for value > 21', () => {
      const hand = createBustHand();
      expect(hand.isBust()).toBe(true);
    });

    it('should detect bust on exactly 22', () => {
      const hand = createHand(
        createCard('K', 'H'),
        createCard('Q', 'S'),
        createCard('2', 'D')
      );
      expect(hand.isBust()).toBe(true);
    });
  });

  describe('isBlackjack()', () => {
    it('should return true for 21 with 2 cards', () => {
      const hand = createBlackjackHand();
      expect(hand.isBlackjack()).toBe(true);
    });

    it('should return false for 21 with 3+ cards', () => {
      const hand = createHand(
        createCard('10', 'H'),
        createCard('5', 'S'),
        createCard('6', 'D')
      );
      expect(hand.isBlackjack()).toBe(false);
    });

    it('should return false for value != 21', () => {
      const hand = createHand(createCard('10', 'H'), createCard('9', 'S'));
      expect(hand.isBlackjack()).toBe(false);
    });
  });

  describe('hasSoftAce()', () => {
    it('should return true when ace can count as 11', () => {
      const hand = createSoftAceHand(); // A + 6
      expect(hand.hasSoftAce()).toBe(true);
    });

    it('should return false when no aces', () => {
      const hand = createHand(createCard('10', 'H'), createCard('5', 'S'));
      expect(hand.hasSoftAce()).toBe(false);
    });

    it('should return false when hand value > 11', () => {
      const hand = createHand(createCard('A', 'H'), createCard('K', 'S'));
      expect(hand.hasSoftAce()).toBe(false); // A counts as 1, making 11 total
    });

    it('should return true for soft 17', () => {
      const hand = createHand(createCard('A', 'H'), createCard('6', 'S'));
      expect(hand.value()).toBe(17);
      expect(hand.hasSoftAce()).toBe(true);
    });
  });
});
