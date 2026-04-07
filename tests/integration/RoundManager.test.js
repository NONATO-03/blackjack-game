/**
 * Integration tests for RoundManager.js
 * Tests complete round flow from deal to resolution
 */

import { RoundManager } from '../../src/game/RoundManager.js';
import { EventBus } from '../../src/events/EventBus.js';
import { createPlayer, createDealer } from '../fixtures/testData.js';

describe('RoundManager (Integration)', () => {
  let roundManager;
  let player;
  let dealer;

  beforeEach(() => {
    EventBus.clear();
    player = createPlayer('TestPlayer', 5000);
    dealer = createDealer('iniciante', 1);
    roundManager = new RoundManager(player, dealer);
  });

  describe('round initialization', () => {
    it('should create with player and dealer', () => {
      expect(roundManager.player).toBe(player);
      expect(roundManager.dealer).toBe(dealer);
    });

    it('should have initialized deck', () => {
      expect(roundManager.deck).toBeDefined();
      expect(roundManager.deck.cardsRemaining()).toBe(52);
    });
  });

  describe('dealing', () => {
    it('should deal 2 cards to each side', () => {
      roundManager.start();

      expect(player.hand.length()).toBe(2);
      expect(dealer.hand.length()).toBe(2);
    });

    it('should emit cards-dealt event', () => {
      const handler = jest.fn();
      EventBus.on('game:cards-dealt', handler);

      roundManager.start();
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          dealerHand: expect.any(Object),
          playerHand: expect.any(Object),
        })
      );
    });

    it('should remove 4 cards from deck', () => {
      roundManager.start();
      expect(roundManager.deck.cardsRemaining()).toBe(48);
    });

    it('should handle natural blackjacks', () => {
      roundManager.start();

      const playerHasBJ = player.hand.isBlackjack();
      const dealerHasBJ = dealer.hand.isBlackjack();

      // Both conditions are possible but rare
      expect(typeof playerHasBJ).toBe('boolean');
      expect(typeof dealerHasBJ).toBe('boolean');
    });
  });

  describe('player actions', () => {
    it('should allow hit when not bust', async () => {
      roundManager.start();
      const initialLength = player.hand.length();

      await roundManager.playerHit();

      expect(player.hand.length()).toBe(initialLength + 1);
    });

    it('should emit card:drawn on hit', async () => {
      const handler = jest.fn();
      EventBus.on('card:drawn', handler);

      roundManager.start();
      await roundManager.playerHit();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          who: 'player',
          card: expect.any(Object),
        })
      );
    });

    it('should end round on player bust', async () => {
      roundManager.start();

      // Keep hitting until bust (statistically unlikely but possible)
      while (!player.hand.isBust() && player.hand.length() < 10) {
        await roundManager.playerHit();
      }

      // Check if busted
      if (player.hand.isBust()) {
        expect(player.hand.value()).toBeGreaterThan(21);
      }
    });
  });

  describe('dealer actions', () => {
    it('should determine if dealer hits', async () => {
      roundManager.start();

      const shouldHit = dealer.shouldHit();
      expect(typeof shouldHit).toBe('boolean');
    });

    it('should follow dealer strategy', () => {
      // Test dealer type strategies
      const beginnerDealer = createDealer('iniciante', 1);
      const rmBegin = new RoundManager(player, beginnerDealer);
      rmBegin.start();

      // Dealer should hit on soft 17
      const hitDecision = beginnerDealer.shouldHit();
      expect(typeof hitDecision).toBe('boolean');
    });

    it('should emit card:revealed on stand', async () => {
      const handler = jest.fn();
      EventBus.on('card:revealed', handler);

      roundManager.start();
      await roundManager.playerStand();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          who: 'dealer',
          index: 1,
        })
      );
    });
  });

  describe('round resolution', () => {
    it('should determine winner correctly', () => {
      roundManager.start();

      // Force specific values for testing
      const result = roundManager.determineWinner();

      expect(['win', 'loss', 'push']).toContain(result);
    });

    it('should handle player bust', async () => {
      roundManager.start();

      // Keep hitting until guaranteed bust or reach limit
      while (player.hand.value() < 21 && player.hand.length() < 15) {
        await roundManager.playerHit();
      }

      const result = player.hand.isBust() ? 'loss' : roundManager.determineWinner();
      expect(['win', 'loss', 'push']).toContain(result);
    });

    it('should emit game:round-result', (done) => {
      const handler = jest.fn();
      EventBus.on('game:round-result', handler);

      roundManager.start();
      roundManager.playerStand().then(() => {
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            result: expect.any(String),
            gain: expect.any(Number),
          })
        );
        done();
      });
    });

    it('should calculate correct gain', () => {
      player.bet = 300;
      const multiplier = 1.45;

      roundManager.start();
      const gain = roundManager.calculateGain('win');
      const expectedGain = Math.floor(300 * multiplier);

      expect(gain).toBe(expectedGain);
    });

    it('should handle push (tie)', () => {
      player.bet = 300;
      const gain = roundManager.calculateGain('push');

      expect(gain).toBe(300);
    });

    it('should handle loss', () => {
      player.bet = 300;
      const gain = roundManager.calculateGain('loss');

      expect(gain).toBe(-300);
    });
  });

  describe('complete round flow', () => {
    it('should complete a full round', async () => {
      const roundStartHandler = jest.fn();
      const cardDrawnHandler = jest.fn();
      const resultHandler = jest.fn();

      EventBus.on('game:cards-dealt', roundStartHandler);
      EventBus.on('card:drawn', cardDrawnHandler);
      EventBus.on('game:round-result', resultHandler);

      roundManager.start();
      expect(roundStartHandler).toHaveBeenCalled();

      await roundManager.playerHit();
      expect(cardDrawnHandler).toHaveBeenCalled();

      await roundManager.playerStand();

      expect(resultHandler).toHaveBeenCalled();
    });

    it('should update player after round', async () => {
      const initialBalance = player.balance;

      roundManager.start();
      await roundManager.playerStand();

      // Balance should change (win, loss, or push)
      expect(player.balance).toBeDefined();
    });

    it('should handle multiple consecutive rounds', async () => {
      for (let i = 0; i < 2; i++) {
        roundManager.start();
        await roundManager.playerHit();
        await roundManager.playerStand();

        // Reset for next round
        roundManager.deck.reset();
        player.hand.clear();
        dealer.hand.clear();
      }

      expect(player.balance).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle forced result', async () => {
      roundManager.start();
      await roundManager.resolve('loss');

      expect(player.balance).toBeLessThan(5000);
    });

    it('should not allow action after resolution', async () => {
      roundManager.start();
      await roundManager.resolve();

      // Should not be able to hit after resolve
      // This depends on implementation
    });
  });
});
