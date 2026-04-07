/**
 * EventBus - Pub/Sub central para desacoplamento de eventos
 * Singleton pattern para permitir comunicação entre componentes
 *
 * @example
 * // Listen to event
 * EventBus.on('game:round-started', ({ player, dealer }) => {
 *   console.log('Round started!');
 * });
 *
 * // Emit event
 * EventBus.emit('game:round-started', { player, dealer });
 */

class EventBus {
  static #instance = null;
  #listeners = new Map();

  static getInstance() {
    if (!EventBus.#instance) {
      EventBus.#instance = new EventBus();
    }
    return EventBus.#instance;
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Event identifier
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, []);
    }

    this.#listeners.get(eventName).push(callback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to event once (auto-unsubscribe after first emit)
   * @param {string} eventName - Event identifier
   * @param {Function} callback - Handler function
   */
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (data) => {
      callback(data);
      unsubscribe();
    });
  }

  /**
   * Unsubscribe from event
   * @param {string} eventName - Event identifier
   * @param {Function} callback - Handler to remove
   */
  off(eventName, callback) {
    if (!this.#listeners.has(eventName)) return;

    const callbacks = this.#listeners.get(eventName);
    const index = callbacks.indexOf(callback);

    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.#listeners.delete(eventName);
    }
  }

  /**
   * Emit event to all subscribers
   * @param {string} eventName - Event identifier
   * @param {*} data - Event payload
   */
  emit(eventName, data = null) {
    if (!this.#listeners.has(eventName)) return;

    const callbacks = this.#listeners.get(eventName);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   * @param {string} eventName - Event identifier (optional)
   */
  clear(eventName = null) {
    if (eventName) {
      this.#listeners.delete(eventName);
    } else {
      this.#listeners.clear();
    }
  }

  /**
   * Get count of listeners for debugging
   * @param {string} eventName - Event identifier (optional)
   * @returns {number} Listener count
   */
  listenerCount(eventName = null) {
    if (eventName) {
      return this.#listeners.has(eventName) ? this.#listeners.get(eventName).length : 0;
    }
    return this.#listeners.size;
  }

  /**
   * Get all registered event names
   * @returns {string[]} Event names
   */
  eventNames() {
    return Array.from(this.#listeners.keys());
  }
}

// Export singleton instance
export const EventBus = EventBus.getInstance();
export default EventBus;
