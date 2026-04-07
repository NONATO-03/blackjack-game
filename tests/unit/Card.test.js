/**
 * Unit tests for Card.js
 */

import { Card } from '../../src/core/Card.js';
import {
  VALID_RANKS,
  VALID_SUITS,
  INVALID_RANKS,
  INVALID_SUITS,
} from '../fixtures/testData.js';

describe('Card', () => {
  describe('constructor', () => {
    it('should create a valid card with correct rank and suit', () => {
      const card = new Card('5', 'H');
      expect(card.rank).toBe('5');
      expect(card.suit).toBe('H');
    });

    it('should accept all valid ranks', () => {
      VALID_RANKS.forEach(rank => {
        expect(() => new Card(rank, 'H')).not.toThrow();
      });
    });

    it('should accept all valid suits', () => {
      VALID_SUITS.forEach(suit => {
        expect(() => new Card('5', suit)).not.toThrow();
      });
    });

    it('should throw on invalid rank', () => {
      INVALID_RANKS.forEach(rank => {
        expect(() => new Card(rank, 'H')).toThrow(`Invalid rank: ${rank}`);
      });
    });

    it('should throw on invalid suit', () => {
      INVALID_SUITS.forEach(suit => {
        expect(() => new Card('5', suit)).toThrow(`Invalid suit: ${suit}`);
      });
    });

    it('should initialize isNew as false', () => {
      const card = new Card('5', 'H');
      expect(card.isNew).toBe(false);
    });
  });

  describe('value computation', () => {
    it('should compute correct value for number cards', () => {
      expect(new Card('2', 'H').value).toBe(2);
      expect(new Card('5', 'H').value).toBe(5);
      expect(new Card('10', 'H').value).toBe(10);
    });

    it('should compute value 10 for face cards', () => {
      expect(new Card('J', 'H').value).toBe(10);
      expect(new Card('Q', 'S').value).toBe(10);
      expect(new Card('K', 'D').value).toBe(10);
    });

    it('should compute value 11 for Aces', () => {
      expect(new Card('A', 'H').value).toBe(11);
      expect(new Card('A', 'S').value).toBe(11);
    });
  });

  describe('isAce()', () => {
    it('should return true for Aces', () => {
      const ace = new Card('A', 'H');
      expect(ace.isAce()).toBe(true);
    });

    it('should return false for non-Ace cards', () => {
      const cards = [
        new Card('2', 'H'),
        new Card('K', 'H'),
        new Card('5', 'D'),
        new Card('10', 'S'),
      ];
      cards.forEach(card => {
        expect(card.isAce()).toBe(false);
      });
    });
  });

  describe('isFace()', () => {
    it('should return true for face cards', () => {
      expect(new Card('J', 'H').isFace()).toBe(true);
      expect(new Card('Q', 'S').isFace()).toBe(true);
      expect(new Card('K', 'D').isFace()).toBe(true);
    });

    it('should return false for non-face cards', () => {
      const cards = [
        new Card('2', 'H'),
        new Card('5', 'H'),
        new Card('10', 'H'),
        new Card('A', 'H'),
      ];
      cards.forEach(card => {
        expect(card.isFace()).toBe(false);
      });
    });
  });

  describe('toString()', () => {
    it('should return correct string representation', () => {
      expect(new Card('5', 'H').toString()).toBe('5H');
      expect(new Card('K', 'S').toString()).toBe('KS');
      expect(new Card('A', 'D').toString()).toBe('AD');
      expect(new Card('10', 'C').toString()).toBe('10C');
    });
  });

  describe('immutability', () => {
    it('should not allow rank modification', () => {
      const card = new Card('5', 'H');
      expect(() => {
        card.rank = '10';
      }).toThrow(); // Depending on how Card is written, this might not throw
      // But value should not change
    });
  });
});
