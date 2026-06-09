import React, { useState, useEffect } from 'react';
import { 
  Users, Layers, Trash2, Edit, Save, Plus, X, Brain, 
  Calendar, Clock, Check, RefreshCw, Server, Shield, Search, ArrowRight, UserPlus
} from 'lucide-react';

interface DBUser {
  id: number;
  uid: string;
  email: string;
  createdAt?: string;
}

interface DBMeeting {
  id: string;
  userId: number;
  title: string;
  date: string;
  duration: string;
  summary: string;
  transcript: string;
  keyTopics?: any;
  decisions?: any;
  actionItems?: any;
  timeline?: any;
  sentiment?: any;
  createdAt?: string;
  userEmail: string;
  userUid: string;
}

interface AdminDashboardProps {
  token: string | null;
  currentUserEmail?: string;
}

export default function AdminDashboard({ token, currentUserEmail }: AdminDashboardProps) {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [meetings, setMeetings] = useState<DBMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search and filters
  const [userSearch, setUserSearch] = useState('');
  const [meetingSearch, setMeetingSearch] = useState('');

  // Editing state for meetings
  const [editingMeeting, setEditingMeeting] = useState<DBMeeting | null>(null);
  
  // Custom manual record creation
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({
    userId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: '25 mins',
    summary: '',
    transcript: '',
  });

  // AI Analyzer execution loading
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to load control plane data: Status ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setMeetings(data.meetings || []);
        // Autofill default creating user if available
        if (data.users && data.users.length > 0 && !newMeetingForm.userId) {
          setNewMeetingForm(prev => ({ ...prev, userId: String(data.users[0].id) }));
        }
      } else {
        throw new Error(data.error || 'Server rejected administrative lookup.');
      }
    } catch (err: any) {
      console.error('Admin query failed:', err);
      setError(err.message || 'Verification token or Postgres link offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOverview();
    }
  }, [token]);

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete user ${email}? This will CASCADE delete all their meetings forever.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`User ${email} and all owned meetings purged successfully.`);
        fetchOverview();
      } else {
        throw new Error(data.error || 'User deletion refused.');
      }
    } catch (err: any) {
      setError(err.message || 'Database write deletion failed.');
    }
  };

  const handleDeleteMeeting = async (meetingId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the meeting "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Meeting "${title}" deleted.`);
        fetchOverview();
      } else {
        throw new Error(data.error || 'Meeting deletion refused.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove meeting.');
    }
  };

  const handleUpdateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;

    try {
      const res = await fetch(`/api/admin/meetings/${editingMeeting.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingMeeting)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Meeting "${editingMeeting.title}" details updated in database.`);
        setEditingMeeting(null);
        fetchOverview();
      } else {
        throw new Error(data.error || 'Meeting update refused.');
      }
    } catch (err: any) {
      setError(err.message || 'Database write update failed.');
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!newMeetingForm.transcript || !newMeetingForm.title) {
      setError('Title and Transcript are required to trigger AI analyzer.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/meetings/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newMeetingForm.title,
          transcript: newMeetingForm.transcript,
          date: newMeetingForm.date
        })
      });

      if (!res.ok) {
        throw new Error('AI Analyzer pipeline faulted.');
      }

      const report = await res.json();
      
      // Save this analyzed report directly to the specified user
      const saveRes = await fetch('/api/admin/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: `meet_${Math.random().toString(36).substr(2, 9)}`,
          userId: newMeetingForm.userId,
          title: newMeetingForm.title,
          date: newMeetingForm.date,
          duration: report.duration || newMeetingForm.duration,
          transcript: newMeetingForm.transcript,
          summary: report.summary,
          keyTopics: report.keyTopics || [],
          decisions: report.decisions || [],
          actionItems: report.actionItems || [],
          timeline: report.timeline || [],
          sentiment: report.sentiment || { overall: 'Positive', confidence: 0.95 }
        })
      });

      const saveResult = await saveRes.json();
      if (saveRes.ok && saveResult.success) {
        setSuccess(`Successfully analyzed and saved meeting "${newMeetingForm.title}" into SQL Postgres.`);
        setIsAddOpen(false);
        setNewMeetingForm({
          userId: users[0]?.id ? String(users[0].id) : '',
          title: '',
          date: new Date().toISOString().split('T')[0],
          duration: '35 mins',
          summary: '',
          transcript: '',
        });
        fetchOverview();
      } else {
        throw new Error(saveResult.error || 'Failed to save analyzed report.');
      }
    } catch (err: any) {
      setError(err.message || 'AI pipeline failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingForm.userId || !newMeetingForm.title || !newMeetingForm.summary) {
      setError('Please select a user and provide a Title and Summary.');
      return;
    }

    try {
      const mockResult = {
        id: `meet_${Math.random().toString(36).substr(2, 9)}`,
        userId: newMeetingForm.userId,
        title: newMeetingForm.title,
        date: newMeetingForm.date,
        duration: newMeetingForm.duration,
        transcript: newMeetingForm.transcript || 'Manual entry transcript.',
        summary: newMeetingForm.summary,
        keyTopics: [
          { title: "Manual Review", description: "This record was directly seeded by the administrative control panel." }
        ],
        decisions: [],
        actionItems: [],
        timeline: [],
        sentiment: { overall: "Neutral", confidence: 1.0 }
      };

      const res = await fetch('/api/admin/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockResult)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Directly seeded Custom Meeting "${newMeetingForm.title}" in database.`);
        setIsAddOpen(false);
        setNewMeetingForm({
          userId: users[0]?.id ? String(users[0].id) : '',
          title: '',
          date: new Date().toISOString().split('T')[0],
          duration: '25 mins',
          summary: '',
          transcript: '',
        });
        fetchOverview();
      } else {
        throw new Error(data.error || 'Direct write insertion rejected.');
      }
    } catch (err: any) {
      setError(err.message || 'Direct database insert failed.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.uid.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(meetingSearch.toLowerCase()) ||
    m.userEmail.toLowerCase().includes(meetingSearch.toLowerCase()) ||
    m.summary.toLowerCase().includes(meetingSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 text-gray-200" id="admin-dashboard-root">
      {/* Admin Title Panel */}
      <div className="bg-[#12161f] border border-gray-800 rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg shadow-inner">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
              Corporate Administrative System Console
              <span className="text-[10px] uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold">
                ROOT CONTROL ACCESS
              </span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">
              Direct telemetry database reads & writes against Supabase schemas. Purge users, edit summaries, and generate reports.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOverview}
          className="px-3.5 py-1.5 text-xs font-semibold bg-gray-950 border border-gray-800 hover:border-zinc-700 hover:text-white rounded-lg flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Force Sync Database
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/35 rounded-xl text-xs text-red-400 leading-relaxed font-semibold flex items-start gap-2.5">
          <span className="p-1 rounded-md bg-red-500/10 text-red-400 shrink-0">✕</span>
          <div className="flex-1">
            <span className="block font-bold">Operation Faulted</span>
            <span className="opacity-80 block mt-0.5">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-950/35 rounded-xl text-xs text-emerald-400 leading-relaxed font-semibold flex items-start gap-2.5">
          <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0">✓</span>
          <div className="flex-grow">
            <span className="block font-bold">Admin State Sync OK</span>
            <span className="opacity-80 block mt-0.5">{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-white font-mono text-xs cursor-pointer">dismiss</button>
        </div>
      )}

      {/* Stat grid widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#12161f] border border-gray-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Total Registered Users</span>
            <span className="text-2xl font-black text-white font-mono">{users.length}</span>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#12161f] border border-gray-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">System Total Meetings</span>
            <span className="text-2xl font-black text-white font-mono">{meetings.length}</span>
          </div>
          <div className="p-2.5 bg-gradient-to-r from-violet-500/10 to-teal-500/10 text-indigo-400 rounded-lg">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-[#12161f] border border-gray-800 rounded-xl p-5 shadow-xs flex flex-col justify-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Administrative Actions</span>
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Analyze/Add New Meeting Record for Any User
          </button>
        </div>
      </div>

      {/* Primary Split View: Left column Users, Right Column Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* User Account List (Col 4) */}
        <div className="lg:col-span-4 bg-[#12161f] border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-850 pb-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Users Database ({filteredUsers.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by email or Auth ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-md text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Fetching secure tables...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-600 italic">
              No matching accounts in public.users schema.
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[450px] pr-1">
              {filteredUsers.map((u) => {
                const userMeetingsCount = meetings.filter(m => m.userId === u.id).length;
                return (
                  <div key={u.id} className="p-3 bg-gray-950 border border-gray-850 rounded-lg flex flex-col gap-2 relative group hover:border-gray-800 transition">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="space-y-0.5 min-w-0">
                        <span className="block font-bold text-xs text-zinc-200 truncate" title={u.email}>{u.email}</span>
                        <span className="block font-mono text-[9px] text-zinc-500 truncate" title={`Firebase UID: ${u.uid}`}>
                          UID: {u.uid.slice(0, 10)}...
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="p-1 hover:bg-rose-950/40 text-rose-500 rounded border border-transparent hover:border-rose-900/30 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete User and CASCADE meetings"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-t border-gray-900 pt-1.5">
                      <span>ID: {u.id}</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-900 text-zinc-400">{userMeetingsCount} meetings</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Meeting Entries Database (Col 8) */}
        <div className="lg:col-span-8 bg-[#12161f] border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-850 pb-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Meetings Table Contents ({filteredMeetings.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by title, owner email, keywords..."
              value={meetingSearch}
              onChange={(e) => setMeetingSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-md text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
              <span>Querying database rows...</span>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-600 italic">
              No meeting records found.
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1">
              {filteredMeetings.map((m) => (
                <div key={m.id} className="p-4 bg-gray-950 border border-gray-850 rounded-xl flex flex-col gap-3 hover:border-zinc-700 transition relative group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-white tracking-tight leading-none">{m.title}</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/50 border border-indigo-900/30 text-indigo-400">
                          {m.date}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-mono">ID: {m.id}</span>
                      </div>
                      
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed italic pr-8">
                        "{m.summary}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setEditingMeeting(m)}
                        className="p-1.5 bg-gray-900 hover:bg-gray-850 hover:text-indigo-400 border border-gray-800 rounded-lg text-zinc-400 cursor-pointer transition"
                        title="Edit Meeting"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(m.id, m.title)}
                        className="p-1.5 bg-gray-900 hover:bg-rose-950/40 hover:text-rose-500 border border-gray-800 rounded-lg text-zinc-400 cursor-pointer transition"
                        title="Delete Meeting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-t border-gray-900 pt-2 bg-gray-950/80">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Owner Account: <strong className="text-zinc-300 font-semibold">{m.userEmail}</strong> (DB ID: {m.userId})
                    </span>
                    <span>Duration: {m.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: EDIT MEETING DETAILS */}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">Edit Database Meeting Row</h3>
              <button 
                onClick={() => setEditingMeeting(null)}
                className="p-1 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMeeting} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={editingMeeting.title}
                  onChange={(e) => setEditingMeeting({...editingMeeting, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Date</label>
                  <input
                    type="date"
                    required
                    value={editingMeeting.date}
                    onChange={(e) => setEditingMeeting({...editingMeeting, date: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Duration</label>
                  <input
                    type="text"
                    value={editingMeeting.duration}
                    onChange={(e) => setEditingMeeting({...editingMeeting, duration: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Executive Summary</label>
                <textarea
                  required
                  rows={4}
                  value={editingMeeting.summary}
                  onChange={(e) => setEditingMeeting({...editingMeeting, summary: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Raw Dialog Transcript</label>
                <textarea
                  rows={3}
                  value={editingMeeting.transcript}
                  onChange={(e) => setEditingMeeting({...editingMeeting, transcript: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-[11px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-3 border-t border-gray-850">
                <button
                  type="button"
                  onClick={() => setEditingMeeting(null)}
                  className="px-4 py-2 bg-gray-950 border border-gray-800 hover:text-zinc-200 text-xs text-zinc-400 font-bold rounded-lg transition hover:border-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Database Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ANALYZE & SEED RECORD FOR ANY ACCOUNT */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-rose-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-400" />
                Analyze & Seed Custom Meeting
              </h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Target Account Workspace User</label>
                <select
                  value={newMeetingForm.userId}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.email} (DB ID: {u.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Strategy Synchronisation"
                  value={newMeetingForm.title}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Date</label>
                  <input
                    type="date"
                    value={newMeetingForm.date}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Manual Duration</label>
                  <input
                    type="text"
                    value={newMeetingForm.duration}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-2.5">
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                  Option 1: Execute Real-time Gemini AI Analysis (Recommended)
                </span>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Enter speech transcripts and let Gemini map key topics, timelines, sentiment, and extract action items instantly.
                </p>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Speech Transcript Dialogs</label>
                  <textarea
                    rows={4}
                    placeholder="Alex: We should migrate our SQL clusters next week. Sarah: Agreed, let's target Tuesday morning..."
                    value={newMeetingForm.transcript}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, transcript: e.target.value })}
                    className="w-full p-2 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-zinc-200"
                  />
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing || !newMeetingForm.transcript || !newMeetingForm.title}
                  onClick={handleTriggerAnalysis}
                  className="w-full py-1.5 px-3 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-600 disabled:opacity-45 disabled:pointer-events-none text-white font-bold text-xs rounded-lg transition tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Gemini Processing Pipelines Running...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Run Real-time Gemini Analysis & Seed SQL Row
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-gray-900/50 border border-gray-850 rounded-xl space-y-2.5 text-left">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-zinc-400" />
                  Option 2: Direct Database Override (Manual Summary Seed)
                </span>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Custom Summary Content</label>
                  <textarea
                    rows={2}
                    placeholder="Provide a custom summary directly without calling AI..."
                    value={newMeetingForm.summary}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, summary: e.target.value })}
                    className="w-full p-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-zinc-200 resize-none font-sans"
                  />
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing || !newMeetingForm.summary || !newMeetingForm.title}
                  onClick={handleManualCreateMeeting}
                  className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-45 disabled:pointer-events-none text-zinc-200 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Directly Inject Manual SQL Row
                </button>
              </div>

              <div className="flex items-center gap-3 justify-end pt-3 border-t border-gray-850">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-gray-950 border border-gray-800 hover:text-zinc-200 text-xs text-zinc-400 font-bold rounded-lg transition hover:border-gray-700 cursor-pointer"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
