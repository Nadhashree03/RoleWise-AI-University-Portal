import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

const VALID_EVENT_TYPES = [
  'feature_view',
  'feature_open',
  'action_started',
  'action_completed',
  'action_failed',
  'assistant_recommendation',
  'assistant_override'
];

const VALID_FEATURES = [
  'pay-fees',
  'view-attendance',
  'download-certificate',
  'track-admission',
  'mark-attendance',
  'view-student-attendance',
  'upload-attendance',
  'manage-admissions',
  'manage-fees',
  'generate-certificates'
];

// POST /api/events/feature-usage
router.post('/feature-usage', authenticateJWT, (req, res) => {
  const {
    feature_id,
    task_goal,
    help_query,
    event_type,
    discovered = 0,
    completed = 0,
    success = 1,
    source = 'portal',
    duration_ms = 0
  } = req.body;

  const role = req.user.role;
  const anonymous_user_id = `anon-${req.user.id || 'usr-demo'}`;

  // Validation
  if (!role) {
    return res.status(400).json({ success: false, error: 'Missing authenticated role.', code: 'MISSING_ROLE' });
  }

  if (feature_id && !VALID_FEATURES.includes(feature_id)) {
    return res.status(400).json({ success: false, error: `Invalid feature ID: ${feature_id}`, code: 'INVALID_FEATURE' });
  }

  const normalizedEventType = VALID_EVENT_TYPES.includes(event_type) ? event_type : 'feature_view';

  // Deterministic experiment group for user
  const assignment = db.prepare('SELECT experiment_group FROM experiment_assignments WHERE anonymous_user_id = ?').get(anonymous_user_id);
  const experiment_group = assignment ? assignment.experiment_group : 'assistant';

  const eventId = `EVT-LIVE-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  try {
    db.prepare(`
      INSERT INTO feature_usage_events (
        id, anonymous_user_id, role, feature_id, task_goal, help_query,
        event_type, discovered, completed, success, source, experiment_group, duration_ms, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      anonymous_user_id,
      role,
      feature_id || 'unknown',
      task_goal || null,
      help_query || null,
      normalizedEventType,
      discovered ? 1 : 0,
      completed ? 1 : 0,
      success ? 1 : 0,
      source,
      experiment_group,
      duration_ms || 0,
      timestamp
    );

    res.json({
      success: true,
      eventId,
      message: 'Feature usage event recorded successfully.'
    });
  } catch (err) {
    console.error('Error logging feature usage event:', err);
    res.status(500).json({ success: false, error: 'Database error storing event.' });
  }
});

// POST /api/events/task-goal
router.post('/task-goal', authenticateJWT, (req, res) => {
  const { goal_text, feature_id, success = 1 } = req.body;
  const role = req.user.role;
  const anonymous_user_id = `anon-${req.user.id || 'usr-demo'}`;

  if (!goal_text) {
    return res.status(400).json({ success: false, error: 'Goal text is required.', code: 'MISSING_GOAL' });
  }

  const goalId = `GOAL-LIVE-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    INSERT INTO task_goals (id, anonymous_user_id, role, goal_text, normalized_goal, feature_id, success, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    goalId,
    anonymous_user_id,
    role,
    goal_text,
    goal_text.toLowerCase().trim(),
    feature_id || 'unknown',
    success ? 1 : 0,
    timestamp
  );

  res.json({ success: true, goalId });
});

// POST /api/events/help-search
router.post('/help-search', authenticateJWT, (req, res) => {
  const { query_text, result_feature_id, result_type = 'matched', success = 1 } = req.body;
  const role = req.user.role;
  const anonymous_user_id = `anon-${req.user.id || 'usr-demo'}`;

  if (!query_text) {
    return res.status(400).json({ success: false, error: 'Query text is required.', code: 'MISSING_QUERY' });
  }

  const queryId = `QRY-LIVE-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    INSERT INTO help_search_queries (id, anonymous_user_id, role, query_text, normalized_query, result_feature_id, result_type, success, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    queryId,
    anonymous_user_id,
    role,
    query_text,
    query_text.toLowerCase().trim(),
    result_feature_id || null,
    result_type,
    success ? 1 : 0,
    timestamp
  );

  res.json({ success: true, queryId });
});

export default router;
