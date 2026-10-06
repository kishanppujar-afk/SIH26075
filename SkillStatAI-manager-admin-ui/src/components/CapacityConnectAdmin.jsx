import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Search, Megaphone, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

export default function CapacityConnectAdmin() {
  const [activeTab, setActiveTab] = useState('approvals');

  return (
    <div className="mt-12 pt-8 border-t border-[#EDEBE6]">
      <h2 className="text-2xl font-extrabold text-[#14140F] mb-6">CAPACITY CONNECT - MoES Administration</h2>
      
      <div className="flex bg-[#F4F3EF] p-1 rounded-xl mb-6 border border-[#EDEBE6] w-fit">
        <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'approvals' ? 'bg-white shadow-sm text-[#14140F]' : 'text-[#5B5850] hover:text-[#14140F]'}`}>
          <div className="flex items-center gap-2"><UserCheck size={16}/> Approval Queue</div>
        </button>
        <button onClick={() => setActiveTab('matcher')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'matcher' ? 'bg-white shadow-sm text-[#14140F]' : 'text-[#5B5850] hover:text-[#14140F]'}`}>
          <div className="flex items-center gap-2"><Search size={16}/> Trainer Matcher</div>
        </button>
        <button onClick={() => setActiveTab('cms')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'cms' ? 'bg-white shadow-sm text-[#14140F]' : 'text-[#5B5850] hover:text-[#14140F]'}`}>
          <div className="flex items-center gap-2"><Megaphone size={16}/> Homepage CMS</div>
        </button>
        <button onClick={() => setActiveTab('telemetry')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'telemetry' ? 'bg-white shadow-sm text-[#14140F]' : 'text-[#5B5850] hover:text-[#14140F]'}`}>
          <div className="flex items-center gap-2"><BarChart size={16}/> Capacity Telemetry</div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'approvals' && <ApprovalQueue />}
          {activeTab === 'matcher' && <TrainerMatcher />}
          {activeTab === 'cms' && <HomepageCMS />}
          {activeTab === 'telemetry' && <CapacityTelemetry />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ApprovalQueue() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getPendingUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await api.approveUser(id);
      else await api.rejectUser(id);
      fetchUsers();
    } catch (e) {
      alert("Failed to " + action + " user.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[#14140F]">Registration Approvals</h3>
      {users.length === 0 ? <p className="text-sm text-[#5B5850]">All caught up!</p> : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between bg-white border border-[#EDEBE6] p-4 rounded-xl">
              <div>
                <p className="font-bold text-[#14140F]">{u.name}</p>
                <p className="text-xs text-[#5B5850]">Requested Role: <span className="uppercase font-bold">{u.role}</span> | {u.department}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(u.id, 'approve')} className="bg-[#1B4332] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#122e22]">Approve</button>
                <button onClick={() => handleAction(u.id, 'reject')} className="bg-[#FCEDEB] text-[#B23A2E] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#f6d7d4]">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrainerMatcher() {
  const [subject, setSubject] = useState('Doppler Weather Radar');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const data = await api.matchTrainers(subject);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-white border border-[#EDEBE6] p-5 rounded-xl">
      <h3 className="text-lg font-bold text-[#14140F]">Algorithmic Competency Mapping Engine</h3>
      <div className="flex gap-3">
        <input 
          value={subject} 
          onChange={e => setSubject(e.target.value)}
          className="flex-1 bg-[#F4F3EF] border border-[#EDEBE6] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
        />
        <button onClick={search} disabled={loading} className="bg-[#1B4332] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#122e22] disabled:opacity-50">Match Trainers</button>
      </div>
      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          {results.map((r, i) => (
            <div key={r.trainer ? r.trainer.id : i} className="flex items-center justify-between bg-[#F4F3EF] p-4 rounded-xl border border-[#EDEBE6]">
              <div>
                <p className="font-bold text-[#14140F] flex items-center gap-2">
                  <span className="bg-[#1B4332] text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">#{i+1}</span>
                  {r.trainer ? r.trainer.name : 'Unknown Trainer'}
                </p>
                <p className="text-xs text-[#5B5850] mt-1">{r.rationale}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-[#1B4332]">{r.suitability_score}%</p>
                <p className="text-[10px] text-[#5B5850] uppercase font-bold">Suitability Score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomepageCMS() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('announcement');
  const [loading, setLoading] = useState(false);

  const publish = async () => {
    if (!title || !content) return alert("Title and content are required");
    setLoading(true);
    try {
      await api.publishAnnouncement({ title, content, category });
      alert("Announcement broadcasted successfully!");
      setTitle('');
      setContent('');
    } catch (e) {
      alert("Failed to publish announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-white border border-[#EDEBE6] p-5 rounded-xl">
      <h3 className="text-lg font-bold text-[#14140F]">Publish Announcement</h3>
      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#F4F3EF] border border-[#EDEBE6] rounded-lg px-4 py-2 text-sm mb-3">
        <option value="announcement">General Announcement</option>
        <option value="achievement">Achievement</option>
        <option value="notification">Notification</option>
        <option value="new_content">New Content Alert</option>
      </select>
      <input placeholder="Announcement Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#F4F3EF] border border-[#EDEBE6] rounded-lg px-4 py-2 text-sm mb-3" />
      <textarea placeholder="Content..." rows={4} value={content} onChange={e => setContent(e.target.value)} className="w-full bg-[#F4F3EF] border border-[#EDEBE6] rounded-lg px-4 py-2 text-sm mb-3" />
      <button onClick={publish} disabled={loading} className="bg-[#1B4332] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#122e22] disabled:opacity-50">Broadcast to Trainees</button>
    </div>
  );
}

function CapacityTelemetry() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCapacityDashboards().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading metrics...</p>;
  if (!stats) return <p>Failed to load capacity telemetry.</p>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white border border-[#EDEBE6] p-5 rounded-xl">
        <h4 className="text-xs text-[#5B5850] uppercase font-bold tracking-wider mb-1">Active Courses</h4>
        <p className="text-3xl font-extrabold text-[#14140F]">{stats.courses_telemetry?.active_count || 0}</p>
      </div>
      <div className="bg-white border border-[#EDEBE6] p-5 rounded-xl">
        <h4 className="text-xs text-[#5B5850] uppercase font-bold tracking-wider mb-1">Completion Velocity</h4>
        <p className="text-3xl font-extrabold text-[#14140F]">{stats.courses_telemetry?.completion_velocity || 0}/wk</p>
      </div>
      <div className="bg-white border border-[#EDEBE6] p-5 rounded-xl">
        <h4 className="text-xs text-[#5B5850] uppercase font-bold tracking-wider mb-1">Certifications Issued</h4>
        <p className="text-3xl font-extrabold text-[#1B4332]">{stats.certifications_issued?.total_issued || 0}</p>
      </div>
      <div className="bg-white border border-[#EDEBE6] p-5 rounded-xl">
        <h4 className="text-xs text-[#5B5850] uppercase font-bold tracking-wider mb-1">Assessment Pass Ratio</h4>
        <p className="text-3xl font-extrabold text-[#14140F]">{stats.assessment_analytics?.pass_ratio || "0%"}</p>
      </div>
    </div>
  );
}
