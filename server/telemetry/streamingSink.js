// server/telemetry/streamingSink.js
// Distributed Streaming Telemetry Sink supporting Apache Kafka and AWS Kinesis

import { BaseTelemetrySink } from './telemetrySink.js';

export class StreamingTelemetrySink extends BaseTelemetrySink {
  constructor(options = {}) {
    super('streaming');
    this.provider = (options.provider || process.env.TELEMETRY_STREAM_PROVIDER || 'kafka').toLowerCase();
    this.maxRetries = options.maxRetries ?? Number(process.env.STREAM_MAX_RETRIES || 3);
    this.retryDelayMs = options.retryDelayMs ?? Number(process.env.STREAM_RETRY_DELAY_MS || 50);

    // Kafka Config
    this.kafkaBrokers = options.kafkaBrokers || (process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092']);
    this.kafkaTopic = options.kafkaTopic || process.env.KAFKA_TOPIC || 'rolewise-telemetry-events';

    // Kinesis Config
    this.awsRegion = options.awsRegion || process.env.AWS_REGION || 'us-east-1';
    this.kinesisStreamName = options.kinesisStreamName || process.env.KINESIS_STREAM_NAME || 'rolewise-telemetry-stream';

    // Optional injected client for testing / custom transport
    this.injectedClient = options.client || null;
    this.client = null;
    this.producer = null;
  }

  async getClient() {
    if (this.injectedClient) {
      return this.injectedClient;
    }

    if (this.client) {
      return this.client;
    }

    if (this.provider === 'kafka') {
      try {
        const { Kafka } = await import('kafkajs');
        this.client = new Kafka({
          clientId: 'rolewise-telemetry-producer',
          brokers: this.kafkaBrokers,
          retry: { retries: 0 } // handled by our bounded retry loop
        });
        this.producer = this.client.producer();
        await this.producer.connect();
        return this.producer;
      } catch (err) {
        throw new Error(`Failed to initialize Kafka client: ${err.message}`);
      }
    } else if (this.provider === 'kinesis') {
      try {
        const { KinesisClient } = await import('@aws-sdk/client-kinesis');
        this.client = new KinesisClient({
          region: this.awsRegion
        });
        return this.client;
      } catch (err) {
        throw new Error(`Failed to initialize Kinesis client: ${err.message}`);
      }
    } else {
      throw new Error(`Unsupported streaming provider: "${this.provider}". Must be "kafka" or "kinesis".`);
    }
  }

  /**
   * Sends an event to the streaming provider with bounded retries.
   */
  async send(event) {
    let attempts = 0;
    let lastError = null;

    while (attempts < this.maxRetries) {
      attempts++;
      try {
        const result = await this._sendSingleAttempt(event);
        return {
          success: true,
          sink: 'streaming',
          provider: this.provider,
          attempts,
          messageId: result.messageId || event.id,
          topicOrStream: this.provider === 'kafka' ? this.kafkaTopic : this.kinesisStreamName
        };
      } catch (err) {
        lastError = err;
        if (attempts < this.maxRetries) {
          // Bounded backoff
          await new Promise(resolve => setTimeout(resolve, this.retryDelayMs * attempts));
        }
      }
    }

    return {
      success: false,
      sink: 'streaming',
      provider: this.provider,
      attempts,
      error: lastError ? lastError.message : 'Streaming delivery failed after max retries'
    };
  }

  async _sendSingleAttempt(event) {
    const client = await this.getClient();

    // If client is a test mock or has send/produce methods:
    if (typeof client.sendEvent === 'function') {
      return await client.sendEvent(event);
    }

    if (this.provider === 'kafka') {
      const payload = {
        topic: this.kafkaTopic,
        messages: [
          {
            key: event.anonymous_user_id || event.id,
            value: JSON.stringify(event),
            timestamp: Date.now().toString()
          }
        ]
      };

      if (typeof client.send === 'function') {
        const res = await client.send(payload);
        return { messageId: `kafka-${event.id}`, raw: res };
      }
      throw new Error('Kafka producer does not implement send()');
    } else if (this.provider === 'kinesis') {
      const { PutRecordCommand } = await import('@aws-sdk/client-kinesis');
      const command = new PutRecordCommand({
        StreamName: this.kinesisStreamName,
        Data: Buffer.from(JSON.stringify(event)),
        PartitionKey: event.anonymous_user_id || event.role || 'partition-1'
      });

      const res = await client.send(command);
      return { messageId: res.SequenceNumber || `kinesis-${event.id}`, raw: res };
    }
  }

  async close() {
    if (this.producer && typeof this.producer.disconnect === 'function') {
      try {
        await this.producer.disconnect();
      } catch (_) {}
    }
  }
}
