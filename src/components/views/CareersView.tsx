import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import { FileUploader } from '../common/FileUploader';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  UploadCloud,
  Send,
} from 'lucide-react';

export const CareersView: React.FC = () => {
  const { cmsData, submitContact } = useCms();
  const { careers } = cmsData;
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Application form state
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);

    const message = `Job Application for ${selectedJob.title} (${selectedJob.department} - ${selectedJob.location})
LinkedIn: ${linkedinUrl || 'Not provided'}
Resume Attachment: ${resumeUrl || 'Not attached'} (${resumeName || 'file'})
Note: ${coverNote || 'No additional note'}`;

    await submitContact({
      name: candidateName,
      email: candidateEmail,
      subject: `Application: ${selectedJob.title} - ${candidateName}`,
      message,
      attachmentUrl: resumeUrl,
      attachmentName: resumeName,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  const activeCareers = (careers || []).filter((c) => c.active !== false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold font-mono uppercase">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Careers & Culture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
          Pioneer the Next Horizon of Machine Intelligence
        </h1>
        <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
          Join a collaborative, high-impact team of researchers, systems programmers, and security engineers building foundational autonomous systems for global industries.
        </p>
      </section>

      {/* JobList */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-950">
            Open Positions ({activeCareers.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">Remote & Hybrid Options</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCareers.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {job.department}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {job.type}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-950">
                  <AutoTranslate text={job.title} />
                </h3>

                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  <AutoTranslate text={job.description} />
                </p>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100">
                    <div className="text-[11px] font-mono font-bold text-slate-400 mb-2">
                      Key Qualifications:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700">
                      {job.requirements.slice(0, 3).map((req, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span><AutoTranslate text={req} /></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setSubmitted(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Apply for Role</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Application Received</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-cyan-400 font-bold">{candidateName}</span>. Our technical talent team will review your qualifications and reach out within 3 business days.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                    {selectedJob.department}
                  </span>
                  <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                  <p className="text-xs text-slate-400">{selectedJob.location} • {selectedJob.type}</p>
                </div>

                <form onSubmit={handleApply} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Morgan"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@domain.com"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">LinkedIn or GitHub Profile</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/alex"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* File Upload Component for Resume */}
                  <FileUploader
                    label="Attach Resume / CV (PDF, DOCX, TXT)"
                    value={resumeUrl}
                    onChange={(url, fileName) => {
                      setResumeUrl(url);
                      if (fileName) setResumeName(fileName);
                    }}
                    accept=".pdf,.doc,.docx,.txt"
                    isPublic={true}
                    helperText="Upload your resume (max 25MB, confidential)"
                  />

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Brief Introduction or Portfolio Highlights</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about the systems, models, or architectures you have built..."
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting Application...' : 'Send Confidential Application'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
