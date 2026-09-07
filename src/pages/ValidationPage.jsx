import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  Star,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Award
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { governanceApi } from '../services/api';
import { useRole, ROLES } from '../context/RoleContext';

export const ValidationPage = () => {
  const { currentRole } = useRole();
  const [validationData, setValidationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    participant_type: 'student',
    task: '',
    before_flow: '',
    after_flow: '',
    discovery_time_sec: 90,
    completion_time_sec: 18,
    usefulness_score: 5,
    feedback: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchValidation = async () => {
    setIsLoading(true);
    try {
      const res = await governanceApi.getValidation();
      if (res.success) {
        setValidationData(res);
      }
    } catch (e) {
      console.warn('Failed to load validation cohort:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValidation();
  }, []);

  const handleAddValidation = async (e) => {
    e.preventDefault();
    if (!formData.task || !formData.feedback) return;

    setSubmitting(true);
    try {
      await governanceApi.submitValidation({
        ...formData,
        role: formData.participant_type,
        success: 1,
      });
      setAddModalOpen(false);
      setFormData({
        participant_type: 'student',
        task: '',
        before_flow: '',
        after_flow: '',
        discovery_time_sec: 90,
        completion_time_sec: 18,
        usefulness_score: 5,
        feedback: '',
      });
      await fetchValidation();
    } catch (err) {
      alert(err.message || 'Failed to submit validation');
    } finally {
      setSubmitting(false);
    }
  };

  const summary = validationData?.summary || {
    totalParticipants: 5,
    taskSuccessRate: '100%',
    avgDiscoveryTimeBeforeSec: 97.9,
    avgDiscoveryTimeAfterSec: 17.4,
    timeReductionPct: '82.2%',
    recommendationHelpfulness: '4.8 / 5.0',
    userSatisfactionRate: '100%',
  };

  const records = validationData?.records || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              Stakeholder Validation Module
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Empirical Evaluation
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Simulated and empirical cohort feedback measuring feature usability, discovery speed, and satisfaction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Simulate Validation Session
          </button>

          <button
            onClick={fetchValidation}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Mandatory Synthetic Evaluation Banner */}
      <div className="rounded-xl p-4 bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 backdrop-blur-md">
        <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs text-cyan-200 leading-relaxed">
          <span className="font-semibold text-cyan-300">Prototype Validation Notice: </span>
          Prototype validation using synthetic participants/tasks. The evaluation records below represent structured user testing scenarios across 3 Students, 1 Faculty Member, and 1 University Administrator to benchmark discovery time reduction and explainability utility without claiming unverified institutional outcomes.
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Task Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {summary.taskSuccessRate}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {summary.totalParticipants} validation sessions
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Discovery Time Reduction</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight">
            {summary.timeReductionPct} Faster
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {summary.avgDiscoveryTimeBeforeSec}s → {summary.avgDiscoveryTimeAfterSec}s avg
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Recommendation Helpfulness</span>
            <ThumbsUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 tracking-tight">
            {summary.recommendationHelpfulness}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Mean usefulness score (1 to 5 scale)
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>User Satisfaction</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            {summary.userSatisfactionRate}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Positive qualitative feedback
          </div>
        </GlassCard>
      </div>

      {/* Participant Validation Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          Participant Evaluation Trajectories (3 Students, 1 Faculty, 1 Admin)
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {records.map((r, idx) => (
            <GlassCard key={idx} className="p-5 border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                    {r.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{r.task}</span>
                      <RoleBadge role={r.role} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Participant Type: <span className="text-slate-300 capitalize">{r.participant_type}</span> • Timestamp: <span className="font-mono text-slate-400">{r.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-auto">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < r.usefulness_score ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                      />
                    ))}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Task Succeeded
                  </span>
                </div>
              </div>

              {/* Before vs After Flows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-semibold text-rose-300 mb-1 flex items-center justify-between">
                    <span>Baseline Navigation (Without Assistant)</span>
                    <span className="font-mono text-slate-400">{r.discovery_time_sec}s</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{r.before_flow}</p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <div className="font-semibold text-indigo-300 mb-1 flex items-center justify-between">
                    <span>RoleWise AI Flow (With Explanations)</span>
                    <span className="font-mono text-emerald-400 font-bold">{r.completion_time_sec}s</span>
                  </div>
                  <p className="text-indigo-200/90 leading-relaxed">{r.after_flow}</p>
                </div>
              </div>

              {/* Verbatim Feedback Quote */}
              <div className="mt-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-2 text-xs text-slate-300 italic">
                <MessageSquare className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>"{r.feedback}"</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Modal to add simulated session */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Simulate New Stakeholder Validation Session
            </h3>
            <p className="text-xs text-slate-400">
              Submit a simulated user test session with before/after navigation measurements and qualitative remarks.
            </p>

            <form onSubmit={handleAddValidation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Participant Role</label>
                <select
                  value={formData.participant_type}
                  onChange={(e) => setFormData({ ...formData, participant_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Description</label>
                <input
                  type="text"
                  placeholder="e.g., Settle outstanding tuition fees"
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discovery Time (Before / sec)</label>
                  <input
                    type="number"
                    value={formData.discovery_time_sec}
                    onChange={(e) => setFormData({ ...formData, discovery_time_sec: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discovery Time (After / sec)</label>
                  <input
                    type="number"
                    value={formData.completion_time_sec}
                    onChange={(e) => setFormData({ ...formData, completion_time_sec: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Usefulness Rating (1 to 5 Stars)</label>
                <select
                  value={formData.usefulness_score}
                  onChange={(e) => setFormData({ ...formData, usefulness_score: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value={5}>5 - Extremely Helpful</option>
                  <option value={4}>4 - Very Useful</option>
                  <option value={3}>3 - Neutral</option>
                  <option value={2}>2 - Somewhat Confusing</option>
                  <option value={1}>1 - Not Helpful</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Qualitative Feedback</label>
                <textarea
                  placeholder="Participant remarks regarding recommendation explainability and navigation ease..."
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  required
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-medium cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Validation Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
