import React from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import { Box, Hash, Code, Users, Target, Shield, Zap, Globe, Lock, Cpu, Server, Network, Award, Compass } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { cmsData } = useCms();
  const { team, settings } = cmsData;

  const coreValues = [
    {
      icon: <Shield className="w-6 h-6 text-cyan-400" />,
      title: 'Data Sovereignty First',
      desc: 'Zero-retention inference pipelines, private model parameter weights, and strict network perimeter encapsulation.',
    },
    {
      icon: <Target className="w-6 h-6 text-violet-400" />,
      title: 'Precision Autonomous Agents',
      desc: 'Continuous feedback loops, automated evaluation benchmarks, and formal mathematical verification for critical execution.',
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-400" />,
      title: 'Regulatory & SOC-2 Compliance',
      desc: 'Built natively for HIPAA, GDPR, FINRA, and ISO/IEC 27001 regulatory adherence across global operations.',
    },
    {
      icon: <Globe className="w-6 h-6 text-amber-400" />,
      title: 'Global High-Availability',
      desc: 'Distributed compute clusters located across North America and Europe offering guaranteed 99.95% uptime SLAs.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* Overview Headline */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono uppercase">
          <Compass className="w-3.5 h-3.5" />
          <span>Our Vision & Creed</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
          Architecting Autonomous Intelligence for Global Enterprise
        </h1>
        <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
          Founded by deep learning researchers and cybersecurity architects, {settings.companyName || '9xen'} empowers regulated institutions to deploy autonomous agentic systems with unprecedented safety, mathematical determinism, and zero data leakage.
        </p>
      </section>

      {/* Core Values Bento Grid */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white dark:text-white light:text-slate-950">
            Principles of Engineering
          </h2>
          <p className="text-xs text-slate-400 mt-1">Foundational tenets guiding our research and software architectures</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((val, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm space-y-3"
            >
              <div className="p-3 rounded-2xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 w-fit border border-slate-800 dark:border-slate-800 light:border-slate-200">
                {val.icon}
              </div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-slate-950">
                {val.title}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership & Research Team */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold font-mono uppercase mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Executive Leadership</span>
          </div>
          <h2 className="text-3xl font-black text-white dark:text-white light:text-slate-950">
            Leadership & Scientific Board
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Proven innovators in distributed systems, autonomous robotics, cryptographic verification, and deep learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(team || []).map((member) => (
            <div
              key={member.id}
              className="p-6 rounded-3xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 mb-4 shadow-md">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-cyan-400">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-950">
                  {member.name}
                </h3>
                <div className="text-xs font-mono font-semibold text-cyan-400 dark:text-cyan-400 light:text-cyan-600 mb-1">
                  {member.role}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider mb-3">
                  {member.department}
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                  <AutoTranslate text={member.bio} />
                </p>
              </div>

              {/* Social links */}
              {member.socials && Object.keys(member.socials).length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 flex items-center gap-3 text-slate-400">
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Box className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 transition-colors"
                      aria-label="TwitterIcon"
                    >
                      <Hash className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.github && (
                    <a
                      href={member.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 transition-colors"
                      aria-label="GitHub"
                    >
                      <Code className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
