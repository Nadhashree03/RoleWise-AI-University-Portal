// server/telemetry/telemetrySink.js
// Base Telemetry Sink Abstraction

export class BaseTelemetrySink {
  constructor(name = 'base-sink') {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  /**
   * Sends a validated telemetry event to the target sink.
   * @param {object} event - Sanitized canonical telemetry event
   * @returns {Promise<{ success: boolean, sink: string, messageId?: string, error?: string }>}
   */
  async send(event) {
    throw new Error('BaseTelemetrySink.send() must be implemented by subclass.');
  }

  async flush() {
    return Promise.resolve();
  }

  async close() {
    return Promise.resolve();
  }
}
