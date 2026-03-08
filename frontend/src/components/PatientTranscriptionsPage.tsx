import { useState, useEffect, useMemo } from 'react';
import { FileText, Search, Filter, ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface NoteEntry {
  noteId: string;
  patientId: string;
  patientName: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  createdAt: string;
}

type SoapTab = 'assessment' | 'plan' | 'subjective' | 'objective';

function NoteCard({ note }: { note: NoteEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SoapTab>('assessment');

  const date = new Date(note.createdAt);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const tabs: { id: SoapTab; label: string; badge: string; content: string }[] = [
    { id: 'assessment', label: 'Assessment', badge: 'A', content: note.assessment },
    { id: 'plan', label: 'Plan', badge: 'P', content: note.plan },
    { id: 'subjective', label: 'Subjective', badge: 'S', content: note.subjective },
    { id: 'objective', label: 'Objective', badge: 'O', content: note.objective },
  ];

  const summary = note.assessment || note.plan || note.subjective || 'Consultation note';
  const summaryPreview = summary.length > 120 ? summary.substring(0, 120) + '…' : summary;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0px_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Card header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4 flex gap-4 items-start hover:bg-slate-50/60 transition-colors"
      >
        <div className="bg-[#eff6ff] rounded-xl p-2.5 shrink-0">
          <FileText size={18} className="text-[#196ee6]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm">Consultation Note</p>
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{summaryPreview}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar size={11} />
              {dateStr}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock size={11} />
              {timeStr}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-slate-400 mt-0.5">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded SOAP detail */}
      {expanded && (
        <div className="border-t border-slate-100">
          {/* Tab bar */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-4 gap-1 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-2.5 px-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#196ee6] text-[#196ee6]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className={`size-4 rounded text-[10px] font-bold flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-[#196ee6]/10 text-[#196ee6]' : 'bg-slate-200 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div className="p-4">
            {tabs.map(tab => tab.id === activeTab && (
              <p key={tab.id} className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {tab.content || <span className="text-slate-400 italic">Not recorded</span>}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientTranscriptionsPage() {
  const { user } = useUser();
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.sub) return;
    try {
      // Read from both possible keys and merge (handles patients whose cognitoUserId
      // was null in DB at time of consultation — doctor saves under email key instead)
      const keys = [
        `swaraksha_notes_${user.sub}`,
        ...(user.email ? [`swaraksha_notes_email_${user.email}`] : []),
      ];
      const allNotes: NoteEntry[] = [];
      const seen = new Set<string>();
      for (const key of keys) {
        const stored = JSON.parse(localStorage.getItem(key) || '[]') as NoteEntry[];
        for (const n of stored) {
          if (!seen.has(n.noteId)) {
            seen.add(n.noteId);
            allNotes.push(n);
          }
        }
      }
      // Sort newest first
      allNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotes(allNotes);
    } catch {
      setNotes([]);
    }
  }, [user?.sub, user?.email]);

  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(n =>
      n.assessment?.toLowerCase().includes(q) ||
      n.plan?.toLowerCase().includes(q) ||
      n.subjective?.toLowerCase().includes(q) ||
      new Date(n.createdAt).toLocaleDateString('en-IN').includes(q)
    );
  }, [notes, search]);

  return (
    <div className="flex-1 overflow-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 pt-6 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">Transcriptions</h1>
        <p className="text-slate-500 text-sm mt-1">SOAP notes from your consultations</p>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-4xl space-y-4">

        {/* Search + filter bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#196ee6]/20 focus:border-[#196ee6]"
            />
          </div>
          <button className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Note count badge */}
        {notes.length > 0 && (
          <p className="text-xs text-slate-400 px-1">
            {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
            {search ? ` matching "${search}"` : ''}
          </p>
        )}

        {/* Notes list */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(note => <NoteCard key={note.noteId} note={note} />)}
          </div>
        ) : notes.length === 0 ? (
          /* Empty state — no notes at all */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="bg-[#eff6ff] rounded-2xl p-4 mb-4">
                <FileText size={28} className="text-[#196ee6]" />
              </div>
              <p className="font-semibold text-slate-900 text-sm">No transcriptions yet</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">
                SOAP notes generated by your doctor during consultations will appear here.
                They'll be available to review after each session.
              </p>
            </div>
          </div>
        ) : (
          /* No results for search */
          <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
            <p className="text-slate-500 text-sm font-medium">No notes match "{search}"</p>
            <button onClick={() => setSearch('')} className="text-[#196ee6] text-xs mt-1 hover:underline">
              Clear search
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
