import React, { useState } from 'react';
import {
  Share2,
  Sparkles,
  Linkedin,
  Instagram,
  Facebook,
  Copy,
  Check,
  Send,
  Trash2,
  Edit2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { apiService } from '../services/api';
import { SocialPlatform, SocialDraft } from '../types';

export const SocialMediaView: React.FC = () => {
  const {
    socialDrafts,
    createSocialDraft,
    updateSocialDraft,
    deleteSocialDraft,
    publishSocialDraft,
    settings,
    setActiveTab,
  } = useAssistant();

  const [platform, setPlatform] = useState<SocialPlatform>('linkedin');
  const [topic, setTopic] = useState('Employee Management System full-stack Java and React project');
  const [tone, setTone] = useState('Professional & Inspiring');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Preview Modal
  const [previewDraft, setPreviewDraft] = useState<SocialDraft | null>(null);
  const [publishStatusMessage, setPublishStatusMessage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const response = await apiService.generateSocialPost({
        platform,
        topic: topic.trim(),
        tone,
      });

      createSocialDraft({
        platform,
        topic: topic.trim(),
        content: response.content,
        caption: response.caption,
        hashtags: response.hashtags || [],
        status: 'draft',
      });
    } catch (err: any) {
      console.error('Error generating post:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublishClick = async (draft: SocialDraft) => {
    setPublishStatusMessage(null);
    const result = await publishSocialDraft(draft.id);

    if (result.success) {
      setPublishStatusMessage(result.message);
      setTimeout(() => {
        setPreviewDraft(null);
        setPublishStatusMessage(null);
      }, 1500);
    } else {
      // Truthful confirmation: If account not connected, explain clearly!
      setPublishStatusMessage(result.message);
    }
  };

  const isPlatformConnected = (plat: SocialPlatform) => {
    return settings.socialIntegrations[plat]?.connected;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Share2 className="w-7 h-7 text-indigo-400" />
            <span>Social Media Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            AI post generator for LinkedIn, Instagram, and Facebook with verified API publishing.
          </p>
        </div>

        {/* Connected platforms status */}
        <div className="flex items-center gap-2">
          {(['linkedin', 'instagram', 'facebook'] as const).map((p) => {
            const connected = isPlatformConnected(p);
            return (
              <span
                key={p}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border capitalize ${
                  connected
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                {p}
              </span>
            );
          })}
        </div>
      </div>

      {/* AI Post Generator Box */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-400" />
          <h2 className="text-sm font-bold text-white">Generate High-Impact Tech Content with Lakshmi</h2>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Target Platform</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(['linkedin', 'instagram', 'facebook'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatform(plat)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize flex items-center justify-center gap-1.5 transition ${
                      platform === plat
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {plat === 'linkedin' && <Linkedin className="w-3.5 h-3.5" />}
                    {plat === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                    {plat === 'facebook' && <Facebook className="w-3.5 h-3.5" />}
                    <span>{plat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400">Tone & Audience</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Professional & Inspiring">Professional & Inspiring (LinkedIn Tech)</option>
                <option value="Casual, Engaging & Punchy">Casual, Engaging & Punchy (Instagram)</option>
                <option value="Celebratory Project Announcement">Celebratory Project Launch</option>
                <option value="Internship & Learning Journey">Internship & Learning Journey</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">
              Project Topic / Achievement / Internship / Update
            </label>
            <textarea
              rows={2}
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Employee Management System project with Java and React, key features, database design..."
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="animate-spin text-sm">⏳</span>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Generate Content Draft</span>
            </button>
          </div>
        </form>
      </div>

      {/* Drafts List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Social Media Drafts & Publishing Queue</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialDrafts.map((draft) => (
            <div
              key={draft.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-md space-y-3 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {draft.platform === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-400" />}
                    {draft.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-400" />}
                    {draft.platform === 'facebook' && <Facebook className="w-4 h-4 text-indigo-400" />}
                    <span className="text-xs font-bold text-white capitalize">{draft.platform}</span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      draft.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {draft.status === 'published' ? 'Published' : 'Draft Ready'}
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-slate-300 line-clamp-1">
                  Topic: {draft.topic}
                </div>

                <p className="mt-2 text-xs text-slate-200 whitespace-pre-wrap line-clamp-4 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 font-sans">
                  {draft.content}
                </p>

                {draft.hashtags && draft.hashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-indigo-400 font-mono">
                    {draft.hashtags.slice(0, 5).join(' ')}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleCopy(draft.id, draft.content)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                >
                  {copiedId === draft.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === draft.id ? 'Copied' : 'Copy Text'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteSocialDraft(draft.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setPreviewDraft(draft);
                      setPublishStatusMessage(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                  >
                    Preview & Publish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview & Publish Modal */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white capitalize">
                {previewDraft.platform} Post Preview
              </h3>
              <button
                onClick={() => setPreviewDraft(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            {/* Post Preview Frame */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  RK
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Ritesh Kumar</div>
                  <div className="text-[10px] text-slate-400">Software Developer • Student</div>
                </div>
              </div>

              <div className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-1">
                {previewDraft.content}
              </div>
            </div>

            {/* Status Message or Warning */}
            {publishStatusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  publishStatusMessage.includes('successfully')
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{publishStatusMessage}</span>
                  {!isPlatformConnected(previewDraft.platform) && (
                    <button
                      onClick={() => {
                        setPreviewDraft(null);
                        setActiveTab('settings');
                      }}
                      className="ml-2 underline font-semibold text-white"
                    >
                      [Connect in Settings]
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDraft(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handlePublishClick(previewDraft)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
