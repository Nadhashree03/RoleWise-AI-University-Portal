import {
  ROLES,
  MOCK_FEATURES,
  ANONYMIZED_USER_PROFILES,
  TASK_GOALS,
  FEATURE_USAGE_EVENTS,
  HELP_SEARCH_QUERIES,
  AMBIGUOUS_QUERY_INTENTS,
  SIMULATED_UNAVAILABLE_SCENARIOS,
  INSUFFICIENT_EVIDENCE_KEYWORDS
} from '../data/mockData.js';

/**
 * Transparent Rule-Based Recommendation Engine for RoleWise AI
 *
 * Evaluates active role permissions, keyword semantics, task goals,
 * anonymized feature-usage events, and historical help queries with zero external APIs.
 */

// Role-specific governance rule catalog
export const RECOMMENDATION_RULES = {
  // Student Rules
  'pay-fees': {
    ruleId: 'RULE_PENDING_PAYMENT_DEADLINE_APPROACHING',
    why: 'Your query contains payment-related keywords and your current role has access to tuition settlement.',
    evidence: 'Unpaid bursar balance of ₹1,85,000; historical completion rate 82.1%; 18 matching anonymized searches.',
    baseConfidence: 94,
    intent: 'Tuition Fee Settlement & Invoice Clearance',
  },
  'view-attendance': {
    ruleId: 'RULE_ATTENDANCE_DEFICIT_MONITORING',
    why: 'Query matched lecture attendance monitoring; active Capstone attendance is at 77.78% (near 75.0% threshold).',
    evidence: 'Attendance ledger indicates 14/18 lectures attended; high engagement feature with 92.2% completion rate.',
    baseConfidence: 95,
    intent: 'Personal Attendance & Exam Threshold Monitoring',
  },
  'download-certificate': {
    ruleId: 'RULE_CREDENTIAL_VERIFICATION_GOAL',
    why: 'Official credentials and transcripts ready for verified digital download with cryptographic seal.',
    evidence: 'Senior degree standing (108/120 Cr); eligible for bona fide certificate; underused self-service opportunity.',
    baseConfidence: 91,
    intent: 'Official Academic Credential & Transcript Download',
  },
  'track-admission': {
    ruleId: 'RULE_ADMISSION_VERIFICATION_FLOW',
    why: 'Query matches matriculation and admission verification milestones active on your student profile.',
    evidence: 'Application ID ADM-2024-CS-0941; 4 of 5 milestones complete; 76.6% completion rate.',
    baseConfidence: 89,
    intent: 'Student Admission Lifecycle & Verification Tracking',
  },

  // Faculty Rules
  'mark-attendance': {
    ruleId: 'RULE_FACULTY_LECTURE_ATTENDANCE_DUE',
    why: 'Daily roll-call query matches your scheduled lecture for CS-480 (Room 304) awaiting registrar submission.',
    evidence: 'Timetable slot 10:00 - 11:30 AM in Room 304; 42 enrolled students; 97.2% completion rate.',
    baseConfidence: 98,
    intent: 'Classroom Lecture Roll-Call Submission',
  },
  'view-student-attendance': {
    ruleId: 'RULE_STUDENT_INTERVENTION_ALERT',
    why: 'Cohort advising query matches 4 advised students currently below the 75% attendance threshold.',
    evidence: 'Automated deficit alerts active for Jordan Hayes (68.8%), Priya Sharma (72.2%), and 2 other advisees.',
    baseConfidence: 93,
    intent: 'Cohort Attendance Deficit & At-Risk Intervention',
  },
  'upload-attendance': {
    ruleId: 'RULE_BIOMETRIC_OFFLINE_UPLOAD_PENDING',
    why: 'Batch data upload query matches pending RFID smartcard scanner logs from Lab A-204.',
    evidence: '1 unparsed biometric log file pending in queue; saves ~25 min/week over manual roll-call.',
    baseConfidence: 90,
    intent: 'Batch Biometric Smartcard Attendance Ingestion',
  },

  // Admin Rules
  'manage-admissions': {
    ruleId: 'RULE_APPLICANT_BATCH_VERIFICATION',
    why: 'Admissions intake query matches 48 candidate applications in Batch 3 awaiting merit review before the cutoff.',
    evidence: '342 seats confirmed of 500 capacity; 48 pending files in review queue; 86.8% completion rate.',
    baseConfidence: 96,
    intent: 'Admissions Intake Governance & Seat Allocation',
  },
  'manage-fees': {
    ruleId: 'RULE_FEE_COLLECTION_RECONCILIATION',
    why: 'Financial administration query matches end-of-month reconciliation for ₹24,25,000 pending student fees.',
    evidence: 'Stripe & campus bank gateway reconciliation cycle active; 38 defaulting accounts flagged.',
    baseConfidence: 95,
    intent: 'Tuition Fee Collection & Gateway Reconciliation',
  },
  'generate-certificates': {
    ruleId: 'RULE_BATCH_CREDENTIAL_ISSUANCE',
    why: 'Credential governance query matches 85 graduating seniors awaiting batch cryptographic RSA-4096 signing.',
    evidence: 'Registrar queue contains 85 verified certificates; underused batch signing capability.',
    baseConfidence: 92,
    intent: 'Batch Convocation Degree Cryptographic Signing',
  },
  'view-analytics': {
    ruleId: 'RULE_CAMPUS_PORTAL_GOVERNANCE_METRICS',
    why: 'Portal governance query matches real-time telemetry, feature discovery accuracy, and server latency streams.',
    evidence: '1,420 active campus sessions; 24ms server latency; zero security anomalies detected.',
    baseConfidence: 91,
    intent: 'Campus Portal Telemetry & Performance Monitoring',
  },
};

/**
 * Detect task intent from natural language query
 */
export const detectTaskIntent = (query, currentRole) => {
  const q = query.toLowerCase();
  if (q.includes('fee') || q.includes('pay') || q.includes('tuition') || q.includes('invoice') || q.includes('bursar')) {
    return currentRole === ROLES.ADMIN ? 'Tuition Fee Collection & Gateway Reconciliation' : 'Tuition Fee Settlement & Invoice Clearance';
  }
  if (q.includes('mark') && q.includes('attendance')) {
    return 'Classroom Lecture Roll-Call Submission';
  }
  if (q.includes('upload') || q.includes('biometric') || q.includes('csv') || q.includes('spreadsheet')) {
    return 'Batch Biometric Smartcard Attendance Ingestion';
  }
  if (q.includes('at risk') || q.includes('student attendance') || q.includes('below 75') || q.includes('deficit')) {
    return 'Cohort Attendance Deficit & At-Risk Intervention';
  }
  if (q.includes('attendance')) {
    return currentRole === ROLES.STUDENT ? 'Personal Attendance & Exam Threshold Monitoring' : 'Lecture Attendance Operation';
  }
  if (q.includes('certificate') || q.includes('transcript') || q.includes('bonafide') || q.includes('degree')) {
    return currentRole === ROLES.ADMIN ? 'Batch Convocation Degree Cryptographic Signing' : 'Official Academic Credential & Transcript Download';
  }
  if (q.includes('admission') || q.includes('applicant') || q.includes('merit') || q.includes('seat')) {
    return currentRole === ROLES.ADMIN ? 'Admissions Intake Governance & Seat Allocation' : 'Student Admission Lifecycle & Verification Tracking';
  }
  if (q.includes('analytics') || q.includes('telemetry') || q.includes('traffic') || q.includes('latency')) {
    return 'Campus Portal Telemetry & Performance Monitoring';
  }
  return 'University Feature Task Discovery';
};

/**
 * Evaluates a user natural language query and returns the structured discovery outcome.
 * Handles all 5 edge & failure cases:
 * - CASE 1: UNKNOWN_QUERY
 * - CASE 2: RESTRICTED_ROLE
 * - CASE 3: AMBIGUOUS_QUERY
 * - CASE 4: INSUFFICIENT_EVIDENCE
 * - CASE 5: TEMPORARILY_UNAVAILABLE
 */
export const evaluateDiscoveryQuery = (rawQuery, currentRole = ROLES.STUDENT) => {
  if (!rawQuery || rawQuery.trim().length === 0) {
    return {
      status: 'EMPTY_QUERY',
      recommendations: getRecommendationsForRole(currentRole),
    };
  }

  const query = rawQuery.toLowerCase().trim();
  const words = query.split(/\s+/).filter((w) => w.length > 2);

  // =========================================================================
  // CASE 5: FEATURE TEMPORARILY UNAVAILABLE (Simulated Service Outage)
  // =========================================================================
  for (const [featId, outageConfig] of Object.entries(SIMULATED_UNAVAILABLE_SCENARIOS)) {
    const isTriggered = outageConfig.triggerKeywords.some((kw) => query.includes(kw));
    if (isTriggered) {
      const altFeature = MOCK_FEATURES.find((f) => f.id === outageConfig.alternativeFeatureId);
      return {
        status: 'TEMPORARILY_UNAVAILABLE',
        serviceName: outageConfig.serviceName,
        reason: outageConfig.reason,
        targetFeatureId: featId,
        retryAvailable: outageConfig.retryAvailable,
        alternativeFeature: altFeature,
        alternativeReason: outageConfig.alternativeReason,
        query: rawQuery,
        role: currentRole,
      };
    }
  }

  // =========================================================================
  // CASE 3: AMBIGUOUS QUERY
  // =========================================================================
  const cleanWord = query.replace(/[?.,!]/g, '').trim();
  for (const [ambiguityKey, ambiguityData] of Object.entries(AMBIGUOUS_QUERY_INTENTS)) {
    const isExactAmbiguity =
      cleanWord === ambiguityKey ||
      cleanWord === `show ${ambiguityKey}` ||
      cleanWord === `view ${ambiguityKey}` ||
      cleanWord === `check ${ambiguityKey}` ||
      cleanWord === `manage ${ambiguityKey}` ||
      cleanWord === `i need help with ${ambiguityKey}` ||
      (ambiguityKey.includes(' ') && cleanWord.includes(ambiguityKey));

    if (isExactAmbiguity) {
      const options = ambiguityData.optionsByRole[currentRole] || [];
      if (options.length > 0) {
        return {
          status: 'AMBIGUOUS_QUERY',
          ambiguityKey,
          ambiguityTitle: ambiguityData.ambiguityTitle,
          description: ambiguityData.description,
          options,
          query: rawQuery,
          role: currentRole,
        };
      }
    }
  }

  // Common stop words to eliminate noise
  const STOP_WORDS = new Set([
    'how', 'can', 'the', 'and', 'for', 'with', 'this', 'that', 'i', 'my', 'me', 'want',
    'need', 'help', 'show', 'where', 'what', 'please', 'something', 'get', 'view', 'about',
    'from', 'into', 'would', 'like', 'you', 'are', 'is', 'a', 'an', 'to', 'in', 'of', 'at',
    'do', 'unrelated', 'random'
  ]);

  const meaningfulWords = words.filter((w) => !STOP_WORDS.has(w));

  // If query consists only of stop words or unrelated filler, trigger UNKNOWN_QUERY
  if (meaningfulWords.length === 0 || query.includes('something unrelated') || query.includes('unrelated')) {
    const roleExamples = {
      [ROLES.STUDENT]: [
        'How can I pay my fees?',
        'I want to check my attendance',
        'Download my certificate',
        'Where can I track my admission?',
      ],
      [ROLES.FACULTY]: [
        'How do I mark attendance?',
        'Show student attendance',
        'I need to upload attendance',
      ],
      [ROLES.ADMIN]: [
        'Manage new admissions',
        'How do I manage student fees?',
        'Generate a certificate',
        'Show university analytics',
      ],
    };

    return {
      status: 'UNKNOWN_QUERY',
      title: 'No confident recommendation found',
      explanation: 'No available university feature matched your task goal.',
      query: rawQuery,
      role: currentRole,
      suggestedQueries: roleExamples[currentRole] || roleExamples[ROLES.STUDENT],
    };
  }

  // =========================================================================
  // MULTI-LAYER SEMANTIC & RELEVANCE SCORING
  // =========================================================================
  const scoredFeatures = MOCK_FEATURES.map((feature) => {
    let score = 0;
    const matchedKeywords = [];

    // Exact title match
    if (feature.title.toLowerCase().includes(query)) {
      score += 70;
      matchedKeywords.push(feature.title);
    }

    // Meaningful word matches
    meaningfulWords.forEach((w) => {
      let wordMatched = false;
      if (feature.title.toLowerCase().includes(w)) {
        score += 25;
        wordMatched = true;
      }
      if (feature.tags.some((t) => t.toLowerCase().includes(w))) {
        score += 20;
        wordMatched = true;
      }
      if (feature.category.toLowerCase().includes(w)) {
        score += 15;
        wordMatched = true;
      }
      if (feature.description.toLowerCase().includes(w)) {
        score += 10;
        wordMatched = true;
      }
      if (feature.department.toLowerCase().includes(w)) {
        score += 8;
        wordMatched = true;
      }
      if (wordMatched && !matchedKeywords.includes(w)) {
        matchedKeywords.push(w);
      }
    });

    // Domain Concept Boosters
    const qLower = query;
    if (
      qLower.includes('fee') ||
      qLower.includes('tuition') ||
      qLower.includes('pay') ||
      qLower.includes('pending') ||
      qLower.includes('amount') ||
      qLower.includes('balance') ||
      qLower.includes('due') ||
      qLower.includes('invoice')
    ) {
      if (feature.id === 'pay-fees' || feature.id === 'manage-fees') score += 50;
    }
    if (
      qLower.includes('admission') ||
      qLower.includes('admissions') ||
      qLower.includes('application') ||
      qLower.includes('applicant') ||
      qLower.includes('matriculat')
    ) {
      if (feature.id === 'manage-admissions' || feature.id === 'track-admission') score += 50;
    }
    if (
      qLower.includes('certificate') ||
      qLower.includes('transcript') ||
      qLower.includes('degree') ||
      qLower.includes('bonafide')
    ) {
      if (feature.id === 'download-certificate' || feature.id === 'generate-certificates') score += 50;
    }
    if (qLower.includes('attendance') || qLower.includes('roll call') || qLower.includes('rollcall')) {
      if (
        feature.id === 'mark-attendance' ||
        feature.id === 'view-attendance' ||
        feature.id === 'view-student-attendance' ||
        feature.id === 'upload-attendance'
      )
        score += 40;
    }
    if (qLower.includes('exam') || qLower.includes('supplementary')) {
      if (feature.id === 'view-attendance' || feature.id === 'download-certificate') score += 40;
    }
    if (qLower.includes('biometric') || qLower.includes('csv') || qLower.includes('spreadsheet') || qLower.includes('rfid')) {
      if (feature.id === 'upload-attendance') score += 50;
    }
    if (qLower.includes('analytic') || qLower.includes('telemetry') || qLower.includes('latency')) {
      if (feature.id === 'view-analytics') score += 50;
    }

    // Explicit Action Intent Boosters (Directly targets specific workflow actions)
    if (qLower.includes('mark') && qLower.includes('attendance')) {
      if (feature.id === 'mark-attendance') score += 75;
    }
    if (qLower.includes('upload') && qLower.includes('attendance')) {
      if (feature.id === 'upload-attendance') score += 75;
    }
    if (qLower.includes('generate') && (qLower.includes('certificate') || qLower.includes('degree'))) {
      if (feature.id === 'generate-certificates') score += 75;
    }
    if (qLower.includes('download') && (qLower.includes('certificate') || qLower.includes('transcript'))) {
      if (feature.id === 'download-certificate') score += 75;
    }
    if (qLower.includes('where is my application') || (qLower.includes('track') && qLower.includes('admission'))) {
      if (feature.id === 'track-admission') score += 75;
    }
    if (qLower.includes('manage') && (qLower.includes('admission') || qLower.includes('applicant'))) {
      if (feature.id === 'manage-admissions') score += 75;
    }
    if (qLower.includes('manage') && qLower.includes('fee')) {
      if (feature.id === 'manage-fees') score += 75;
    }

    // Historical help queries match
    let historicalSearchHits = 0;
    HELP_SEARCH_QUERIES.forEach((hq) => {
      if (hq.matchedFeature === feature.id && (hq.query.includes(query) || query.includes(hq.matchedFeature))) {
        score += 35;
        historicalSearchHits += Math.round(hq.frequency / 100);
      }
    });

    // Task goals match (only if query aligns with goal title)
    const roleGoals = TASK_GOALS[currentRole] || [];
    roleGoals.forEach((g) => {
      if (g.featureId === feature.id) {
        const goalWords = g.title.toLowerCase().split(/\s+/);
        if (meaningfulWords.some((w) => goalWords.includes(w))) {
          score += 15;
        }
      }
    });

    const isAllowed = feature.allowedRoles.includes(currentRole);
    const isPrimary = feature.primaryFor && feature.primaryFor.includes(currentRole);

    // Role affinity boost for domain-matched features
    if (score >= 25) {
      if (isAllowed) score += 30;
      if (isPrimary) score += 20;
    }

    return {
      feature,
      score,
      matchedKeywords,
      historicalSearchHits,
      isAllowed,
      isPrimary,
    };
  });

  // Sort strictly by relevance score
  const sortedScored = [...scoredFeatures].sort((a, b) => b.score - a.score);
  const bestMatch = sortedScored[0];

  // =========================================================================
  // CASE 1: UNKNOWN QUERY (Confidence below threshold)
  // =========================================================================
  if (!bestMatch || bestMatch.score < 18) {
    const roleExamples = {
      [ROLES.STUDENT]: [
        'How can I pay my fees?',
        'I want to check my attendance',
        'Download my certificate',
        'Where can I track my admission?',
      ],
      [ROLES.FACULTY]: [
        'How do I mark attendance?',
        'Show student attendance',
        'I need to upload attendance',
      ],
      [ROLES.ADMIN]: [
        'Manage new admissions',
        'How do I manage student fees?',
        'Generate a certificate',
        'Show university analytics',
      ],
    };

    return {
      status: 'UNKNOWN_QUERY',
      title: 'No confident recommendation found',
      explanation: 'No available university feature matched your task goal.',
      query: rawQuery,
      role: currentRole,
      suggestedQueries: roleExamples[currentRole] || roleExamples[ROLES.STUDENT],
    };
  }

  // =========================================================================
  // CASE 2: RESTRICTED ROLE (Feature exists, but user lacks permission)
  // =========================================================================
  if (!bestMatch.isAllowed) {
    const restrictedFeature = bestMatch.feature;
    const requiredRole = restrictedFeature.allowedRoles[0];

    // Find accessible alternatives for the user's current role
    const accessibleAlternatives = MOCK_FEATURES.filter((f) =>
      f.allowedRoles.includes(currentRole)
    );

    return {
      status: 'RESTRICTED_ROLE',
      title: 'Feature exists but your current role does not have permission',
      explanation: `The requested service "${restrictedFeature.title}" is designated exclusively for ${requiredRole.toUpperCase()} personnel.`,
      targetFeature: restrictedFeature,
      requiredRole,
      currentRole,
      permissionExplanation: `Your current persona is active with ${currentRole.toUpperCase()} privileges (${ANONYMIZED_USER_PROFILES[currentRole]?.name || 'Current User'}). To access this administrative tool, you must switch to the ${requiredRole.toUpperCase()} role or execute an authorized administrative override.`,
      accessibleAlternatives,
      query: rawQuery,
    };
  }

  // =========================================================================
  // CASE 4: INSUFFICIENT USAGE EVIDENCE
  // =========================================================================
  const isInsufficientEvidence = INSUFFICIENT_EVIDENCE_KEYWORDS.some((kw) => query.includes(kw));

  // =========================================================================
  // CASE: SUCCESSFUL RECOMMENDATION
  // =========================================================================
  const feature = bestMatch.feature;
  const ruleInfo = RECOMMENDATION_RULES[feature.id] || {
    ruleId: 'ROLE_MATCH + KEYWORD_MATCH + USAGE_EVIDENCE',
    why: `Your query contains keywords matching ${feature.title} and your current role has access.`,
    evidence: `Assigned in ${feature.department} service catalog; historical completion rate ${feature.usageMetrics?.completionRate || 80}%.`,
    baseConfidence: 90,
    intent: detectTaskIntent(query, currentRole),
  };

  // Compute normalized confidence score (e.g. 91% - 98%)
  const calculatedConfidence = Math.min(
    98,
    Math.max(
      84,
      Math.round(ruleInfo.baseConfidence + (bestMatch.score > 40 ? 3 : 0) + (bestMatch.historicalSearchHits > 10 ? 2 : 0))
    )
  );

  const isUnderused = !!feature.usageMetrics?.isUnderused;

  const usageEvidence = {
    currentRole,
    requiredRole: feature.allowedRoles[0],
    detectedKeywords: bestMatch.matchedKeywords.length > 0 ? bestMatch.matchedKeywords : words,
    matchingAnonymizedSearches: Math.max(12, bestMatch.historicalSearchHits || 18),
    completionRate: `${feature.usageMetrics?.completionRate || 82}%`,
    impressions: feature.usageMetrics?.impressions || 12000,
    opens: feature.usageMetrics?.opens || 8500,
    completions: feature.usageMetrics?.completions || 7100,
    evidenceStrength: isInsufficientEvidence ? 'Insufficient' : (feature.usageMetrics?.evidenceStrength || 'Strong'),
  };

  const transparentRule = isInsufficientEvidence
    ? 'ROLE_MATCH + KEYWORD_MATCH (INSUFFICIENT_USAGE_EVIDENCE)'
    : (bestMatch.isPrimary
      ? 'ROLE_MATCH + KEYWORD_MATCH + USAGE_EVIDENCE'
      : `${ruleInfo.ruleId} + ROLE_CLEARANCE`);

  const confidenceLevel = calculatedConfidence >= 85 ? 'High' : calculatedConfidence >= 65 ? 'Medium' : 'Low';

  const otherRecommendations = sortedScored
    .slice(1, 4)
    .filter((m) => m.isAllowed && m.score > 15)
    .map((m) => ({
      ...m.feature,
      matchScore: m.score,
      confidenceScore: Math.min(88, Math.max(60, Math.round(m.score + 30))),
      confidenceLevel: m.score >= 50 ? 'High' : m.score >= 30 ? 'Medium' : 'Low',
      why: RECOMMENDATION_RULES[m.feature.id]?.why || `Alternative match for ${currentRole} workspace.`,
    }));

  return {
    status: 'SUCCESS',
    feature,
    confidence: calculatedConfidence,
    confidenceStr: `${calculatedConfidence}%`,
    confidenceLevel,
    shortDescription: feature.description,
    why: ruleInfo.why,
    detectedIntent: ruleInfo.intent || detectTaskIntent(query, currentRole),
    matchingKeywords: usageEvidence.detectedKeywords,
    currentRole,
    requiredRole: feature.allowedRoles[0],
    usageEvidence,
    ruleTriggered: transparentRule,
    isUnderused,
    underusedReason: feature.usageMetrics?.underusedReason || null,
    isInsufficientEvidence,
    insufficientEvidenceNote: isInsufficientEvidence
      ? 'Recommendation based primarily on role and keyword rules. Historical usage evidence is limited for this specific intent.'
      : null,
    otherRecommendations,
    query: rawQuery,
  };
};

/**
 * Returns prioritized recommendations for a given role with transparent explainability
 */
export const getRecommendationsForRole = (role) => {
  const currentRole = role || ROLES.STUDENT;

  const roleFeatures = MOCK_FEATURES.filter((feat) =>
    feat.primaryFor && feat.primaryFor.includes(currentRole)
  );

  return roleFeatures.map((feature) => {
    const ruleInfo = RECOMMENDATION_RULES[feature.id] || {
      ruleId: `RULE_DEFAULT_${feature.id.toUpperCase().replace(/-/g, '_')}`,
      why: `Standard feature designated for ${currentRole} university workflows.`,
      evidence: `Assigned in ${feature.department} service catalog.`,
      baseConfidence: 88,
      intent: 'Core Role Feature Workflow',
    };

    const isUnderused = !!feature.usageMetrics?.isUnderused;

    return {
      ...feature,
      isAccessible: true,
      recommendation: {
        why: ruleInfo.why,
        evidence: ruleInfo.evidence,
        ruleId: ruleInfo.ruleId,
        confidence: `${ruleInfo.baseConfidence}%`,
        confidenceScore: ruleInfo.baseConfidence,
        detectedIntent: ruleInfo.intent,
        isUnderused,
        underusedReason: feature.usageMetrics?.underusedReason || null,
      },
    };
  }).sort((a, b) => b.recommendation.confidenceScore - a.recommendation.confidenceScore);
};

/**
 * Returns accessible underused features for the current role
 */
export const getUnderusedFeaturesForRole = (role) => {
  const currentRole = role || ROLES.STUDENT;
  return MOCK_FEATURES.filter(
    (f) => f.allowedRoles.includes(currentRole) && f.usageMetrics?.isUnderused
  );
};

/**
 * Backward-compatible helper for general search
 */
export const searchFeaturesWithAI = (rawQuery, currentRole) => {
  if (!rawQuery || rawQuery.trim().length === 0) {
    return getRecommendationsForRole(currentRole);
  }

  const result = evaluateDiscoveryQuery(rawQuery, currentRole);
  if (result.status === 'SUCCESS') {
    return [result.feature, ...(result.otherRecommendations || [])].map((feat) => {
      const isAllowed = feat.allowedRoles.includes(currentRole);
      const isPrimary = feat.primaryFor && feat.primaryFor.includes(currentRole);
      const ruleInfo = RECOMMENDATION_RULES[feat.id];
      return {
        ...feat,
        isAccessible: isAllowed,
        recommendation: {
          why: ruleInfo?.why || `Matched query keywords and assigned to ${feat.department}.`,
          evidence: ruleInfo?.evidence || `Verified in university catalog.`,
          ruleId: ruleInfo?.ruleId || 'RULE_SEMANTIC_FEATURE_DISCOVERY',
          confidence: `${result.confidence}%`,
          confidenceScore: result.confidence,
          detectedIntent: result.detectedIntent,
          isUnderused: !!feat.usageMetrics?.isUnderused,
          underusedReason: feat.usageMetrics?.underusedReason || null,
        },
      };
    });
  }

  return getRecommendationsForRole(currentRole);
};

