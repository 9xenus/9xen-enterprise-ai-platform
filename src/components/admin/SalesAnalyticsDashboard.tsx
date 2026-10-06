import React from 'react';
import { useCms } from '../../context/CmsContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, Users, Target, Calendar } from 'lucide-react';

export const SalesAnalyticsDashboard: React.FC = () => {
  const { cmsData } = useCms();
  const leads = cmsData.outreachQueue || [];

  // Data processing
  const totalLeads = leads.length;
  const demoScheduled = leads.filter(l => l.stage === 'Demo Scheduled' || !!l.demoScheduledAt).length;
  const conversionRate = totalLeads > 0 ? ((demoScheduled / totalLeads) * 100).toFixed(1) : '0';

  const stagesData = [
    { name: 'New Inquiry', value: leads.filter(l => !l.stage || l.stage === 'New Inquiry').length },
    { name: 'Outreach Sent', value: leads.filter(l => l.stage === 'Outreach Sent').length },
    { name: 'Demo Scheduled', value: demoScheduled },
    { name: 'Closed', value: leads.filter(l => l.stage === 'Closed').length },
  ];

  const COLORS = ['#64748b', '#8b5cf6', '#10b981', '#ef4444'];

  // History timeline (grouping by date)
  const historyData = leads.reduce((acc: any[], lead) => {
    const date = new Date(lead.submittedAt).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Total Leads</div>
            <div className="text-3xl font-black text-white">{totalLeads}</div>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Conversion Rate</div>
            <div className="text-3xl font-black text-emerald-400">{conversionRate}%</div>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Demos Scheduled</div>
            <div className="text-3xl font-black text-white">{demoScheduled}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <h3 className="font-bold text-white mb-6">Lead Pipeline Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stagesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {stagesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <h3 className="font-bold text-white mb-6">Submission History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
