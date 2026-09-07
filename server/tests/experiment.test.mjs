/**
 * RoleWise AI - Automated Experiment, Telemetry, Validation, and Governance Test Suite
 * Validates:
 * 1. Deterministic experiment assignment (Control vs Assistant)
 * 2. Real database event calculation (Baseline & Target comparison)
 * 3. Underused feature identification
 * 4. Recommendation error forensics & override tracking
 * 5. Stakeholder validation records & satisfaction scoring
 * 6. Enterprise risk register (R1 through R10)
 * 7. Secure admin-only rollback enforcement
 */

process.env.NODE_ENV = 'test';

import app from '../server.js';
import { db } from '../database/db.js';

let server;
let port;
let BASE_URL;

let studentToken;
let facultyToken;
let adminToken;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('======================================================================');
  console.log('ROLEWISE AI: EXPERIMENT, TELEMETRY & GOVERNANCE TEST SUITE');
  console.log('======================================================================\n');

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      BASE_URL = `http://localhost:${port}/api`;
      console.log(`Test server listening on port ${port}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // SETUP: Authenticate All Roles
    // -------------------------------------------------------------
    console.log('[Phase 1] Authenticating Test Sessions...');
    const sLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'student@rolewise.edu', password: 'Student@123' })
    });
    const sData = await sLogin.json();
    studentToken = sData.token;
    assert(sData.success === true && studentToken, 'Student authenticated successfully with JWT');

    const fLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'faculty@rolewise.edu', password: 'Faculty@123' })
    });
    const fData = await fLogin.json();
    facultyToken = fData.token;
    assert(fData.success === true && facultyToken, 'Faculty authenticated successfully with JWT');

    const aLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@rolewise.edu', password: 'Admin@123' })
    });
    const aData = await aLogin.json();
    adminToken = aData.token;
    assert(aData.success === true && adminToken, 'Admin authenticated successfully with JWT');

    // -------------------------------------------------------------
    // PHASE 2: Deterministic Experiment Assignments
    // -------------------------------------------------------------
    console.log('\n[Phase 2] Verifying Deterministic Experiment Assignments...');
    const totalUsers = db.prepare('SELECT COUNT(*) as c FROM experiment_assignments').get().c;
    assert(totalUsers >= 100, `Database contains >= 100 anonymized experiment participants (${totalUsers} found)`);

    const controlCount = db.prepare("SELECT COUNT(*) as c FROM experiment_assignments WHERE experiment_group = 'control'").get().c;
    const assistantCount = db.prepare("SELECT COUNT(*) as c FROM experiment_assignments WHERE experiment_group = 'assistant'").get().c;
    assert(controlCount > 40 && assistantCount > 40, `Balanced A/B assignment: Control=${controlCount}, Assistant=${assistantCount}`);

    // -------------------------------------------------------------
    // PHASE 3: Real Database Experiment Measurement
    // -------------------------------------------------------------
    console.log('\n[Phase 3] Testing Real Database Experiment Endpoint (/api/analytics/experiment)...');
    const expRes = await fetch(`${BASE_URL}/analytics/experiment`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const exp = await expRes.json();
    assert(exp.success === true, 'Experiment API responds with success: true');
    assert(exp.disclaimer && exp.disclaimer.includes('Synthetic'), 'Prototype disclaimer clearly returned');
    assert(exp.comparison && exp.comparison.length === 5, 'Returns all 5 required comparative metrics');

    const discoveryMetric = exp.comparison.find(m => m.metric === 'Discovery Rate');
    const completionMetric = exp.comparison.find(m => m.metric === 'Completion Rate');
    const searchMetric = exp.comparison.find(m => m.metric === 'Help Search Success Rate');
    const timeMetric = exp.comparison.find(m => m.metric === 'Average Discovery Time');
    const underusedMetric = exp.comparison.find(m => m.metric === 'Underused Feature Discovery Rate');

    assert(discoveryMetric && discoveryMetric.assistantNum >= 65.0, `Assistant Discovery Rate (${discoveryMetric.assistantNum}%) meets >= 65% target`);
    assert(completionMetric && completionMetric.assistantNum >= 55.0, `Assistant Completion Rate (${completionMetric.assistantNum}%) meets >= 55% target`);
    assert(searchMetric && searchMetric.assistantNum >= 60.0, `Assistant Search Success (${searchMetric.assistantNum}%) meets >= 60% target`);
    assert(timeMetric && timeMetric.assistantNum < timeMetric.controlNum, `Assistant average discovery time (${timeMetric.assistantNum}s) is faster than control (${timeMetric.controlNum}s)`);
    assert(underusedMetric && underusedMetric.assistantNum >= 50.0, `Assistant Underused Discovery Rate (${underusedMetric.assistantNum}%) meets >= 50% target`);

    // -------------------------------------------------------------
    // PHASE 4: Underused Features Detection
    // -------------------------------------------------------------
    console.log('\n[Phase 4] Testing Underused Features Detection (/api/analytics/underused-features)...');
    const underRes = await fetch(`${BASE_URL}/analytics/underused-features`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const under = await underRes.json();
    assert(under.success === true, 'Underused features endpoint returns success: true');
    assert(under.features.length === 10, 'All 10 university portal features analyzed');

    const certFeature = under.features.find(f => f.featureId === 'download-certificate');
    const uploadFeature = under.features.find(f => f.featureId === 'upload-attendance');
    assert(certFeature && certFeature.status === 'UNDERUSED', 'download-certificate correctly identified as UNDERUSED');
    assert(uploadFeature && uploadFeature.status === 'UNDERUSED', 'upload-attendance correctly identified as UNDERUSED');

    // -------------------------------------------------------------
    // PHASE 5: Recommendation Error Analysis
    // -------------------------------------------------------------
    console.log('\n[Phase 5] Testing Recommendation Error Analysis (/api/analytics/errors)...');
    const errRes = await fetch(`${BASE_URL}/analytics/errors`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const errData = await errRes.json();
    assert(errData.success === true, 'Error analysis returns success: true');
    assert(errData.summary.accuracyNum > 70.0, `Recommendation Accuracy calculated: ${errData.summary.accuracyRate}`);
    assert(errData.summary.overrideCount >= 10, `Captures overrides correctly (${errData.summary.overrideCount} recorded)`);
    assert(errData.errorLedger.length > 0, 'Returns itemized error forensics ledger');

    // -------------------------------------------------------------
    // PHASE 6: Live Telemetry Event Ingestion
    // -------------------------------------------------------------
    console.log('\n[Phase 6] Testing Live Telemetry Ingestion (/api/events/*)...');
    const evtRes = await fetch(`${BASE_URL}/events/feature-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        feature_id: 'download-certificate',
        task_goal: 'Download bonafide certificate',
        help_query: 'bonafide document',
        event_type: 'feature_open',
        discovered: 1,
        completed: 1,
        source: 'assistant',
        duration_ms: 14200
      })
    });
    const evtData = await evtRes.json();
    assert(evtData.success === true && evtData.eventId, `Feature usage event ingested with ID: ${evtData.eventId}`);

    // Test rejection of invalid feature ID
    const badEvtRes = await fetch(`${BASE_URL}/events/feature-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        feature_id: 'non-existent-feature-xyz',
        event_type: 'feature_open'
      })
    });
    const badEvtData = await badEvtRes.json();
    assert(badEvtRes.status === 400 && badEvtData.code === 'INVALID_FEATURE', 'Rejects invalid feature ID with 400');

    // -------------------------------------------------------------
    // PHASE 7: Recommendation Override Recording
    // -------------------------------------------------------------
    console.log('\n[Phase 7] Testing Recommendation Override Endpoint (/api/recommendations/override)...');
    const ovrRes = await fetch(`${BASE_URL}/recommendations/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        recommendationId: 'REC-9999',
        query: 'pay fees balance',
        taskGoal: 'Tuition Fee Settlement',
        recommendedFeatureId: 'pay-fees',
        selectedFeatureId: 'download-certificate',
        reason: 'Recommendation was incorrect',
        notes: 'User chose certificate instead'
      })
    });
    const ovrData = await ovrRes.json();
    assert(ovrData.success === true && ovrData.eventId, 'Override successfully recorded with audit event');

    // -------------------------------------------------------------
    // PHASE 8: Stakeholder Validation Module
    // -------------------------------------------------------------
    console.log('\n[Phase 8] Testing Stakeholder Validation Module (/api/validation)...');
    const valRes = await fetch(`${BASE_URL}/validation`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const valData = await valRes.json();
    assert(valData.success === true, 'Validation endpoint returns success: true');
    assert(valData.records.length >= 5, `Contains at least 5 validation participant records (${valData.records.length} found)`);
    assert(valData.summary.taskSuccessRateNum >= 80, `Validation task success rate: ${valData.summary.taskSuccessRate}`);
    assert(valData.disclaimer.includes('Prototype validation'), 'Explicit synthetic validation disclaimer present');

    // -------------------------------------------------------------
    // PHASE 9: Enterprise Risk Register
    // -------------------------------------------------------------
    console.log('\n[Phase 9] Testing Enterprise Risk Register (/api/risks)...');
    const rskRes = await fetch(`${BASE_URL}/risks`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const rskData = await rskRes.json();
    assert(rskData.success === true, 'Risks endpoint returns success: true');
    assert(rskData.risks.length === 10, 'All 10 required risks (R1 through R10) present in register');
    assert(rskData.risks[0].risk_code === 'R1', 'R1: Wrong Recommendation present');
    assert(rskData.risks[9].risk_code === 'R10', 'R10: User Over-Reliance present');

    // -------------------------------------------------------------
    // PHASE 10: Secure Admin-Only Rollback
    // -------------------------------------------------------------
    console.log('\n[Phase 10] Testing Secure Admin-Only Rollback Authorization...');
    // Ensure test change record is unrolled for testing
    db.prepare('UPDATE change_history SET isRolledBack = 0 WHERE id = ?').run('CHG-1001');

    // Try rollback as student (should be rejected with 403)
    const unauthorizedRollback = await fetch(`${BASE_URL}/change-history/CHG-1001/rollback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ reason: 'Malicious rollback attempt' })
    });
    assert(unauthorizedRollback.status === 403, 'Unauthorized student rollback rejected with 403 Forbidden');

    // Try rollback as admin (authorized)
    const authorizedRollback = await fetch(`${BASE_URL}/change-history/CHG-1001/rollback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reason: 'Reverting admission approval to Pending Review for re-evaluation' })
    });
    const rollData = await authorizedRollback.json();
    assert(authorizedRollback.status === 200 && rollData.success === true, 'Authorized admin rollback executed successfully');

    console.log('\n======================================================================');
    console.log(`🎉 ALL ${passedTests} OF ${totalTests} TESTS PASSED SUCCESSFULLY (100% SUCCESS)`);
    console.log('======================================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  if (server) server.close();
  process.exit(1);
});
