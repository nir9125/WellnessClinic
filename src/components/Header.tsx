import React from 'react';
import { Phone, Clock, MapPin, HeartPulse, HelpCircle, Database, CheckCircle2 } from 'lucide-react';
import { clinicConfig } from '../clinicConfig';
import { getSupabaseCredentials } from '../supabaseClient';

interface HeaderProps {
  onBookClick: () => void;
  onOpenGuide: () => void;
  onOpenSupabase: () => void;
  isSupabaseConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onBookClick,
  onOpenGuide,
  onOpenSupabase,
  isSupabaseConnected
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top emergency / consultation & database status banner */}
      <div className="bg-gradient-to-r from-blue-700 to-sky-700 text-white text-xs sm:text-sm py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-200" />
            <span>Consultation Hours: Mon - Sat ({clinicConfig.startHour}:00 AM - {clinicConfig.endHour > 12 ? clinicConfig.endHour - 12 : clinicConfig.endHour}:00 PM)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-blue-100">
            {/* Supabase connection indicator button */}
            <button
              onClick={onOpenSupabase}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition ${
                isSupabaseConnected
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/30'
              }`}
              title="Click to manage Supabase database connection and SQL tables"
            >
              <Database className="w-3 h-3" />
              <span>{isSupabaseConnected ? 'Supabase: Connected' : 'Connect Supabase'}</span>
            </button>

            <span className="hidden md:inline text-blue-300">|</span>

            <a href={`tel:${clinicConfig.phone}`} className="flex items-center gap-1 hover:text-white transition">
              <Phone className="w-3.5 h-3.5" />
              <span>{clinicConfig.phone}</span>
            </a>

            <span className="hidden md:inline text-blue-300">|</span>

            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1 text-white underline hover:text-blue-100 transition cursor-pointer text-xs"
              title="Click for beginner guide on how to edit doctors, set times, and connect Supabase"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Setup Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Clinic Navbar */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {clinicConfig.clinicName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate max-w-xs sm:max-w-md">{clinicConfig.address}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onBookClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm shadow-blue-600/30 transition duration-150 cursor-pointer"
          >
            <span>Book an Appointment</span>
          </button>
        </div>
      </div>
    </header>
  );
};
