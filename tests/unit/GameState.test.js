/**
 * Unit tests for GameState.js
 */

import { GameState } from '../../src/game/GameState.js';
import {
  GAME_STATES,
  VALID_TRANSITIONS,
  INVALID_TRANSITIONS,
} from '../fixtures/testData.js';

describe('GameState (FSM)', () => {
  describe('states', () => {
    it('should have all required states defined', () => {
      Object.values(GAME_STATES).forEach(state => {
        expect(GameState[state]).toBeDefined();
        expect(GameState[state]).toBe(state);
      });
    });

    it('should have MENU as initial state', () => {
      expect(GameState.MENU).toBe('MENU');
    });

    it('should have exactly 6 states', () => {
      const states = Object.keys(GameState).filter(
        key => typeof GameState[key] === 'string'
      );
      expect(states.length).toBe(6);
    });
  });

  describe('isValidTransition()', () => {
    it('should allow all valid transitions', () => {
      VALID_TRANSITIONS.forEach(({ from, to }) => {
        expect(GameState.isValidTransition(from, to)).toBe(true);
      });
    });

    it('should reject all invalid transitions', () => {
      INVALID_TRANSITIONS.forEach(({ from, to }) => {
        expect(GameState.isValidTransition(from, to)).toBe(false);
      });
    });

    it('should not allow transition to self', () => {
      Object.values(GAME_STATES).forEach(state => {
        expect(GameState.isValidTransition(state, state)).toBe(false);
      });
    });

    it('should return false for undefined states', () => {
      expect(GameState.isValidTransition('MENU', 'INVALID')).toBe(false);
      expect(GameState.isValidTransition('INVALID', 'MENU')).toBe(false);
      expect(GameState.isValidTransition('INVALID', 'INVALID')).toBe(false);
    });
  });

  describe('getValidNextStates()', () => {
    it('should return array for valid state', () => {
      const nextStates = GameState.getValidNextStates('MENU');
      expect(Array.isArray(nextStates)).toBe(true);
    });

    it('should return empty array for invalid state', () => {
      const nextStates = GameState.getValidNextStates('INVALID');
      expect(Array.isArray(nextStates)).toBe(true);
      expect(nextStates.length).toBe(0);
    });

    it('should return correct transitions for MENU', () => {
      const nextStates = GameState.getValidNextStates('MENU');
      expect(nextStates).toContain('SHOP');
      expect(nextStates.length).toBeGreaterThan(0);
    });

    it('should return SHOP as only valid next from BETTING', () => {
      const nextStates = GameState.getValidNextStates('BETTING');
      expect(nextStates).toContain('PLAYER_TURN');
    });

    it('should allow multiple next states from PLAYER_TURN', () => {
      const nextStates = GameState.getValidNextStates('PLAYER_TURN');
      expect(nextStates.length).toBeGreaterThanOrEqual(2);
      expect(nextStates).toContain('DEALER_TURN');
      expect(nextStates).toContain('RESULT');
    });

    it('should return SHOP as next from RESULT', () => {
      const nextStates = GameState.getValidNextStates('RESULT');
      expect(nextStates).toContain('SHOP');
    });
  });

  describe('game flow validation', () => {
    it('should validate complete game loop', () => {
      const sequence = [
        'MENU',
        'SHOP',
        'BETTING',
        'PLAYER_TURN',
        'DEALER_TURN',
        'RESULT',
        'SHOP',
      ];

      for (let i = 0; i < sequence.length - 1; i++) {
        const from = sequence[i];
        const to = sequence[i + 1];
        expect(GameState.isValidTransition(from, to)).toBe(true);
      }
    });

    it('should validate player bust path', () => {
      const sequence = [
        'MENU',
        'SHOP',
        'BETTING',
        'PLAYER_TURN',
        'RESULT', // Direct to result on bust
        'SHOP',
      ];

      for (let i = 0; i < sequence.length - 1; i++) {
        const from = sequence[i];
        const to = sequence[i + 1];
        expect(GameState.isValidTransition(from, to)).toBe(true);
      }
    });

    it('should prevent skip from BETTING to RESULT', () => {
      expect(
        GameState.isValidTransition('BETTING', 'RESULT')
      ).toBe(false);
    });

    it('should prevent skip from PLAYER_TURN to SHOP', () => {
      expect(
        GameState.isValidTransition('PLAYER_TURN', 'SHOP')
      ).toBe(false);
    });
  });
});
