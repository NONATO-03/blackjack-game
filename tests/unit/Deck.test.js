/**
 * Unit tests for Deck.js
 */

import { Deck } from '../../src/core/Deck.js';
import { VALID_RANKS, VALID_SUITS } from '../fixtures/testData.js';

describe('Deck', () => {
  describe('constructor', () => {
    it('should create deck with 52 cards', () => {
      const deck = new Deck();
      expect(deck.cardsRemaining()).toBe(52);
    });

    it('should have all ranks and suits represented', () => {
      const deck = new Deck();
      const cards = deck.getCards();

      // Should have 4 of each rank (one per suit)
      VALID_RANKS.forEach(rank => {
        const matching = cards.filter(c => c.rank === rank);
        expect(matching.length).toBe(4);
      });
    });
  });

  describe('cardsRemaining()', () => {
    it('should return 52 for fresh deck', () => {
      const deck = new Deck();
      expect(deck.cardsRemaining()).toBe(52);
    });

    it('should decrease after drawing', () => {
      const deck = new Deck();
      expect(deck.cardsRemaining()).toBe(52);
      deck.draw();
      expect(deck.cardsRemaining()).toBe(51);
      deck.draw();
      expect(deck.cardsRemaining()).toBe(50);
    });
  });

  describe('draw()', () => {
    it('should return a card', () => {
      const deck = new Deck();
      const card = deck.draw();
      expect(card).not.toBe(null);
      expect(card.rank).toBeDefined();
      expect(card.suit).toBeDefined();
    });

    it('should decrease remaining card count', () => {
      const deck = new Deck();
      const before = deck.cardsRemaining();
      deck.draw();
      const after = deck.cardsRemaining();
      expect(after).toBe(before - 1);
    });

    it('should return same card object each time for same position', () => {
      const deck1 = new Deck();
      const card1 = deck1.draw();

      const deck2 = new Deck();
      const card2 = deck2.draw();

      expect(card1.rank).toBe(card2.rank);
      expect(card1.suit).toBe(card2.suit);
    });

    it('should auto-reload when depleted', () => {
      const deck = new Deck();
      // Draw all 52 cards
      for (let i = 0; i < 52; i++) {
        deck.draw();
      }
      expect(deck.cardsRemaining()).toBe(0);

      // Next draw should trigger reload
      const card = deck.draw();
      expect(card).not.toBe(null);
      expect(deck.cardsRemaining()).toBe(51);
    });
  });

  describe('reset()', () => {
    it('should restore deck to 52 cards', () => {
      const deck = new Deck();
      deck.draw();
      deck.draw();
      expect(deck.cardsRemaining()).toBe(50);

      deck.reset();
      expect(deck.cardsRemaining()).toBe(52);
    });

    it('should restore all original cards', () => {
      const deck = new Deck();
      deck.draw();
      deck.draw();
      deck.reset();

      const cards = deck.getCards();
      expect(cards.length).toBe(52);

      // Verify all ranks/suits present
      VALID_RANKS.forEach(rank => {
        const matching = cards.filter(c => c.rank === rank);
        expect(matching.length).toBe(4);
      });
    });
  });

  describe('shuffle()', () => {
    it('should change card order', () => {
      const deck1 = new Deck();
      const order1 = deck1.getCards().map(c => c.toString());

      deck1.shuffle();
      const order2 = deck1.getCards().map(c => c.toString());

      // Check that order changed (very unlikely to be identical after shuffle)
      const identical = order1.every((c, i) => c === order2[i]);
      expect(identical).toBe(false);
    });

    it('should preserve all cards during shuffle', () => {
      const deck = new Deck();
      deck.shuffle();
      expect(deck.cardsRemaining()).toBe(52);

      const cards = deck.getCards();
      expect(cards.length).toBe(52);

      VALID_RANKS.forEach(rank => {
        const matching = cards.filter(c => c.rank === rank);
        expect(matching.length).toBe(4);
      });
    });

    it('should produce different shuffles', () => {
      const deck1 = new Deck();
      deck1.shuffle();
      const order1 = deck1.getCards().map(c => c.toString());

      const deck2 = new Deck();
      deck2.shuffle();
      const order2 = deck2.getCards().map(c => c.toString());

      // Two shuffles should produce different orders (statistically)
      const identical = order1.every((c, i) => c === order2[i]);
      expect(identical).toBe(false);
    });
  });

  describe('getCards()', () => {
    it('should return array of all remaining cards', () => {
      const deck = new Deck();
      const cards = deck.getCards();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(52);
    });

    it('should reflect cards after draw', () => {
      const deck = new Deck();
      expect(deck.getCards().length).toBe(52);
      deck.draw();
      expect(deck.getCards().length).toBe(51);
      deck.draw();
      expect(deck.getCards().length).toBe(50);
    });
  });

  describe('integration', () => {
    it('should handle typical round flow', () => {
      const deck = new Deck();
      deck.shuffle();

      // Deal 4 cards (2 to dealer, 2 to player)
      const dealerCard1 = deck.draw();
      const playerCard1 = deck.draw();
      const dealerCard2 = deck.draw();
      const playerCard2 = deck.draw();

      expect(deck.cardsRemaining()).toBe(48);
      expect(dealerCard1).toBeDefined();
      expect(playerCard1).toBeDefined();
      expect(dealerCard2).toBeDefined();
      expect(playerCard2).toBeDefined();
    });

    it('should handle continuous rounds', () => {
      const deck = new Deck();

      for (let round = 0; round < 3; round++) {
        deck.shuffle();

        // Simulate short round
        deck.draw(); // dealer card 1
        deck.draw(); // player card 1
        deck.draw(); // dealer card 2
        deck.draw(); // player card 2

        expect(deck.cardsRemaining()).toBeGreaterThan(0);
        deck.reset();
      }
    });
  });
});
