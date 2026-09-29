import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { semanticVectorEngine, tokenizeAndPreprocess } from "../../src/engine/semanticNlpEngine.js";
import { evaluateDiscoveryQuery } from "../../src/engine/recommendationEngine.js";

describe("RoleWise AI: Real Local NLP Semantic Recommendation Tests", () => {
  test("NLP Vectorizer tokenizes and normalizes semantic concepts", () => {
    const tokens = tokenizeAndPreprocess("I need to pay my semester fees and check my attendance!");
    assert.ok(tokens.includes("pay"), "Should include stemmed token pay");
    assert.ok(tokens.includes("fee"), "Should include token fee");
    assert.ok(tokens.includes("attend"), "Should include stemmed token attend");
    assert.ok(tokens.includes("semester_+fee"), "Should generate domain bigram semester_+fee");
  });

  test("Diverse natural language attendance queries map to View Attendance without exact string matching", () => {
    const studentAttendanceQueries = [
      "How much attendance have I got?",
      "Can I check my attendance percentage?",
      "Am I above the 75 percent attendance requirement?",
      "What is my current attendance status in lectures?",
      "Do I have enough attendance to sit for examinations?",
    ];
    for (const q of studentAttendanceQueries) {
      const result = evaluateDiscoveryQuery(q, "student");
      assert.equal(result.status, "SUCCESS", "Query should succeed: " + q);
      assert.equal(result.feature.id, "view-attendance", "Query should map to view-attendance: " + q);
      assert.ok(result.confidence >= 80, "Confidence should be >= 80% for: " + q);
      assert.ok(result.semanticAnalysis, "Should return semanticAnalysis object");
      assert.ok(result.semanticAnalysis.similarityScore > 0.40, "Semantic similarity should be > 0.40 for: " + q);
    }
  });

  test("Diverse natural language fee queries map to Pay Fees without exact string matching", () => {
    const studentFeeQueries = [
      "I need to pay my semester fees.",
      "Where can I make my tuition payment?",
      "How do I pay my college fees?",
      "Check my pending tuition invoice balance",
      "Settle hostel and semester bursar dues online",
    ];
    for (const q of studentFeeQueries) {
      const result = evaluateDiscoveryQuery(q, "student");
      assert.equal(result.status, "SUCCESS", "Query should succeed: " + q);
      assert.equal(result.feature.id, "pay-fees", "Query should map to pay-fees: " + q);
      assert.ok(result.confidence >= 80, "Confidence should be >= 80% for: " + q);
      assert.ok(result.semanticAnalysis, "Should return semanticAnalysis object");
    }
  });

  test("Faculty lecture roll call queries map to Mark Attendance", () => {
    const facultyRollCallQueries = [
      "I need to mark attendance for today class",
      "Take daily roll call for CS lecture",
      "Record student present and absent status for room 304",
      "Submit classroom lecture attendance to registrar",
    ];
    for (const q of facultyRollCallQueries) {
      const result = evaluateDiscoveryQuery(q, "faculty");
      assert.equal(result.status, "SUCCESS", "Query should succeed: " + q);
      assert.equal(result.feature.id, "mark-attendance", "Query should map to mark-attendance: " + q);
    }
  });

  test("Admin queries map to authorized administrative features", () => {
    const adminQueries = [
      { q: "I want to review admission applications.", expected: "manage-admissions" },
      { q: "I need to manage student fees.", expected: "manage-fees" },
      { q: "I need to generate certificates.", expected: "generate-certificates" },
    ];
    for (const { q, expected } of adminQueries) {
      const result = evaluateDiscoveryQuery(q, "admin");
      assert.equal(result.status, "SUCCESS", "Query should succeed: " + q);
      assert.equal(result.feature.id, expected, "Query should map to: " + expected);
    }
  });

  test("Role restriction triggers RESTRICTED_ROLE for cross-role attempts", () => {
    const res = evaluateDiscoveryQuery("I want to review admission applications", "student");
    assert.equal(res.status, "RESTRICTED_ROLE", "Student should be blocked from admin admissions review");
    assert.equal(res.requiredRole, "admin");
  });

  test("Ambiguous queries produce AMBIGUOUS_QUERY clarification state", () => {
    const ambiguousQueries = [
      "attendance",
      "i need help with attendance",
      "certificates",
      "i need help with records",
    ];
    for (const q of ambiguousQueries) {
      const res = evaluateDiscoveryQuery(q, "student");
      assert.equal(res.status, "AMBIGUOUS_QUERY", "Query should trigger AMBIGUOUS_QUERY: " + q);
      assert.ok(Array.isArray(res.options) && res.options.length > 1, "Should provide role-specific options");
    }
  });

  test("Out-of-domain queries produce UNKNOWN_QUERY without hallucinating university features", () => {
    const outOfDomainQueries = [
      "I want to order food.",
      "I need a railway ticket.",
      "I want to book a hotel.",
      "Can you recommend a restaurant?",
    ];
    for (const q of outOfDomainQueries) {
      const res = evaluateDiscoveryQuery(q, "student");
      assert.equal(res.status, "UNKNOWN_QUERY", "Query should produce UNKNOWN_QUERY: " + q);
      assert.ok(res.explanation.includes("No available university feature"), "Should state no feature matched");
      assert.ok(Array.isArray(res.suggestedQueries), "Should provide valid university query suggestions");
    }
  });

  test("Underused feature prioritization signal is applied when relevant", () => {
    const res = evaluateDiscoveryQuery("I need my official degree certificate", "student");
    assert.equal(res.status, "SUCCESS");
    assert.equal(res.feature.id, "download-certificate");
    assert.equal(res.isUnderused, true, "Should mark feature as underused");
    assert.ok(res.underusedNotification, "Should provide underused notification");
  });
});