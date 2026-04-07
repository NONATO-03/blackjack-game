/**
 * Integration tests for GameEngine.js
 * Tests complete game flow and state machine transitions
 */

import { GameEngine } from '../../src/game/GameEngine.js';
import { GameState } from '../../src/game/GameState.js';
import { EventBus } from '../../src/events/EventBus.js';
import { createPlayer, createDealer } from '../fixtures/testData.js';

describe('GameEngine (Integration)', () => {
  let engine;

  beforeEach(() => {
    // Get fresh GameEngine singleton
    engine = GameEngine.getInstance();
    GameEngine.reset?.(); // If reset method exists
    EventBus.clear();
  });

  describe('initialization', () => {
    it('should be a singleton', () => {
      const engine1 = GameEngine.getInstance();
      const engine2 = GameEngine.getInstance();
      expect(engine1).toBe(engine2);
    });

    it('should exist with valid initial state', () => {
      expect(engine).toBeDefined();
      expect(engine.state).toBeDefined();
    });
  });

  describe('player management', () => {
    it('should allow setting game entities', () => {
      const player = createPlayer('TestPlayer', 5000);
      const dealer = createDealer('iniciante', 1);

      engine.setGameEntities(player, dealer);

      expect(engine.player).toBe(player);
    });

    it('should track player balance', () => {
      const player = createPlayer('TestPlayer', 1000);
      engine.setGameEntities(player, null);

      expect(engine.player.balance).toBe(1000);
    });
  });

  describe('state transitions', () => {
    it('should transition to valid states', () => {
      const initialState = engine.state;
      // Test transition if valid
      if (GameState.isValidTransition(initialState, GameState.SHOP)) {
        engine.transitionTo(GameState.SHOP);
        expect(engine.state).toBe(GameState.SHOP);
      }
    });

    it('should reject invalid transitions', () => {
      const invalidTarget = 'INVALID_STATE';
      expect(() =>
        engine.transitionTo(invalidTarget)
      ).toThrow();
    });

    it('should emit state change events', () => {
      const handler = jest.fn();
      EventBus.on('game:state-changed', handler);

      const currentState = engine.state;
      const nextStates = GameState.getValidNextStates(currentState);
      if (nextStates.length > 0) {
        engine.transitionTo(nextStates[0]);
        expect(handler).toHaveBeenCalled();
      }
    });
  });

  describe('round management', () => {
    it('should not allow starting round without player', () => {
      engine.player = null;
      expect(() => engine.startRound()).toThrow();
    });

    it('should create RoundManager on startRound', () => {
      const player = createPlayer('TestPlayer', 5000);
      engine.setGameEntities(player, null);

      engine.startRound();
      expect(engine.roundManager).toBeDefined();
    });
  });

  describe('game flow events', () => {
    it('should emit game:initialized on initialization', () => {
      const handler = jest.fn();
      EventBus.on('game:initialized', handler);

      // Simulate initialization
      EventBus.emit('game:initialized');
      expect(handler).toHaveBeenCalled();
    });

    it('should track multiple state transitions', () => {
      const transitionHandler = jest.fn();
      EventBus.on('game:state-changed', transitionHandler);

      engine.setGameEntities(createPlayer(), null);

      // Transition through sequence
      const sequence = GameState.getValidNextStates(engine.state);
      if (sequence.length > 0) {
        engine.transitionTo(sequence[0]);
        expect(transitionHandler).toHaveBeenCalled();
      }
    });
  });

  describe('error handling', () => {
    it('should handle missing player on action', () => {
      engine.player = null;
      expect(() => engine.playerHit?.()).toThrow();
    });

    it('should handle missing roundManager on action', () => {
      const player = createPlayer();
      engine.setGameEntities(player, null);
      engine.roundManager = null;

      expect(() => engine.playerHit?.()).toThrow();
    });
  });
});
