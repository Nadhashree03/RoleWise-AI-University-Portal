/**
 * RoleWise AI - Local Semantic NLP Recommendation Engine
 *
 * Implements a lightweight, local, reproducible TF-IDF vectorizer + Cosine Similarity
 * vector space with n-gram tokenization and morphological normalization.
 * Matches user intent without external cloud LLMs or third-party APIs.
 */

// Common English Contractions Expansion Map
const CONTRACTIONS = {
  "i'm": "i am",
  "i'd": "i would",
  "i'll": "i will",
  "i've": "i have",
  "can't": "cannot",
  "won't": "will not",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "hasn't": "has not",
  "haven't": "have not",
  "hadn't": "had not",
  "couldn't": "could not",
  "shouldn't": "should not",
  "wouldn't": "would not",
  "what's": "what is",
  "where's": "where is",
  "how's": "how is",
  "it's": "it is",
};

// Domain-aware Stop Words (words that carry near-zero discriminative value across university services)
const STOP_WORDS = new Set([
  'a', 'about', 'above_all', 'all', 'along', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'been', 'being', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
  'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no',
  'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'please', 'want', 'like', 'need', 'get',
  'got', 'give', 'tell', 'show', 'find', 'check', 'view'
]);

/**
 * Algorithmic Morphological Normalizer (Domain-focused Porter-style stemmer)
 * Normalizes inflectional forms to semantic stems.
 */
export function stemWord(word) {
  if (!word || word.length <= 2) return word;
  let w = word.toLowerCase();

  // Specific domain synonym/morphology normalization
  if (w.startsWith('pay') || w === 'paid' || w === 'bursar' || w === 'tuition' || w === 'dues' || w === 'invoice') return 'pay';
  if (w.startsWith('attend') || w === 'present' || w === 'rollcall' || w === 'absent' || w === 'roster') return 'attend';
  if (w.startsWith('certif') || w === 'transcript' || w === 'diploma' || w === 'degree' || w === 'bonafide' || w === 'convocation') return 'certif';
  if (w.startsWith('admiss') || w.startsWith('applic') || w === 'matriculat' || w === 'merit' || w === 'quota' || w === 'intake') return 'admiss';
  if (w.startsWith('upload') || w === 'import' || w === 'ingest' || w === 'sync' || w === 'csv' || w === 'excel' || w === 'spreadsheet') return 'upload';
  if (w.startsWith('mark') || w === 'taking' || w === 'record' || w === 'recording') return 'mark';
  if (w.startsWith('download') || w === 'export' || w === 'retrieve' || w === 'fetch') return 'download';
  if (w.startsWith('track') || w === 'status' || w === 'progress' || w === 'milestone') return 'track';
  if (w.startsWith('manag') || w === 'admin' || w === 'review' || w === 'reconcil') return 'manag';
  if (w.startsWith('generat') || w === 'issue' || w === 'issuing' || w === 'seal') return 'generat';
  if (w === 'percent' || w === 'percentage' || w === '75%') return 'percent';
  if (w === '75') return '75';

  // Suffix rules
  if (w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.endsWith('ss')) return w;
  if (w.endsWith('s') && !w.endsWith('us') && !w.endsWith('is')) w = w.slice(0, -1);

  if (w.endsWith('eed')) return w.slice(0, -1);
  if (w.endsWith('ed') && w.length > 4) w = w.slice(0, -2);
  if (w.endsWith('ing') && w.length > 5) w = w.slice(0, -3);

  if (w.endsWith('ation')) return w.slice(0, -5) + 'e';
  if (w.endsWith('tional')) return w.slice(0, -2);
  if (w.endsWith('ment') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ance') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ence') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('able') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ible') && w.length > 6) return w.slice(0, -4);

  return w;
}

/**
 * Preprocesses and tokenizes raw text into unigrams and bigrams.
 */
export function tokenizeAndPreprocess(text) {
  if (!text || typeof text !== 'string') return [];

  // Expand contractions
  let cleaned = text.toLowerCase();
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    cleaned = cleaned.replace(new RegExp(`\\b${contraction}\\b`, 'g'), expansion);
  }

  // Replace punctuation with spaces except for '%'
  cleaned = cleaned.replace(/[%]/g, ' percent ').replace(/[^a-z0-9\s]/g, ' ');

  // Split into raw word tokens
  const rawWords = cleaned.split(/\s+/).filter((w) => w.length > 0);

  const tokens = [];
  const stems = [];

  for (const w of rawWords) {
    const stem = stemWord(w);
    stems.push(stem);
    if (!STOP_WORDS.has(w) || w === '75' || w === 'percent') {
      tokens.push(stem);
    }
  }

  // Generate bigrams only if at least one token is NOT a stop word
  for (let i = 0; i < rawWords.length - 1; i++) {
    const w1 = rawWords[i];
    const w2 = rawWords[i + 1];
    // If both words are common stop words (e.g. "i want", "want to", "need to"), do not create bigram
    if (STOP_WORDS.has(w1) && STOP_WORDS.has(w2) && w1 !== '75' && w2 !== '75' && w1 !== 'percent' && w2 !== 'percent') {
      continue;
    }
    const s1 = stems[i];
    const s2 = stems[i + 1];
    tokens.push(`${s1}_+${s2}`);
  }

  return tokens;
}

/**
 * TF-IDF Vectorizer
 * Computes term-frequency inverse-document-frequency vectors with L2 normalization.
 */
export class TfidfVectorizer {
  constructor() {
    this.vocabulary = new Map(); // term -> index
    this.idf = []; // index -> idf weight
    this.docCount = 0;
  }

  fit(documents) {
    this.docCount = documents.length;
    this.vocabulary.clear();
    const docFrequency = new Map();

    // 1. Compute Document Frequencies
    documents.forEach((doc) => {
      const tokens = Array.isArray(doc) ? doc : tokenizeAndPreprocess(doc);
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach((term) => {
        docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
      });
    });

    // 2. Build Vocabulary and IDF Weights
    let index = 0;
    this.idf = [];
    docFrequency.forEach((df, term) => {
      this.vocabulary.set(term, index);
      // Smooth IDF formula: ln((1 + N) / (1 + df)) + 1
      const idfWeight = Math.log((1 + this.docCount) / (1 + df)) + 1.0;
      this.idf.push(idfWeight);
      index++;
    });

    return this;
  }

  transform(textOrTokens) {
    const tokens = Array.isArray(textOrTokens) ? textOrTokens : tokenizeAndPreprocess(textOrTokens);
    if (tokens.length === 0 || this.vocabulary.size === 0) {
      return { indices: [], values: [], norm: 0 };
    }

    const termCounts = new Map();
    tokens.forEach((t) => {
      const idx = this.vocabulary.get(t);
      if (idx !== undefined) {
        termCounts.set(idx, (termCounts.get(idx) || 0) + 1);
      }
    });

    if (termCounts.size === 0) {
      return { indices: [], values: [], norm: 0 };
    }

    const indices = [];
    const values = [];
    let sumSquares = 0;

    termCounts.forEach((count, idx) => {
      const tf = count / tokens.length;
      const weight = tf * this.idf[idx];
      indices.push(idx);
      values.push(weight);
      sumSquares += weight * weight;
    });

    const norm = Math.sqrt(sumSquares);
    const normalizedValues = norm > 0 ? values.map((v) => v / norm) : values;

    return {
      indices,
      values: normalizedValues,
      norm,
    };
  }

  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.indices.length === 0 || vecB.indices.length === 0) {
      return 0.0;
    }

    let dotProduct = 0;
    let i = 0;
    let j = 0;

    // Fast sparse dot product (both sorted by indices)
    while (i < vecA.indices.length && j < vecB.indices.length) {
      const idxA = vecA.indices[i];
      const idxB = vecB.indices[j];

      if (idxA === idxB) {
        dotProduct += vecA.values[i] * vecB.values[j];
        i++;
        j++;
      } else if (idxA < idxB) {
        i++;
      } else {
        j++;
      }
    }

    return Math.max(0.0, Math.min(1.0, dotProduct));
  }
}

/**
 * Feature Semantic Knowledge Base
 * Defines semantic documents, intent clusters, and variations for each of the 10 university services.
 */
export const FEATURE_SEMANTIC_DOCUMENTS = {
  // STUDENT WORKFLOWS
  'pay-fees': {
    id: 'pay-fees',
    title: 'Pay Tuition Fees',
    role: 'student',
    category: 'Finance',
    canonicalIntent: 'Tuition Fee Settlement & Invoice Clearance',
    keywords: ['pay', 'fee', 'tuition', 'bursar', 'dues', 'invoice', 'balance', 'receipt', 'settle', 'hostel', 'semester'],
    variations: [
      'I need to pay my semester fees',
      'Where can I make my tuition payment',
      'How do I pay my college fees',
      'Check my pending tuition invoice balance',
      'Settle hostel and semester bursar dues online',
      'Submit university fee payment and download receipt',
      'Payment of college and examination dues',
      'Pay online fees through upi card net banking',
      'Clear my outstanding tuition fee balance',
      'Tuition transaction receipt and bursar payment',
    ],
  },
  'view-attendance': {
    id: 'view-attendance',
    title: 'View Attendance',
    role: 'student',
    category: 'Academics',
    canonicalIntent: 'Personal Attendance & Exam Threshold Monitoring',
    keywords: ['attendance', 'attend', 'percentage', '75', 'threshold', 'lectures', 'classes', 'rollcall', 'deficit', 'shortage'],
    variations: [
      'How much attendance have I got',
      'Can I check my attendance percentage',
      'Am I above the 75 percent attendance requirement',
      'What is my current attendance status in lectures',
      'Do I have enough attendance to sit for semester examinations',
      'Check if I am eligible for exams based on attendance',
      'Show my attendance percentage for all registered courses',
      'View attended classes roll call and absence records',
      'Check my attendance shortage and exam eligibility',
      'Track my subject wise lecture attendance percentage',
    ],
  },
  'download-certificate': {
    id: 'download-certificate',
    title: 'Download Certificate',
    role: 'student',
    category: 'Records',
    canonicalIntent: 'Official Academic Credential & Transcript Download',
    keywords: ['certificate', 'degree', 'transcript', 'bonafide', 'diploma', 'credential', 'provisional', 'graduation', 'convocation'],
    variations: [
      'Where can I download my degree certificate',
      'I need an official bonafide certificate for bank loan',
      'Download my verified transcript and grade card',
      'Get my provisional course completion certificate',
      'Download digital signed bona fide certificate',
      'Obtain my official university credential and diploma',
      'Student bonafide certificate request and download',
      'Official academic transcript and course marks certificate',
      'Download graduation degree certificate with seal',
    ],
  },
  'track-admission': {
    id: 'track-admission',
    title: 'Track Admission',
    role: 'student',
    category: 'Admissions',
    canonicalIntent: 'Student Admission Lifecycle & Verification Tracking',
    keywords: ['admission', 'applicant', 'status', 'track', 'seat', 'counseling', 'merit', 'rank', 'allotment', 'matriculation'],
    variations: [
      'I want to check my admission status',
      'Track my college application progress and seat allotment',
      'What is the status of my admission verification',
      'Check merit rank and counseling round intake',
      'Track my undergraduate admission candidate file',
      'Has my university admission application been approved',
      'Check admission cutoff merit list and document verification',
      'Admission seat allotment letter and candidate status',
    ],
  },

  // FACULTY WORKFLOWS
  'mark-attendance': {
    id: 'mark-attendance',
    title: 'Mark Lecture Attendance',
    role: 'faculty',
    category: 'Academics',
    canonicalIntent: 'Classroom Lecture Roll-Call Submission',
    keywords: ['mark', 'attendance', 'lecture', 'rollcall', 'class', 'present', 'absent', 'today', 'session', 'submit'],
    variations: [
      'I need to mark attendance for today class',
      'Take daily roll call for CS lecture',
      'Record student present and absent status for room 304',
      'Submit classroom lecture attendance to registrar',
      'Mark today roll call for my enrolled students',
      'Take lecture attendance for computer science section',
      'Record classroom attendance for scheduled lecture',
      'Submit attendance roll call for today course session',
    ],
  },
  'view-student-attendance': {
    id: 'view-student-attendance',
    title: 'View Student Attendance',
    role: 'faculty',
    category: 'Academics',
    canonicalIntent: 'Cohort Attendance Deficit & At-Risk Intervention',
    keywords: ['student', 'attendance', 'roster', 'deficit', 'at-risk', 'below', '75', 'advisee', 'cohort', 'overview'],
    variations: [
      'I want to see attendance for all students',
      'Check which students are below the 75 percent threshold',
      'Identify at risk students with attendance deficit',
      'View semester attendance roster for advisees',
      'Show course attendance records for all enrolled students',
      'Monitor students with low attendance and absenteeism',
      'View class attendance sheet and deficit alerts',
      'See attendance report across all student batches',
    ],
  },
  'upload-attendance': {
    id: 'upload-attendance',
    title: 'Upload Attendance File',
    role: 'faculty',
    category: 'Academics',
    canonicalIntent: 'Batch Biometric Smartcard Attendance Ingestion',
    keywords: ['upload', 'attendance', 'biometric', 'rfid', 'smartcard', 'csv', 'excel', 'spreadsheet', 'scanner', 'batch'],
    variations: [
      'I need to upload attendance data',
      'Batch import biometric RFID smartcard scanner logs',
      'Upload attendance excel spreadsheet or CSV file',
      'Sync offline biometric card reader data',
      'Ingest attendance log file from lab scanner',
      'Upload attendance roster csv with student swipe times',
      'Import biometric attendance spreadsheet for class',
    ],
  },

  // ADMIN WORKFLOWS
  'manage-admissions': {
    id: 'manage-admissions',
    title: 'Manage Admissions',
    role: 'admin',
    category: 'Admissions',
    canonicalIntent: 'Admissions Intake Governance & Seat Allocation',
    keywords: ['manage', 'admission', 'applicant', 'approve', 'reject', 'intake', 'candidate', 'review', 'merit', 'quota'],
    variations: [
      'I want to review admission applications',
      'Evaluate applicant merit files and approve intake seats',
      'Review candidate applications in Batch review queue',
      'Finalize merit admissions and seat quotas',
      'Approve or reject candidate admission applications',
      'Admin admissions intake governance and seat allocation',
      'Review applicant batch dossiers and finalize selections',
    ],
  },
  'manage-fees': {
    id: 'manage-fees',
    title: 'Manage Fees',
    role: 'admin',
    category: 'Finance',
    canonicalIntent: 'Tuition Fee Collection & Gateway Reconciliation',
    keywords: ['manage', 'fee', 'reconcil', 'payment', 'gateway', 'audit', 'overdue', 'collection', 'settle', 'bursar'],
    variations: [
      'I need to manage student fees',
      'Reconcile payment gateway transactions and bursar accounts',
      'Manage student tuition fees and overdue fee accounts',
      'Audit university fee collection and payment settlements',
      'Reconcile campus banking fee gateway settlements',
      'Review overdue tuition fees and reconcile student ledgers',
      'Admin bursar fee management and gateway audit',
    ],
  },
  'generate-certificates': {
    id: 'generate-certificates',
    title: 'Generate Certificates',
    role: 'admin',
    category: 'Records',
    canonicalIntent: 'Batch Convocation Degree Cryptographic Signing',
    keywords: ['generate', 'certificate', 'issue', 'degree', 'sign', 'cryptographic', 'convocation', 'diploma', 'transcript', 'seal'],
    variations: [
      'I need to generate certificates',
      'Batch issue digital degree credentials with cryptographic signature',
      'Generate verifiable student certificates and transcripts',
      'Sign and publish graduating senior certificates with SHA-256 seal',
      'Issue official university convocation degree certificates',
      'Batch credential generation for graduating class',
      'Sign institutional bona fide and degree certificates',
    ],
  },
};

/**
 * Pre-compiled Semantic Model Singleton
 */
class SemanticVectorEngine {
  constructor() {
    this.vectorizer = new TfidfVectorizer();
    this.featureVectors = new Map(); // featureId -> { titleVec, aggregateVec, variationVectors: [] }
    this.isTrained = false;
  }

  train() {
    if (this.isTrained) return;

    const allDocuments = [];

    // 1. Build document corpus
    Object.values(FEATURE_SEMANTIC_DOCUMENTS).forEach((f) => {
      // Aggregate document: Title + Category + Keywords + Variations
      const aggregateDoc = [
        f.title,
        f.category,
        f.keywords.join(' '),
        f.variations.join(' '),
      ].join(' ');

      allDocuments.push(aggregateDoc);

      // Add individual variations as reference documents to enrich IDF space
      f.variations.forEach((v) => allDocuments.push(v));
    });

    // 2. Fit TF-IDF Vectorizer
    this.vectorizer.fit(allDocuments);

    // 3. Compute reference vectors for each feature
    Object.values(FEATURE_SEMANTIC_DOCUMENTS).forEach((f) => {
      const aggregateDoc = [
        f.title,
        f.category,
        f.keywords.join(' '),
        f.variations.join(' '),
      ].join(' ');

      const aggregateVec = this.vectorizer.transform(aggregateDoc);
      const titleVec = this.vectorizer.transform(f.title);
      const variationVectors = f.variations.map((v) => this.vectorizer.transform(v));

      this.featureVectors.set(f.id, {
        aggregateVec,
        titleVec,
        variationVectors,
        role: f.role,
        title: f.title,
        category: f.category,
        canonicalIntent: f.canonicalIntent,
      });
    });

    this.isTrained = true;
  }

  /**
   * Computes semantic similarity between query and all 10 features.
   * Returns sorted array of matching candidates.
   */
  match(query, currentRole = 'student') {
    if (!this.isTrained) {
      this.train();
    }

    const queryTokens = tokenizeAndPreprocess(query);
    const queryVec = this.vectorizer.transform(queryTokens);

    if (queryVec.indices.length === 0) {
      return [];
    }

    const results = [];

    for (const [featId, data] of this.featureVectors.entries()) {
      // 1. Aggregate document similarity
      const aggSim = TfidfVectorizer.cosineSimilarity(queryVec, data.aggregateVec);

      // 2. Title similarity
      const titleSim = TfidfVectorizer.cosineSimilarity(queryVec, data.titleVec);

      // 3. Maximum similarity among canonical variations
      let maxVarSim = 0;
      for (const varVec of data.variationVectors) {
        const sim = TfidfVectorizer.cosineSimilarity(queryVec, varVec);
        if (sim > maxVarSim) maxVarSim = sim;
      }

      // Weighted semantic score: prioritizes closest variation match or strong aggregate alignment
      const semanticScore = 0.55 * maxVarSim + 0.30 * aggSim + 0.15 * titleSim;

      // Extract matched semantic stems
      const matchedTokens = [];
      queryTokens.forEach((qt) => {
        const idx = this.vectorizer.vocabulary.get(qt);
        if (idx !== undefined && data.aggregateVec.indices.includes(idx)) {
          if (!matchedTokens.includes(qt)) matchedTokens.push(qt);
        }
      });

      results.push({
        featureId: featId,
        title: data.title,
        category: data.category,
        targetRole: data.role,
        isAllowedForRole: data.role === currentRole,
        canonicalIntent: data.canonicalIntent,
        semanticScore: parseFloat(semanticScore.toFixed(4)),
        maxVariationSimilarity: parseFloat(maxVarSim.toFixed(4)),
        aggregateSimilarity: parseFloat(aggSim.toFixed(4)),
        matchedTokens,
      });
    }

    // Sort by semantic similarity descending
    results.sort((a, b) => b.semanticScore - a.semanticScore);
    return results;
  }
}

// Global trained instance
export const semanticVectorEngine = new SemanticVectorEngine();
semanticVectorEngine.train();
