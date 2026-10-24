import React from 'react';
import { X, BookOpen, CheckCircle, Code, Clock, Database, Globe, Play } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-sky-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Beginner's Clinic Setup Guide</h3>
              <p className="text-xs text-blue-100">Simple instructions to customize and maintain your booking website</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          {/* Step 1 */}
          <div className="border-l-4 border-blue-600 pl-4 py-1">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <Code className="w-4 h-4" />
              <h4>Step 1: Add your clinic and doctor details</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Open the file <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">src/clinicConfig.ts</code> in your project.
            </p>
            <ul className="text-xs text-slate-600 list-disc ml-5 mt-1 space-y-1">
              <li>Change <strong>clinicName</strong>, <strong>address</strong>, and <strong>phone</strong>.</li>
              <li>Under the <strong>doctors</strong> list, simply edit the doctor names, specialties, and consultation hours.</li>
              <li>You can add a new doctor by copying one of the doctor blocks.</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-blue-600 pl-4 py-1">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <Clock className="w-4 h-4" />
              <h4>Step 2: Set available appointment times & duration</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              In the same <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">src/clinicConfig.ts</code> file:
            </p>
            <ul className="text-xs text-slate-600 list-disc ml-5 mt-1 space-y-1">
              <li>Set <strong>startHour</strong> (e.g. <code>9</code> for 9:00 AM) and <strong>endHour</strong> (e.g. <code>17</code> for 5:00 PM).</li>
              <li>Set <strong>slotDurationMinutes</strong> (e.g. <code>30</code> for 30-minute intervals).</li>
              <li>Set <strong>breakStartHour</strong> and <strong>breakEndHour</strong> for your lunch break.</li>
              <li>Set <strong>timezone</strong> to your local clinic timezone (e.g. <code>'America/New_York'</code>).</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-emerald-600 pl-4 py-1">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <Database className="w-4 h-4" />
              <h4>Step 3: Connect Supabase Database</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Store all appointment requests directly in your Supabase PostgreSQL database:
            </p>
            <ol className="text-xs text-slate-600 list-decimal ml-5 mt-1 space-y-1">
              <li>Log in to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">Supabase.com</a> and click "New Project".</li>
              <li>Go to <strong>SQL Editor &gt; New Query</strong>, copy and run the SQL table script (available in the "Connect Supabase" modal).</li>
              <li>Go to <strong>Project Settings &gt; API</strong> to get your <strong>Project URL</strong> and <strong>Anon Key</strong>.</li>
              <li>Click the green <strong>Connect Supabase</strong> button in the top bar to paste your credentials and test the connection immediately!</li>
            </ol>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-blue-600 pl-4 py-1">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <Play className="w-4 h-4" />
              <h4>Step 4: Test the form</h4>
            </div>
            <ul className="text-xs text-slate-600 list-disc ml-5 mt-1 space-y-1">
              <li>Fill out all required fields on the home page and click "Submit Appointment Request".</li>
              <li>Notice how that specific doctor and time slot becomes marked as booked immediately.</li>
              <li>Try booking the same doctor and slot again in another tab—the system double-checks and prevents duplicates.</li>
              <li>Refresh the page—the booked slots remain safely saved!</li>
            </ul>
          </div>

          {/* Step 5 */}
          <div className="border-l-4 border-teal-600 pl-4 py-1">
            <div className="flex items-center gap-2 text-teal-700 font-bold">
              <Globe className="w-4 h-4" />
              <h4>Step 5: Publish on Netlify (Free & Fast)</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Your project is fully configured for Netlify with pre-built <code>netlify.toml</code> and SPA redirect rules.
            </p>
            <div className="text-xs text-slate-600 mt-2 space-y-2">
              <p><strong>Option A: Connect via GitHub (Recommended)</strong></p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Push this repository to GitHub.</li>
                <li>Go to <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-teal-700 underline font-semibold">Netlify.com</a> and click <strong>"Add new site" &gt; "Import an existing project"</strong>.</li>
                <li>Choose GitHub and select your repository.</li>
                <li>Netlify will automatically detect:
                  <ul className="list-disc ml-4 mt-0.5 text-slate-500">
                    <li>Build command: <code>npm run build</code></li>
                    <li>Publish directory: <code>dist</code></li>
                  </ul>
                </li>
                <li>Click <strong>Deploy Site</strong>! Your website is live in 60 seconds.</li>
              </ol>

              <p className="pt-1"><strong>Option B: Netlify Drop (No Git required)</strong></p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Run <code>npm run build</code> to generate the <code>dist</code> folder.</li>
                <li>Drag and drop the <code>dist</code> folder into <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-teal-700 underline font-semibold">app.netlify.com/drop</a> to publish instantly!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
