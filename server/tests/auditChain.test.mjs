import assert from 'node:assert';
import http from 'node:http';
import app from '../server.js';

let server;
let BASE_URL;

async function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      BASE_URL = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    server.close(resolve);
  });
}

async function loginUser(identifier, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  return data.token;
}

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`  ✅ PASS: ${msg}`);
  passed++;
}

function fail(msg, err) {
  console.error(`  ❌ FAIL: ${msg}`, err?.message || err);
  failed++;
}

async function runTests() {
  console.log('======================================================================');
  console.log('ROLEWISE AI: CRYPTOGRAPHIC AUDIT HASH CHAINING & INTEGRITY TEST SUITE');
  console.log('======================================================================\n');

  await startServer();

  try {
    const adminToken = await loginUser('admin@rolewise.edu', 'Admin@123');
    const studentToken = await loginUser('student@rolewise.edu', 'Student@123');

    // 1. Initial verification of backfilled ledger
    console.log('### 1. INITIAL CRYPTOGRAPHIC CHAIN INTEGRITY');
    console.log('----------------------------------------------------------------------');
    const verifyRes = await fetch(`${BASE_URL}/audit-logs/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(verifyRes.status, 200, 'GET /verify returns 200');
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.success, true, 'Verify succeeds');
    assert.strictEqual(verifyData.valid, true, 'Chain is cryptographically valid');
    assert(verifyData.totalLogs > 0, 'Ledger has recorded logs');
    assert.strictEqual(verifyData.brokenAt, null, 'No broken blocks found');
    pass(`Initial hash chain intact across all ${verifyData.totalLogs} blocks`);

    // 2. Fetch logs and verify hash formats
    console.log('\n### 2. LOG HASH SIGNATURE & CHAIN LINKAGE INSPECTION');
    console.log('----------------------------------------------------------------------');
    const logsRes = await fetch(`${BASE_URL}/audit-logs?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const logsData = await logsRes.json();
    assert.strictEqual(logsRes.status, 200);
    assert(logsData.logs.length > 0);
    const firstLog = logsData.logs[0];
    assert(firstLog.hash, 'Log has SHA-256 hash');
    assert(firstLog.prev_hash, 'Log has prev_hash');
    assert.strictEqual(firstLog.hash.length, 64, 'SHA-256 hash is 64 hex characters');
    pass(`Audit log records contain valid 64-character SHA-256 signatures: ${firstLog.hash.substring(0, 16)}...`);

    // 3. Append new log and verify automatic chain linking
    console.log('\n### 3. LIVE EVENT APPEND & AUTOMATIC HASH LINKING');
    console.log('----------------------------------------------------------------------');
    const newLogRes = await fetch(`${BASE_URL}/audit-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        action: 'TEST_CHAIN_APPEND',
        module: 'security',
        status: 'Authorized',
        details: 'Testing live cryptographic chain appending',
      }),
    });
    assert.strictEqual(newLogRes.status, 200);
    const newLogData = await newLogRes.json();
    assert(newLogData.hash, 'New log returned with calculated hash');
    assert(newLogData.prev_hash, 'New log returned with prev_hash link');
    pass(`Appended new event ${newLogData.eventId} with chained hash ${newLogData.hash.substring(0, 16)}...`);

    // Verify chain remains valid after append
    const verifyAfterAppend = await (await fetch(`${BASE_URL}/audit-logs/verify`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })).json();
    assert.strictEqual(verifyAfterAppend.valid, true);
    assert.strictEqual(verifyAfterAppend.brokenAt, null);
    pass(`Chain verification valid after live event insertion (${verifyAfterAppend.totalLogs} total events)`);

    // 4. RBAC check on tamper simulation (students cannot tamper)
    console.log('\n### 4. RBAC PROTECTION ON SECURITY TESTING ENDPOINTS');
    console.log('----------------------------------------------------------------------');
    const studentTamperRes = await fetch(`${BASE_URL}/audit-logs/simulate-tamper`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(studentTamperRes.status, 403, 'Student cannot simulate tamper');
    pass('Unauthorized roles denied (403) from tampering simulation endpoints');

    // 5. Admin simulates tampering to demonstrate cryptographic detection
    console.log('\n### 5. SIMULATED RECORD TAMPERING & CRYPTOGRAPHIC DETECTION');
    console.log('----------------------------------------------------------------------');
    const tamperRes = await fetch(`${BASE_URL}/audit-logs/simulate-tamper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(tamperRes.status, 200);
    const tamperData = await tamperRes.json();
    assert.strictEqual(tamperData.success, true);
    pass(`Simulated tampering applied to audit event: ${tamperData.tamperedId}`);

    // Chain verification should now FAIL
    const verifyAfterTamper = await (await fetch(`${BASE_URL}/audit-logs/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })).json();
    assert.strictEqual(verifyAfterTamper.valid, false, 'Tampered chain detected as INVALID');
    assert.strictEqual(verifyAfterTamper.brokenAt, tamperData.tamperedId, 'Broken block matches tampered event ID');
    pass(`Tamper detected! Broken link detected at event: ${verifyAfterTamper.brokenAt}`);

    // 6. Cryptographic chain repair & re-anchoring
    console.log('\n### 6. CRYPTOGRAPHIC CHAIN REPAIR & RESYNCHRONIZATION');
    console.log('----------------------------------------------------------------------');
    const repairRes = await fetch(`${BASE_URL}/audit-logs/repair-chain`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(repairRes.status, 200);
    const repairData = await repairRes.json();
    assert.strictEqual(repairData.success, true);
    pass(`Chain repaired and re-anchored across ${repairData.repairedCount} events`);

    // Verify chain is valid again
    const verifyAfterRepair = await (await fetch(`${BASE_URL}/audit-logs/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })).json();
    assert.strictEqual(verifyAfterRepair.valid, true);
    assert.strictEqual(verifyAfterRepair.brokenAt, null);
    pass(`Cryptographic hash chain verified 100% intact after repair (${verifyAfterRepair.totalLogs} events)`);

  } catch (err) {
    fail('Audit chain test failed', err);
  } finally {
    await stopServer();
  }

  console.log('\n======================================================================');
  console.log(`AUDIT CHAIN TEST SUITE: ${passed}/${passed + failed} TESTS PASSED (${((passed / (passed + failed || 1)) * 100).toFixed(1)}%)`);
  console.log('======================================================================');

  if (failed > 0) process.exit(1);
}

runTests();
