// server/telemetry/eventSchema.js
// Canonical Telemetry Event Schema & Privacy Sanitizer

export const VALID_ROLES = ['student', 'faculty', 'admin', 'system'];

export const VALID_EVENT_TYPES = [
  'feature_view',
  'feature_open',
  'action_started',
  'action_completed',
  'action_failed',
  'assistant_recommendation',
  'assistant_override',
  'help_search',
  'task_goal'
];

export const VALID_FEATURES = [
  'pay-fees',
  'view-attendance',
  'download-certificate',
  'track-admission',
  'mark-attendance',
  'view-student-attendance',
  'upload-attendance',
  'manage-admissions',
  'manage-fees',
  'generate-certificates',
  'unknown'
];

const FORBIDDEN_PII_KEYS = [
  'password',
  'pwd',
  'token',
  'jwt',
  'secret',
  'credit_card',
  'card_number',
  'cvv',
  'ssn',
  'authorization',
  'auth_header',
  'private_key',
  'api_key'
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Sanitizes an object recursively by stripping any sensitive keys or PII strings.
 */
export function sanitizePayload(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return obj.replace(EMAIL_REGEX, '[ANONYMIZED_EMAIL]');
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePayload(item, depth + 1));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_PII_KEYS.some(bad => lowerKey.includes(bad))) {
      // Strip completely
      continue;
    }
    cleaned[key] = sanitizePayload(value, depth + 1);
  }
  return cleaned;
}

/**
 * Validates a telemetry event against the canonical schema.
 * Returns { valid: boolean, errors: string[], sanitizedEvent: object }
 */
export function validateTelemetryEvent(event) {
  const errors = [];

  if (!event || typeof event !== 'object') {
    return { valid: false, errors: ['Event must be a non-null object'], sanitizedEvent: null };
  }

  // Required: id
  if (!event.id || typeof event.id !== 'string') {
    errors.push('Missing or invalid event "id" (string required)');
  }

  // Required: role
  if (!event.role || !VALID_ROLES.includes(String(event.role).toLowerCase())) {
    errors.push(`Invalid role "${event.role}". Must be one of: ${VALID_ROLES.join(', ')}`);
  }

  // Required: event_type
  if (!event.event_type || !VALID_EVENT_TYPES.includes(event.event_type)) {
    errors.push(`Invalid event_type "${event.event_type}". Must be one of: ${VALID_EVENT_TYPES.join(', ')}`);
  }

  // Sanitize any potential PII
  const sanitized = sanitizePayload(event);

  // Anonymized user ID check - ensure it doesn't look like raw email
  const anonUserId = sanitized.anonymous_user_id || sanitized.userId || 'anon-usr-demo';
  if (typeof anonUserId === 'string' && anonUserId.includes('@')) {
    sanitized.anonymous_user_id = `anon-${Buffer.from(anonUserId).toString('base64').slice(0, 12)}`;
  } else {
    sanitized.anonymous_user_id = anonUserId;
  }

  // Normalization
  sanitized.feature_id = sanitized.feature_id || sanitized.featureId || 'unknown';
  sanitized.discovered = sanitized.discovered ? 1 : 0;
  sanitized.completed = sanitized.completed ? 1 : 0;
  sanitized.success = sanitized.success === 0 ? 0 : 1;
  sanitized.source = sanitized.source || 'portal';
  sanitized.experiment_group = ['control', 'assistant'].includes(sanitized.experiment_group) ? sanitized.experiment_group : 'assistant';
  sanitized.duration_ms = typeof sanitized.duration_ms === 'number' ? sanitized.duration_ms : 0;
  sanitized.timestamp = sanitized.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19);

  return {
    valid: errors.length === 0,
    errors,
    sanitizedEvent: sanitized
  };
}

/**
 * Creates a standard telemetry event object with unique ID and timestamp.
 */
export function createTelemetryEvent(params = {}) {
  const eventId = params.id || `EVT-STREAM-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = params.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19);

  return {
    id: eventId,
    anonymous_user_id: params.anonymous_user_id || (params.user_id ? `anon-${params.user_id}` : 'anon-usr-demo'),
    role: params.role || 'student',
    feature_id: params.feature_id || 'unknown',
    task_goal: params.task_goal || null,
    help_query: params.help_query || null,
    event_type: params.event_type || 'feature_view',
    discovered: params.discovered ? 1 : 0,
    completed: params.completed ? 1 : 0,
    success: params.success === 0 ? 0 : 1,
    source: params.source || 'portal',
    experiment_group: params.experiment_group || 'assistant',
    duration_ms: params.duration_ms || 0,
    timestamp,
    metadata: params.metadata || {}
  };
}
