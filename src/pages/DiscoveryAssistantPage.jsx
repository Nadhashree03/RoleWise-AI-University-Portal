import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  FileCheck,
  Compass,
  UserCheck,
  Users,
  UploadCloud,
  GraduationCap,
  Coins,
  Award,
  BarChart3,
  Info,
  Cpu,
  Zap,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  History,
  HelpCircle,
  ExternalLink,
  X,
  Layers,
  TrendingUp,
  Check,
  RotateCcw,
  FileText,
  Lightbulb,
  ThumbsDown,
  ArrowUpRight,
  Split
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import {
  evaluateDiscoveryQuery,
  getRecommendationsForRole,
  getUnderusedFeaturesForRole
} from '../engine/recommendationEngine';
import {
  MOCK_FEATURES,
  OVERRIDE_REASON_OPTIONS,
  EXPERIMENT_METRICS,
  ANONYMIZED_USER_PROFILES
} from '../data/mockData';

export const DiscoveryAssistantPage = () => {
  const {
    currentRole,
    currentUser,
    switchRole,
    openFeature,
    recordAssistantAudit,
    showToast
  } = useRole();

  const [activeTab, setActiveTab] = useState('assistant'); // 'assistant' | 'underused' | 'experiment'
  const [query, setQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState([
    'How can I pay my fees?',
    'Check my attendance',
    'Download my certificate'
  ]);
  const [expandedEvidence, setExpandedEvidence] = useState(true);
  const [rejectedFeatures, setRejectedFeatures] = useState({}); // featureId -> reason

  // Override reason modal state
  const [overrideModal, setOverrideModal] = useState({
    isOpen: false,
    feature: null,
    recommendation: null,
    selectedReason: OVERRIDE_REASON_OPTIONS[0],
    customReason: '',
  });

  // Alternative feature selector modal state
  const [alternativeModal, setAlternativeModal] = useState({
    isOpen: false,
    originalFeature: null,
  });

  // Reset query whenever role changes so active role's recommendations immediately update
  useEffect(() => {
    setQuery('');
    setRejectedFeatures({});
  }, [currentRole]);

  // Role query pills
  const roleQueryPills = {
    [ROLES.STUDENT]: [
      { text: 'How can I pay my fees?', type: 'primary' },
      { text: 'I want to check my attendance', type: 'primary' },
      { text: 'Download my certificate', type: 'underused' },
      { text: 'Where can I track my admission?', type: 'primary' },
      { text: 'I want to manage admissions', type: 'restricted' },
      { text: 'I need help with records', type: 'ambiguous' },
      { text: 'I need help with something unrelated', type: 'unknown' },
    ],
    [ROLES.FACULTY]: [
      { text: 'How do I mark attendance?', type: 'primary' },
      { text: 'Show student attendance', type: 'primary' },
      { text: 'I need to upload attendance', type: 'underused' },
      { text: 'biometric maintenance outage', type: 'unavailable' },
      { text: 'I need help with records', type: 'ambiguous' },
    ],
    [ROLES.ADMIN]: [
      { text: 'Manage new admissions', type: 'primary' },
      { text: 'How do I manage student fees?', type: 'primary' },
      { text: 'Generate a certificate', type: 'underused' },
      { text: 'Show university analytics', type: 'primary' },
      { text: 'I need help with records', type: 'ambiguous' },
    ],
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'CreditCard': return CreditCard;
      case 'CalendarCheck': return CalendarCheck;
      case 'FileCheck': return FileCheck;
      case 'Compass': return Compass;
      case 'UserCheck': return UserCheck;
      case 'Users': return Users;
      case 'UploadCloud': return UploadCloud;
      case 'GraduationCap': return GraduationCap;
      case 'Coins': return Coins;
      case 'Award': return Award;
      case 'BarChart3': return BarChart3;
      default: return Sparkles;
    }
  };

  // Evaluate query using the transparent rule-based engine
  const discoveryResult = query.trim()
    ? evaluateDiscoveryQuery(query, currentRole)
    : { status: 'EMPTY_QUERY', recommendations: getRecommendationsForRole(currentRole) };

  // Accessible features for current role (for alternative selector)
  const accessibleFeaturesForRole = MOCK_FEATURES.filter((f) =>
    f.allowedRoles.includes(currentRole)
  );

  // Underused features for current role
  const underusedFeatures = getUnderusedFeaturesForRole(currentRole);

  // Action: Submit a query
  const handleQuerySelect = (newQuery) => {
    setQuery(newQuery);
    if (!queryHistory.includes(newQuery)) {
      setQueryHistory((prev) => [newQuery, ...prev.slice(0, 5)]);
    }
    const evalRes = evaluateDiscoveryQuery(newQuery, currentRole);
    if (recordAssistantAudit) {
      recordAssistantAudit({
        eventType: 'AI_RECOMMENDATION_GENERATED',
        query: newQuery,
        featureId: evalRes.feature?.id || evalRes.targetFeature?.id || 'query-search',
        confidence: evalRes.confidence || null,
        ruleId: evalRes.ruleTriggered || null,
        outcome: evalRes.status,
        details: `Engine evaluated query "${newQuery}" -> ${evalRes.status}`,
      });
    }
  };

  // Action: Accept & Open Feature
  const handleOpenFeature = (feature, recommendation) => {
    if (recordAssistantAudit) {
      recordAssistantAudit({
        eventType: 'RECOMMENDATION_ACCEPTED',
        featureId: feature.id,
        confidence: recommendation?.confidenceScore || recommendation?.confidence,
        ruleId: recommendation?.ruleTriggered || recommendation?.ruleId,
        query: query || 'Direct Launch',
        outcome: 'ACCEPTED',
        details: `User accepted recommendation for ${feature.title}`,
      });
      recordAssistantAudit({
        eventType: 'FEATURE_OPENED',
        featureId: feature.id,
        outcome: 'OPENED',
      });
    }
    openFeature(feature.id);
  };

  // Action: Open Rejection Modal
  const handleOpenRejectModal = (feature, recommendation) => {
    setOverrideModal({
      isOpen: true,
      feature,
      recommendation,
      selectedReason: OVERRIDE_REASON_OPTIONS[0],
      customReason: '',
    });
  };

  // Action: Confirm Rejection & Log Override Reason
  const handleSubmitRejection = () => {
    const reasonText =
      overrideModal.selectedReason === 'Other'
        ? overrideModal.customReason || 'Custom user feedback'
        : overrideModal.selectedReason;

    if (recordAssistantAudit && overrideModal.feature) {
      recordAssistantAudit({
        eventType: 'RECOMMENDATION_REJECTED',
        featureId: overrideModal.feature.id,
        overrideReason: reasonText,
        query,
        outcome: 'REJECTED',
        details: `Rejected: "${reasonText}"`,
      });
      recordAssistantAudit({
        eventType: 'OVERRIDE_REASON_CAPTURED',
        featureId: overrideModal.feature.id,
        overrideReason: reasonText,
        query,
        outcome: 'OVERRIDE_RECORDED',
        details: `Override reason captured: "${reasonText}"`,
      });
    }

    setRejectedFeatures((prev) => ({
      ...prev,
      [overrideModal.feature.id]: reasonText,
    }));

    showToast(
      'Feedback Registered',
      `Recommendation marked Not Relevant ("${reasonText}"). Recorded in Audit Trail.`,
      'info'
    );

    setOverrideModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Action: Choose Another Feature
  const handleSelectAlternative = (newFeature) => {
    if (recordAssistantAudit && alternativeModal.originalFeature) {
      recordAssistantAudit({
        eventType: 'ALTERNATIVE_FEATURE_SELECTED',
        featureId: newFeature.id,
        overrideReason: `User bypassed ${alternativeModal.originalFeature.title} in favor of ${newFeature.title}`,
        query,
        outcome: 'ALTERNATIVE_CHOSEN',
      });
    }

    setAlternativeModal({ isOpen: false, originalFeature: null });
    openFeature(newFeature.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Rejection / Override Reason Modal */}
      {overrideModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-indigo-500/30 p-6 shadow-2xl shadow-black text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ThumbsDown className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">
              Why is this recommendation not relevant?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your feedback is recorded to continuously improve role-aware heuristics and governance audit tracking.
            </p>

            <div className="mt-4 space-y-2.5">
              {OVERRIDE_REASON_OPTIONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    overrideModal.selectedReason === reason
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <input
                    type="radio"
                    name="overrideReason"
                    value={reason}
                    checked={overrideModal.selectedReason === reason}
                    onChange={(e) =>
                      setOverrideModal((prev) => ({ ...prev, selectedReason: e.target.value }))
                    }
                    className="text-indigo-600 focus:ring-0"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {overrideModal.selectedReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Explain why this feature was not appropriate..."
                  value={overrideModal.customReason}
                  onChange={(e) =>
                    setOverrideModal((prev) => ({ ...prev, customReason: e.target.value }))
                  }
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRejection}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-950"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choose Another Feature Selector Modal */}
      {alternativeModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setAlternativeModal({ isOpen: false, originalFeature: null })}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-indigo-500/30 p-6 shadow-2xl shadow-black text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAlternativeModal({ isOpen: false, originalFeature: null })}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
              Choose Another {currentRole.toUpperCase()} Feature
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an alternative verified tool from your accessible {currentRole} catalog.
            </p>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
              {accessibleFeaturesForRole
                .filter((f) => f.id !== alternativeModal.originalFeature?.id)
                .map((f) => {
                  const Icon = getIconComponent(f.icon);
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSelectAlternative(f)}
                      className="w-full p-3.5 rounded-2xl bg-slate-900/90 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left flex items-center justify-between gap-3 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {f.title}
                          </div>
                          <div className="text-[10px] text-slate-400">{f.department}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              RoleWise AI – Feature Discovery Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Natural language intent analysis, underused feature surfacing, and transparent rule-based recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RoleBadge role={currentRole} size="md" />
        </div>
      </div>

      {/* Role State Banner with Quick Persona Switchers */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300">
            Current Persona: <strong className="text-white capitalize">{currentRole} Mode</strong> ({currentUser.name})
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <RoleBadge role={currentRole} size="sm" />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('assistant')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'assistant'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Natural Language Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('underused')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'underused'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Underused Feature Opportunities</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {underusedFeatures.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('experiment')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'experiment'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Experiment Telemetry (Before vs After)</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: NATURAL LANGUAGE ASSISTANT VIEW
      ========================================================================= */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          {/* Query Input Card */}
          <GlassCard className="p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border-indigo-500/30 shadow-2xl">
            <div className="max-w-3xl mx-auto space-y-4">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>What university service, workflow, or administrative task do you need?</span>
                <span className="text-[11px] text-slate-500">Local Rule-Engine Active</span>
              </label>

              <div className="relative flex items-center">
                <div className="absolute left-4 text-indigo-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuerySelect(query)}
                  placeholder={`Search e.g., "${roleQueryPills[currentRole]?.[0]?.text || 'pay fees, attendance, certificates'}"`}
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-24 text-xs text-slate-500 hover:text-white px-2 py-1"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => handleQuerySelect(query)}
                  className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950 transition-all"
                >
                  <span>Discover</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                </button>
              </div>

              {/* Dynamic Role-Aware Example Query Chips */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Suggested queries for {currentRole.toUpperCase()} mode:
                </div>
                <div className="flex flex-wrap gap-2">
                  {roleQueryPills[currentRole]?.map((pill, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuerySelect(pill.text)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left flex items-center gap-1.5 group ${
                        query === pill.text
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : pill.type === 'underused'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                          : pill.type === 'restricted'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                          : pill.type === 'ambiguous'
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">→</span>
                      <span>{pill.text}</span>
                      {pill.type === 'underused' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Opportunity
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* =========================================================================
              RESULTS DISPLAY AREA
          ========================================================================= */}

          {/* CASE 1: UNKNOWN QUERY */}
          {discoveryResult.status === 'UNKNOWN_QUERY' && (
            <GlassCard className="p-8 border-slate-800 text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <AlertCircle className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{discoveryResult.title}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {discoveryResult.explanation} We could not find a confident match for &quot;{query}&quot;.
                </p>
              </div>

              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">
                  Try one of these relevant {currentRole} queries:
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {discoveryResult.suggestedQueries?.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuerySelect(sq)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-indigo-300 hover:text-white transition-all"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* CASE 2: RESTRICTED ROLE */}
          {discoveryResult.status === 'RESTRICTED_ROLE' && (
            <GlassCard className="p-6 border-rose-500/30 bg-gradient-to-r from-rose-950/30 to-slate-950 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex-shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Permission Denied
                    </span>
                    <span className="text-xs text-slate-400">
                      Target Service: <strong className="text-white">{discoveryResult.targetFeature.title}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{discoveryResult.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {discoveryResult.permissionExplanation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Required Role: <strong className="text-rose-300 uppercase">{discoveryResult.requiredRole}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Requires <strong>{discoveryResult.requiredRole?.toUpperCase()}</strong> Credentials</span>
                  </div>
                </div>
              </div>

              {/* Accessible Alternatives */}
              {discoveryResult.accessibleAlternatives?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Accessible Alternatives in Your Current ({currentRole}) Catalog:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {discoveryResult.accessibleAlternatives.slice(0, 2).map((alt) => {
                      const AltIcon = getIconComponent(alt.icon);
                      return (
                        <button
                          key={alt.id}
                          onClick={() => handleOpenFeature(alt, null)}
                          className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between gap-3 group transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <AltIcon className="w-4 h-4 text-cyan-400" />
                            <div>
                              <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                                {alt.title}
                              </div>
                              <div className="text-[10px] text-slate-500">{alt.department}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* CASE 3: AMBIGUOUS QUERY */}
          {discoveryResult.status === 'AMBIGUOUS_QUERY' && (
            <GlassCard className="p-6 border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-950 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
                  <Split className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{discoveryResult.ambiguityTitle}</h3>
                  <p className="text-xs text-slate-300 mt-1">{discoveryResult.description}</p>
                </div>
              </div>

              {/* Ambiguity Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {discoveryResult.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuerySelect(opt.query)}
                    className="p-4 rounded-2xl bg-slate-900/90 hover:bg-indigo-950/40 border border-slate-800 hover:border-cyan-500/40 text-left flex flex-col justify-between gap-3 group transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {opt.description}
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1 self-end group-hover:translate-x-1 transition-transform">
                      <span>Select Goal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {/* CASE 5: TEMPORARILY UNAVAILABLE */}
          {discoveryResult.status === 'TEMPORARILY_UNAVAILABLE' && (
            <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-slate-950 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Service Temporarily Offline
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Status: 503 Maintenance
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{discoveryResult.serviceName}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{discoveryResult.reason}</p>
                </div>
              </div>

              {/* Fallback Action & Retry */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Recommended Fallback: {discoveryResult.alternativeFeature?.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {discoveryResult.alternativeReason}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      showToast(
                        'Gateway Status Check',
                        'Biometric pipeline database index rebalancing is 92% complete. Estimated completion: 15 minutes.',
                        'info'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Status</span>
                  </button>
                  <button
                    onClick={() => handleOpenFeature(discoveryResult.alternativeFeature, null)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1 shadow-lg shadow-indigo-950"
                  >
                    <span>Launch Fallback Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* =========================================================================
              SUCCESSFUL RECOMMENDATION CARD
          ========================================================================= */}
          {discoveryResult.status === 'SUCCESS' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Top Recommended University Service:
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  High-Confidence Match
                </span>
              </div>

              <GlassCard
                className={`p-6 border-indigo-500/40 bg-gradient-to-b from-slate-900/95 to-slate-950 shadow-2xl transition-all ${
                  rejectedFeatures[discoveryResult.feature.id] ? 'opacity-60 border-slate-800' : ''
                }`}
              >
                {/* Rejection Notice if user previously rejected */}
                {rejectedFeatures[discoveryResult.feature.id] && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-3">
                    <span>
                      Marked Not Relevant: &quot;{rejectedFeatures[discoveryResult.feature.id]}&quot;
                    </span>
                    <button
                      onClick={() =>
                        setRejectedFeatures((prev) => {
                          const next = { ...prev };
                          delete next[discoveryResult.feature.id];
                          return next;
                        })
                      }
                      className="text-indigo-400 hover:underline text-[11px]"
                    >
                      Undo
                    </button>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: Main Feature Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
                        {discoveryResult.feature.category}
                      </span>

                      {/* Underused Feature Opportunity Badge */}
                      {discoveryResult.isUnderused && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-md shadow-amber-950 animate-pulse">
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          Underused Feature Opportunity
                        </span>
                      )}

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        Dept: {discoveryResult.feature.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = getIconComponent(discoveryResult.feature.icon);
                        return (
                          <div className="p-3 rounded-2xl bg-slate-950 border border-indigo-500/40 text-cyan-300 flex-shrink-0 shadow-lg shadow-indigo-950">
                            <Icon className="w-6 h-6" />
                          </div>
                        );
                      })()}
                      <div>
                        <h2 className="text-xl font-extrabold text-white">
                          {discoveryResult.feature.title}
                        </h2>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Detected Intent:{' '}
                          <strong className="text-indigo-300">{discoveryResult.detectedIntent}</strong>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {discoveryResult.shortDescription}
                    </p>

                    {/* Underused Context Reason */}
                    {discoveryResult.isUnderused && discoveryResult.underusedReason && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-amber-300">Underused Discovery Tip: </strong>
                          {discoveryResult.underusedReason}
                        </div>
                      </div>
                    )}

                    {/* Insufficient Evidence Warning if applicable */}
                    {discoveryResult.isInsufficientEvidence && (
                      <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-xs text-yellow-200 flex items-start gap-2">
                        <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-yellow-300">Heuristic Primary: </strong>
                          {discoveryResult.insufficientEvidenceNote}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Confidence Score Gauge */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 lg:min-w-[170px]">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Confidence
                      </div>
                      <div className="text-2xl font-black text-white flex items-center lg:justify-end gap-1 text-cyan-300">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <span>{discoveryResult.confidenceStr}</span>
                      </div>
                    </div>

                    <div className="w-24 lg:w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"
                        style={{ width: `${discoveryResult.confidence}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Evaluated for <span className="capitalize font-semibold text-slate-300">{currentRole}</span>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    EXPANDABLE EVIDENCE & TRANSPARENCY ACCORDION
                ========================================================================= */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setExpandedEvidence(!expandedEvidence)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-400" />
                      Transparent Rule & Usage Evidence Details
                    </span>
                    {expandedEvidence ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {expandedEvidence && (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3 text-xs animate-in fade-in duration-150">
                      {/* Why this recommendation */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          Why this recommendation:
                        </span>
                        <p className="text-[11px] text-slate-200 mt-0.5 font-medium leading-relaxed">
                          {discoveryResult.why}
                        </p>
                      </div>

                      {/* Matching Keywords */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          Matching Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {discoveryResult.matchingKeywords?.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-[10px]"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Anonymized Usage Evidence */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Anonymized Usage Evidence:
                        </span>
                        <ul className="mt-1 space-y-1 text-[11px] text-slate-400 font-mono">
                          <li>• Current Role: <span className="text-white capitalize">{discoveryResult.currentRole}</span> (Cleared)</li>
                          <li>• Required Role: <span className="text-white capitalize">{discoveryResult.requiredRole}</span></li>
                          <li>• Historical Anonymized Searches: <span className="text-white">{discoveryResult.usageEvidence.matchingAnonymizedSearches} recorded</span></li>
                          <li>• Feature Completion Rate: <span className="text-emerald-400 font-bold">{discoveryResult.usageEvidence.completionRate}</span></li>
                          <li>• Total Feature Invocations: <span className="text-white">{discoveryResult.usageEvidence.opens.toLocaleString()} opens / {discoveryResult.usageEvidence.completions.toLocaleString()} completed</span></li>
                          <li>• Evidence Reliability: <span className={`font-bold ${discoveryResult.usageEvidence.evidenceStrength === 'Strong' ? 'text-emerald-400' : 'text-amber-400'}`}>{discoveryResult.usageEvidence.evidenceStrength} Evidence</span></li>
                        </ul>
                      </div>

                      {/* Rule Triggered */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                        <span className="text-slate-500">Governance Rule Triggered:</span>
                        <span className="font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {discoveryResult.ruleTriggered}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* =========================================================================
                    THREE RECOMMENDATION OUTCOME ACTIONS
                ========================================================================= */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenRejectModal(discoveryResult.feature, discoveryResult)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                      title="Reject this recommendation and record reason"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Not Relevant</span>
                    </button>

                    <button
                      onClick={() =>
                        setAlternativeModal({
                          isOpen: true,
                          originalFeature: discoveryResult.feature,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Choose Another Feature</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenFeature(discoveryResult.feature, discoveryResult)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 hover:scale-102 transition-all"
                  >
                    <span>Open Feature</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </div>
          )}

          {/* EMPTY QUERY: Display role's primary recommendations */}
          {discoveryResult.status === 'EMPTY_QUERY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Default Core Features for {currentRole.toUpperCase()}:
                </span>
                <span className="text-slate-500">
                  Type any task goal in the search box above to discover relevant tools
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discoveryResult.recommendations?.map((feat) => {
                  const Icon = getIconComponent(feat.icon);
                  const rec = feat.recommendation;
                  return (
                    <GlassCard key={feat.id} className="p-5 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {feat.category}
                          </span>
                          {rec.isUnderused && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Underused
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                            <div className="text-[10px] text-slate-500">{feat.department}</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2">
                          {feat.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          Rule: <strong className="text-slate-300 font-mono">{rec.ruleId}</strong>
                        </span>
                        <button
                          onClick={() => handleOpenFeature(feat, rec)}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <span>Launch</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: UNDERUSED FEATURE DISCOVERIES VIEW
      ========================================================================= */}
      {activeTab === 'underused' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Underused Feature Discovery Engine
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  The assistant analyzes telemetry completion rates and historical search volumes to surface high-utility services that are underutilized. Promoting these tools accelerates institutional self-service and saves hours of administrative overhead.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {underusedFeatures.map((feat) => {
              const Icon = getIconComponent(feat.icon);
              const m = feat.usageMetrics;
              return (
                <GlassCard key={feat.id} className="p-6 space-y-4 border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      Underused Feature Opportunity
                    </span>
                    <span className="text-xs text-slate-400">{feat.department}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{feat.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{feat.description}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-amber-200">
                    <strong className="font-semibold text-white">Why adopt this tool: </strong>
                    {m?.underusedReason}
                  </div>

                  {/* Usage telemetry comparison */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Impressions</div>
                      <div className="font-mono font-bold text-white mt-0.5">{m?.impressions.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Feature Opens</div>
                      <div className="font-mono font-bold text-amber-300 mt-0.5">{m?.opens.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Completion</div>
                      <div className="font-mono font-bold text-emerald-400 mt-0.5">{m?.completionRate}%</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenFeature(feat, null)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-950"
                  >
                    <span>Launch Underused Feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MEASURABLE EXPERIMENT FOUNDATION VIEW
      ========================================================================= */}
      {activeTab === 'experiment' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  AI Feature Discovery Experiment: Baseline vs Target vs Measured Impact
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Rigorous measurement data tracking feature discovery success, task completion velocity, and underused feature adoption across university cohorts.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
              Live Experiment Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Baseline Column */}
            <GlassCard className="p-5 space-y-4 border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Pre-Assistant Baseline
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">
                  {EXPERIMENT_METRICS.baseline.title}
                </h4>
                <div className="text-[11px] text-slate-500">{EXPERIMENT_METRICS.baseline.period}</div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Discovery Success Rate</div>
                  <div className="text-xl font-extrabold text-slate-300 mt-0.5">
                    {EXPERIMENT_METRICS.baseline.discoverySuccessRate}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Feature Completion Rate</div>
                  <div className="text-xl font-extrabold text-slate-300 mt-0.5">
                    {EXPERIMENT_METRICS.baseline.completionRate}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Underused Feature Discovery</div>
                  <div className="text-xl font-extrabold text-slate-300 mt-0.5">
                    {EXPERIMENT_METRICS.baseline.underusedDiscoveryRate}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Avg. Time to Reach Feature</div>
                  <div className="text-xl font-extrabold text-slate-300 mt-0.5">
                    {EXPERIMENT_METRICS.baseline.avgTimeToFeatureSec} seconds
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Target Column */}
            <GlassCard className="p-5 space-y-4 border-cyan-500/20">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Target Objectives
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">
                  {EXPERIMENT_METRICS.target.title}
                </h4>
                <div className="text-[11px] text-slate-500">{EXPERIMENT_METRICS.target.period}</div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Target Discovery Success</div>
                  <div className="text-xl font-extrabold text-cyan-300 mt-0.5">
                    {EXPERIMENT_METRICS.target.discoverySuccessRate}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Target Completion Success</div>
                  <div className="text-xl font-extrabold text-cyan-300 mt-0.5">
                    {EXPERIMENT_METRICS.target.completionRate}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Target Underused Discovery</div>
                  <div className="text-xl font-extrabold text-cyan-300 mt-0.5">
                    {EXPERIMENT_METRICS.target.underusedDiscoveryRate}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Target Time to Feature</div>
                  <div className="text-xl font-extrabold text-cyan-300 mt-0.5">
                    {EXPERIMENT_METRICS.target.avgTimeToFeatureSec} seconds
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Measured Column */}
            <GlassCard className="p-5 space-y-4 border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-950">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Measured Post-AI Impact
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">
                  {EXPERIMENT_METRICS.measuredAfterAssistant.title}
                </h4>
                <div className="text-[11px] text-slate-500">{EXPERIMENT_METRICS.measuredAfterAssistant.period}</div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <div className="text-slate-400 text-[10px]">Measured Discovery Success</div>
                  <div className="text-xl font-extrabold text-emerald-400 mt-0.5 flex items-center justify-between">
                    <span>{EXPERIMENT_METRICS.measuredAfterAssistant.discoverySuccessRate}%</span>
                    <span className="text-xs text-emerald-300 font-semibold">+32.8%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <div className="text-slate-400 text-[10px]">Measured Completion Rate</div>
                  <div className="text-xl font-extrabold text-emerald-400 mt-0.5 flex items-center justify-between">
                    <span>{EXPERIMENT_METRICS.measuredAfterAssistant.completionRate}%</span>
                    <span className="text-xs text-emerald-300 font-semibold">+28.2%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <div className="text-slate-400 text-[10px]">Underused Discovery Uplift</div>
                  <div className="text-xl font-extrabold text-amber-300 mt-0.5 flex items-center justify-between">
                    <span>{EXPERIMENT_METRICS.measuredAfterAssistant.underusedDiscoveryRate}%</span>
                    <span className="text-xs text-amber-400 font-semibold">{EXPERIMENT_METRICS.measuredAfterAssistant.underusedUpliftPercent}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <div className="text-slate-400 text-[10px]">Avg. Time to Feature</div>
                  <div className="text-xl font-extrabold text-cyan-300 mt-0.5 flex items-center justify-between">
                    <span>{EXPERIMENT_METRICS.measuredAfterAssistant.avgTimeToFeatureSec}s</span>
                    <span className="text-xs text-cyan-400 font-semibold">-88% speedup</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
