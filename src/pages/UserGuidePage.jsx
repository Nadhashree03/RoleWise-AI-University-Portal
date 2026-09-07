import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Database,
  Cpu,
  ArrowRight,
  Search,
  RotateCcw,
  AlertTriangle,
  FileCheck2,
  Lock,
  Code
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';

export const UserGuidePage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const [expandedSchema, setExpandedSchema] = useState(null);

  const sections = [
    { id: 1, title: '1. User Authentication & SSO Login', desc: 'Logging in with institutional email or User ID using bcrypt password validation.' },
    { id: 2, title: '2. Role-Based Identity & Boundaries', desc: 'Student, Faculty, and Administrator roles with strict RBAC boundary protection.' },
    { id: 3, title: '3. Formulating & Entering Task Goals', desc: 'Entering operational intent in natural language (e.g. "Pay semester tuition").' },
    { id: 4, title: '4. Consulting the Discovery Assistant', desc: 'Real-time transparent evaluation using rule catalog with zero external API dependencies.' },
    { id: 5, title: '5. Inspecting Recommendation Evidence', desc: 'Verifying confidence score, intent, rule IDs, and historical usage evidence.' },
    { id: 6, title: '6. Navigating to Recommended Services', desc: 'Direct workflow launching with pre-filled context and modal interactions.' },
    { id: 7, title: '7. Mandatory Human Confirmation', desc: 'Explicit two-step confirmation dialog explaining consequences before high-impact mutations.' },
    { id: 8, title: '8. Recommendation Override Flow', desc: 'Overriding AI suggestions with documented justification rationale in telemetry.' },
    { id: 9, title: '9. Reviewing Transaction Results', desc: 'Viewing receipts, generated documents, digital certificates, and roster updates.' },
    { id: 10, title: '10. Resilient Failure State Handling', desc: 'Graceful handling for unknown tasks, no-matches, ambiguities, and role restrictions.' },
    { id: 11, title: '11. Administrator Analytics & Experiments', desc: 'Evaluating live A/B experiment telemetry (Control vs Treatment) and underused features.' },
    { id: 12, title: '12. Forensic Audit Trail & Integrity', desc: 'Querying immutable SQLite WAL audit events with SHA-256 digital seals.' },
    { id: 13, title: '13. Change Review Lifecycle', desc: 'Tracking entity mutations through DRAFT → PENDING_REVIEW → APPROVED state transitions.' },
    { id: 14, title: '14. Secure Authorized Rollback', desc: 'Admin-only 1-click state reversion restoring prior snapshots with audit justification.' },
  ];

  const schemas = [
    {
      name: 'users',
      purpose: 'System credentials, role assignment, and department metadata',
      fields: [
        { name: 'id', type: 'TEXT PRIMARY KEY', desc: 'Unique account identifier (usr-student-01)' },
        { name: 'name', type: 'TEXT', desc: 'Full institutional name of student/faculty/admin' },
        { name: 'email', type: 'TEXT UNIQUE', desc: 'Primary university email address' },
        { name: 'userId', type: 'TEXT UNIQUE', desc: 'Alphanumeric campus ID (2023BCSE0142)' },
        { name: 'passwordHash', type: 'TEXT', desc: 'Bcrypt-hashed credential (rounds=10)' },
        { name: 'role', type: 'TEXT', desc: 'Security authorization scope: student | faculty | admin' },
      ],
    },
    {
      name: 'feature_usage_events',
      purpose: 'Anonymized event telemetry tracking A/B experiment discovery and completion',
      fields: [
        { name: 'id', type: 'TEXT PRIMARY KEY', desc: 'Event identifier (EVT-LIVE-XXXXXX)' },
        { name: 'anonymous_user_id', type: 'TEXT', desc: 'Anonymized participant ID (anon-std-001)' },
        { name: 'role', type: 'TEXT', desc: 'Participant role' },
        { name: 'feature_id', type: 'TEXT', desc: 'Target university service ID' },
        { name: 'event_type', type: 'TEXT', desc: 'feature_view | feature_open | action_completed | assistant_override' },
        { name: 'discovered', type: 'INTEGER', desc: '1 if feature was discovered during task' },
        { name: 'completed', type: 'INTEGER', desc: '1 if workflow was successfully completed' },
        { name: 'experiment_group', type: 'TEXT', desc: 'Deterministic cohort: control | assistant' },
        { name: 'duration_ms', type: 'INTEGER', desc: 'Time taken in milliseconds' },
      ],
    },
    {
      name: 'task_goals',
      purpose: 'Natural language task objectives submitted by users',
      fields: [
        { name: 'id', type: 'TEXT PRIMARY KEY', desc: 'Goal ID (GOAL-LIVE-XXXXXX)' },
        { name: 'anonymous_user_id', type: 'TEXT', desc: 'Anonymized participant ID' },
        { name: 'role', type: 'TEXT', desc: 'Active role' },
        { name: 'goal_text', type: 'TEXT', desc: 'Raw task goal entered by user' },
        { name: 'normalized_goal', type: 'TEXT', desc: 'Cleaned lowercase goal text for semantic matching' },
        { name: 'feature_id', type: 'TEXT', desc: 'Mapped target feature' },
      ],
    },
    {
      name: 'help_search_queries',
      purpose: 'Search queries and search success outcomes',
      fields: [
        { name: 'id', type: 'TEXT PRIMARY KEY', desc: 'Query event ID (QRY-LIVE-XXXXXX)' },
        { name: 'query_text', type: 'TEXT', desc: 'User search query' },
        { name: 'result_type', type: 'TEXT', desc: 'matched | ambiguous | no_match' },
        { name: 'success', type: 'INTEGER', desc: '1 if search resulted in successful navigation' },
      ],
    },
    {
      name: 'experiment_assignments',
      purpose: 'Deterministic hash-based partition of users into Control vs Assistant cohorts',
      fields: [
        { name: 'id', type: 'TEXT PRIMARY KEY', desc: 'Assignment ID' },
        { name: 'anonymous_user_id', type: 'TEXT UNIQUE', desc: 'Anonymized participant ID' },
        { name: 'experiment_name', type: 'TEXT', desc: '"RoleWise Feature Discovery Experiment"' },
        { name: 'experiment_group', type: 'TEXT', desc: '"control" (no AI) or "assistant" (RoleWise AI)' },
      ],
    },
    {
      name: 'audit_logs',
      purpose: 'Immutable audit trail of all security, governance, and workflow operations',
      fields: [
        { name: 'id', type: 'TEXT PRIMARY KEY', desc: 'Audit event ID (EVT-XXXXXX)' },
        { name: 'actor', type: 'TEXT', desc: 'Actor name and role' },
        { name: 'action', type: 'TEXT', desc: 'Standardized system event code' },
        { name: 'module', type: 'TEXT', desc: 'fees | attendance | admissions | certificates | rollback' },
        { name: 'status', type: 'TEXT', desc: 'Authorized (200) | Denied (403)' },
        { name: 'overrideReason', type: 'TEXT', desc: 'Justification for overrides or rollbacks' },
      ],
    },
    {
      name: 'change_history',
      purpose: 'Reversible state snapshots supporting 1-click administrative rollback',
      fields: [
        { name: 'id', type: 'TEXT PRIMARY KEY', desc: 'Change history ID (CHG-XXXX)' },
        { name: 'entityType', type: 'TEXT', desc: 'admission | fee | attendance' },
        { name: 'previousValue', type: 'TEXT', desc: 'JSON snapshot of entity prior to mutation' },
        { name: 'newValue', type: 'TEXT', desc: 'JSON snapshot of entity following mutation' },
        { name: 'isRolledBack', type: 'INTEGER', desc: '1 if reverted to previousValue' },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              RoleWise AI Operational User Guide & Architecture
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              Complete Reference
            </span>
          </div>
          <p className="text-sm text-slate-400">
            End-to-end operational walkthroughs across 14 system stages, architecture diagrams, and schema specifications.
          </p>
        </div>
      </div>

      {/* Visual System Architecture Diagram */}
      <GlassCard className="p-6 border-slate-800/80 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          End-to-End System Architecture Pipeline
        </h2>
        <p className="text-xs text-slate-400">
          How user requests traverse role security, transparent rule evaluation, human confirmation, execution, and audit trail persistence.
        </p>

        {/* ASCII/Visual Interactive Diagram */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300">
          <div className="text-cyan-400 font-bold mb-2">// ROLEWISE AI OPERATIONAL DATA FLOW PIPELINE</div>
          <div className="flex items-center gap-2 flex-wrap text-slate-200">
            <span className="px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-bold">1. User Request</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">2. University Portal</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold">3. RoleWise Assistant</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300 font-bold">4. Rule Engine</span>
          </div>

          <div className="my-3 pl-4 border-l-2 border-indigo-500/40 text-[11px] text-slate-400 space-y-1">
            <div>↳ Evaluates: <span className="text-indigo-300">User Role (JWT)</span> + <span className="text-cyan-300">Task Goal</span> + <span className="text-purple-300">Help Query</span> + <span className="text-emerald-300">Usage History</span> + <span className="text-amber-300">Underused Status</span></div>
            <div>↳ Generates: <span className="text-white font-bold">Recommendation + Confidence Score + Explainability Evidence Tags</span></div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-slate-200">
            <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-bold">5. Human Confirmation</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold">6. Feature Action</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-bold">7. Audit Trail Ledger</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>↳ Sidecars: <span className="text-cyan-300">Experiment Analytics (A/B)</span> • <span className="text-indigo-300">Change Review</span> • <span className="text-emerald-300">Secure Rollback</span></span>
            <span className="text-slate-500 font-mono">Persistence: SQLite WAL (Node.js DatabaseSync)</span>
          </div>
        </div>
      </GlassCard>

      {/* 14 Operational Sections Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Section List */}
        <GlassCard className="p-4 border-slate-800/80 space-y-2 h-fit">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Operational Manual (14 Stages)
          </div>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                activeSection === s.id
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span className="truncate">{s.title}</span>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          ))}
        </GlassCard>

        {/* Active Section Detailed Walkthrough */}
        <GlassCard className="lg:col-span-2 p-6 border-slate-800/80 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              {sections.find((s) => s.id === activeSection)?.title}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Stage {activeSection} of 14
            </span>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed space-y-3">
            <p className="text-slate-400">
              {sections.find((s) => s.id === activeSection)?.desc}
            </p>

            {activeSection === 1 && (
              <div className="space-y-2">
                <p>Navigate to <code>/login</code>. Enter your institutional email or University User ID (e.g. <code>student@rolewise.edu</code> or <code>2023BCSE0142</code>). The backend authenticates credentials with <code>bcrypt.compare</code> and issues a cryptographically signed JWT token stored in <code>localStorage</code>.</p>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300">
                  POST /api/auth/login {"->"} HTTP 200 OK + JWT Bearer Token
                </div>
              </div>
            )}

            {activeSection === 2 && (
              <div className="space-y-2">
                <p>The application supports three distinct security tiers: <strong>Student</strong>, <strong>Faculty</strong>, and <strong>Administrator</strong>. Accessing a URL outside your role (such as a student navigating directly to <code>/manage-admissions</code>) immediately triggers an institutional 403 Access Restriction screen and logs an unauthorized attempt in the persistent audit ledger.</p>
              </div>
            )}

            {activeSection === 3 && (
              <div className="space-y-2">
                <p>In the Discovery Assistant (<code>/assistant</code>), enter what you wish to accomplish into the Task Goal prompt. Examples include: <em>"Pay remaining tuition dues before due date"</em>, <em>"Mark daily attendance for CS701"</em>, or <em>"Review candidate admissions merit list"</em>.</p>
              </div>
            )}

            {activeSection === 4 && (
              <div className="space-y-2">
                <p>Click <strong>"Ask Assistant"</strong> or press Enter. The transparent rule-based engine evaluates token semantics, active role permissions, and database telemetry without sending queries to any cloud LLM API, ensuring 100% data privacy and sub-10ms response times.</p>
              </div>
            )}

            {activeSection === 5 && (
              <div className="space-y-2">
                <p>Every recommendation is accompanied by an explainability evidence card answering <em>"Why was this recommended?"</em>. It articulates your active role match, keyword matches, active catalog rule IDs, and historical usage statistics from persistent database records.</p>
              </div>
            )}

            {activeSection === 6 && (
              <div className="space-y-2">
                <p>Click <strong>"Open Feature"</strong> to launch the recommended workflow modal directly. State is synchronized with the SQLite database via backend REST APIs.</p>
              </div>
            )}

            {activeSection === 7 && (
              <div className="space-y-2">
                <p>High-impact operations (submitting fee payments, finalizing admissions approvals, uploading attendance rosters, or issuing certificates) require explicit confirmation through a High-Impact Confirmation Dialog explaining the exact entity and consequences.</p>
              </div>
            )}

            {activeSection === 8 && (
              <div className="space-y-2">
                <p>If the assistant's suggestion is not what you intended, click <strong>"Choose a different feature"</strong>. A structured override prompt captures your rationale (e.g. "Recommendation was incorrect", "I needed another service") and logs it directly into telemetry and audit trails for ongoing error analysis.</p>
              </div>
            )}

            {activeSection === 9 && (
              <div className="space-y-2">
                <p>After completing an action, verify the updated balance, receipt number, or status badge. An audit event is synchronously committed to SQLite in WAL mode.</p>
              </div>
            )}

            {activeSection === 10 && (
              <div className="space-y-2">
                <p>RoleWise AI includes dedicated, graceful failure state cards for: <strong>Unknown Task</strong>, <strong>No Matching Feature</strong>, <strong>Ambiguous Request</strong>, <strong>Restricted Feature</strong>, <strong>Service Unavailable</strong>, and <strong>High-Impact Action Failure</strong> with retry and help options.</p>
              </div>
            )}

            {activeSection === 11 && (
              <div className="space-y-2">
                <p>Administrators can navigate to <code>/analytics</code> to review the A/B Experiment comparison matrix (Control vs Treatment), underused feature rankings, and operational KPIs computed live from the persistent SQLite database.</p>
              </div>
            )}

            {activeSection === 12 && (
              <div className="space-y-2">
                <p>The Audit Trail page (<code>/audit</code>) provides an immutable, searchable forensics ledger with multi-criteria filters (Role, Action, Module, Status) and HMAC-256 seal verification.</p>
              </div>
            )}

            {activeSection === 13 && (
              <div className="space-y-2">
                <p>All reversible entity modifications are logged in <code>change_history</code> with before/after state diffs (DRAFT → PENDING_REVIEW → APPROVED) and point-in-time recovery pointers.</p>
              </div>
            )}

            {activeSection === 14 && (
              <div className="space-y-2">
                <p>Authorized Administrators can execute 1-click state rollback from the Change History ledger. Unauthorized rollback attempts by Students or Faculty are rejected with HTTP 403 Forbidden.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Database Schema Documentation */}
      <GlassCard className="p-6 border-slate-800/80 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          Persistent Relational Schema Documentation (SQLite)
        </h2>
        <p className="text-xs text-slate-400">
          Detailed entity descriptions, data types, primary keys, and relationships across persistent database tables.
        </p>

        <div className="space-y-3">
          {schemas.map((s, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <button
                onClick={() => setExpandedSchema(expandedSchema === s.name ? null : s.name)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-900/40 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <code className="text-cyan-400 font-mono font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    {s.name}
                  </code>
                  <span className="text-slate-300 font-medium">— {s.purpose}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSchema === s.name ? 'rotate-180' : ''}`} />
              </button>

              {expandedSchema === s.name && (
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800 pb-2 font-semibold">
                        <th className="pb-2">Field</th>
                        <th className="pb-2 font-mono">SQL Type</th>
                        <th className="pb-2">Description / Integrity Constraint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono text-[11px]">
                      {s.fields.map((f, fIdx) => (
                        <tr key={fIdx} className="hover:bg-slate-800/20">
                          <td className="py-2 text-indigo-300 font-bold">{f.name}</td>
                          <td className="py-2 text-cyan-400">{f.type}</td>
                          <td className="py-2 text-slate-400 font-sans">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
