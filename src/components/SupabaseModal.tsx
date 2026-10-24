import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Key
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveCustomSupabaseCredentials,
  testSupabaseConnection
} from '../supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChanged: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConnectionChanged
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    // Save
    saveCustomSupabaseCredentials(url.trim(), anonKey.trim());
    onConnectionChanged();

    // Test
    const res = await testSupabaseConnection();
    setTestResult(res);
    setTesting(false);
  };

  const sqlSnippet = `-- 1. Create the appointments table in Supabase
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_specialty TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  reason_for_visit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'confirmed' NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Allow public booking submissions
CREATE POLICY "Allow public booking insert" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- 4. Allow public slot availability lookups
CREATE POLICY "Allow public availability check" ON public.appointments
  FOR SELECT USING (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Connect Supabase Database</h3>
              <p className="text-xs text-emerald-100">
                Store all doctor appointment bookings in your Supabase PostgreSQL database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          {/* Quick steps banner */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
            <p className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>3 Simple Steps to Connect:</span>
            </p>
            <p>1. Open your project on <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-semibold text-emerald-800">Supabase.com</a>.</p>
            <p>2. Copy the SQL script below and run it in <strong>SQL Editor &gt; New Query</strong> to create the table.</p>
            <p>3. Go to <strong>Project Settings &gt; API</strong>, copy your <strong>Project URL</strong> and <strong>Anon Key</strong>, and paste them below.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzabcdefg.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Supabase Anon Public Key</span>
                <span className="text-[11px] text-slate-400 normal-case font-normal flex items-center gap-1">
                  <Key className="w-3 h-3" /> Safe for browser client
                </span>
              </label>
              <input
                type="text"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Test result banner */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">
                    {testResult.success ? 'Connected!' : 'Connection Failed'}
                  </p>
                  <p className="mt-0.5">{testResult.message}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={testing}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Save & Test Supabase Connection</span>
                  </>
                )}
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1"
              >
                <span>Open Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </form>

          {/* SQL Setup Script */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Table SQL Script</span>
              </h4>
              <button
                type="button"
                onClick={copySql}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 cursor-pointer transition"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Run this in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to create the <code>appointments</code> table and security policies:
            </p>
            <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {sqlSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Settings are automatically remembered.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
