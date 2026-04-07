/**
 * Unit tests for EventBus.js
 */

import { EventBus } from '../../src/events/EventBus.js';

describe('EventBus', () => {
  beforeEach(() => {
    // Clear all listeners before each test
    EventBus.clear();
  });

  describe('on()', () => {
    it('should register a listener for an event', () => {
      const handler = jest.fn();
      EventBus.on('test:event', handler);

      EventBus.emit('test:event');
      expect(handler).toHaveBeenCalled();
    });

    it('should register multiple listeners for same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      EventBus.on('test:event', handler1);
      EventBus.on('test:event', handler2);

      EventBus.emit('test:event');
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should call listener with event data', () => {
      const handler = jest.fn();
      const data = { value: 42, name: 'test' };

      EventBus.on('test:event', handler);
      EventBus.emit('test:event', data);

      expect(handler).toHaveBeenCalledWith(data);
    });
  });

  describe('off()', () => {
    it('should remove a listener', () => {
      const handler = jest.fn();
      EventBus.on('test:event', handler);
      EventBus.off('test:event', handler);

      EventBus.emit('test:event');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should only remove specific listener', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      EventBus.on('test:event', handler1);
      EventBus.on('test:event', handler2);
      EventBus.off('test:event', handler1);

      EventBus.emit('test:event');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should not throw when removing non-existent listener', () => {
      const handler = jest.fn();
      expect(() => EventBus.off('test:event', handler)).not.toThrow();
    });
  });

  describe('once()', () => {
    it('should register listener that fires only once', () => {
      const handler = jest.fn();
      EventBus.once('test:event', handler);

      EventBus.emit('test:event');
      EventBus.emit('test:event');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should work with multiple once listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      EventBus.once('test:event', handler1);
      EventBus.once('test:event', handler2);

      EventBus.emit('test:event');
      EventBus.emit('test:event');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should pass data to once listener', () => {
      const handler = jest.fn();
      const data = { value: 42 };

      EventBus.once('test:event', handler);
      EventBus.emit('test:event', data);

      expect(handler).toHaveBeenCalledWith(data);
    });
  });

  describe('emit()', () => {
    it('should trigger all listeners for event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      EventBus.on('test:event', handler1);
      EventBus.on('test:event', handler2);
      EventBus.on('test:event', handler3);

      EventBus.emit('test:event');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });

    it('should not trigger listeners for different events', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      EventBus.on('event:a', handler1);
      EventBus.on('event:b', handler2);

      EventBus.emit('event:a');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should handle events with no listeners', () => {
      expect(() => EventBus.emit('unknown:event')).not.toThrow();
    });

    it('should emit events in order of registration', () => {
      const callOrder = [];
      const handler1 = () => callOrder.push(1);
      const handler2 = () => callOrder.push(2);
      const handler3 = () => callOrder.push(3);

      EventBus.on('test:event', handler1);
      EventBus.on('test:event', handler2);
      EventBus.on('test:event', handler3);

      EventBus.emit('test:event');

      expect(callOrder).toEqual([1, 2, 3]);
    });
  });

  describe('error handling', () => {
    it('should handle listener errors gracefully', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Test error');
      });
      const goodHandler = jest.fn();

      EventBus.on('test:event', errorHandler);
      EventBus.on('test:event', goodHandler);

      // Emit should not throw, but others should still be called
      expect(() => EventBus.emit('test:event')).not.toThrow();
      expect(errorHandler).toHaveBeenCalled();
      expect(goodHandler).toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    it('should remove all listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      EventBus.on('event:a', handler1);
      EventBus.on('event:b', handler2);
      EventBus.on('event:c', handler3);

      EventBus.clear();

      EventBus.emit('event:a');
      EventBus.emit('event:b');
      EventBus.emit('event:c');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).not.toHaveBeenCalled();
    });
  });

  describe('real game events', () => {
    it('should handle game initialization sequence', () => {
      const initHandler = jest.fn();
      const stateChangeHandler = jest.fn();
      const roundStartHandler = jest.fn();

      EventBus.on('game:initialized', initHandler);
      EventBus.on('game:state-changed', stateChangeHandler);
      EventBus.on('game:round-started', roundStartHandler);

      EventBus.emit('game:initialized');
      expect(initHandler).toHaveBeenCalled();

      EventBus.emit('game:state-changed', { from: 'MENU', to: 'SHOP' });
      expect(stateChangeHandler).toHaveBeenCalledWith({
        from: 'MENU',
        to: 'SHOP',
      });

      EventBus.emit('game:round-started');
      expect(roundStartHandler).toHaveBeenCalled();
    });

    it('should handle card drawn sequence', () => {
      const cardDrawnHandler = jest.fn();
      const cardRevealedHandler = jest.fn();

      EventBus.on('card:drawn', cardDrawnHandler);
      EventBus.on('card:revealed', cardRevealedHandler);

      EventBus.emit('card:drawn', { who: 'player', card: { rank: '5' } });
      EventBus.emit('card:drawn', { who: 'dealer', card: { rank: 'K' } });
      EventBus.emit('card:revealed', { index: 1 });

      expect(cardDrawnHandler).toHaveBeenCalledTimes(2);
      expect(cardRevealedHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle round result', () => {
      const resultHandler = jest.fn();

      EventBus.on('game:round-result', resultHandler);

      const result = {
        result: 'win',
        gain: 435,
        playerValue: 21,
        dealerValue: 19,
      };

      EventBus.emit('game:round-result', result);

      expect(resultHandler).toHaveBeenCalledWith(result);
    });
  });

  describe('listener management', () => {
    it('should return listener count', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      expect(EventBus.listenerCount('test:event')).toBe(0);

      EventBus.on('test:event', handler1);
      expect(EventBus.listenerCount('test:event')).toBe(1);

      EventBus.on('test:event', handler2);
      expect(EventBus.listenerCount('test:event')).toBe(2);

      EventBus.off('test:event', handler1);
      expect(EventBus.listenerCount('test:event')).toBe(1);
    });
  });
});
