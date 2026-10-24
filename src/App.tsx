import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  Heart,
  Database
} from 'lucide-react';
import { clinicConfig } from './clinicConfig';
import { Appointment } from './types';
import { Header } from './components/Header';
import { DoctorInfoCard } from './components/DoctorInfoCard';
import { AppointmentForm } from './components/AppointmentForm';
import { BookingConfirmation } from './components/BookingConfirmation';
import { SetupGuideModal } from './components/SetupGuideModal';
import { SupabaseModal } from './components/SupabaseModal';
import { getSupabaseCredentials } from './supabaseClient';

export default function App() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    clinicConfig.doctors[0]?.id || ''
  );
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [savedToSupabase, setSavedToSupabase] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Check Supabase connection status
  const checkSupabaseStatus = () => {
    const creds = getSupabaseCredentials();
    setIsSupabaseConnected(creds.isConfigured);
  };

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  const scrollToBooking = () => {
    if (confirmedBooking) {
      setConfirmedBooking(null);
    }
    const elem = document.getElementById('booking-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectDoctorFromList = (docId: string) => {
    setSelectedDoctorId(docId);
    scrollToBooking();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Medical Top Header */}
      <Header
        onBookClick={scrollToBooking}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-10">
        {/* If an appointment was just confirmed, display the clear confirmation view */}
        {confirmedBooking ? (
          <div className="py-4">
            <BookingConfirmation
              appointment={confirmedBooking}
              savedToSupabase={savedToSupabase}
              onBookAnother={() => {
                setConfirmedBooking(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        ) : (
          <>
            {/* Supabase Status Alert Banner if not yet connected */}
            {!isSupabaseConnected && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Supabase Database:</strong> Not connected yet. Bookings are temporarily saved in local browser storage.
                  </span>
                </div>
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition shrink-0 cursor-pointer text-xs"
                >
                  Connect Supabase Now
                </button>
              </div>
            )}

            {/* Hero Welcome Banner */}
            <section className="bg-white rounded-3xl border border-blue-100 p-6 sm:p-10 mb-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-50 rounded-full blur-2xl pointer-events-none" />
              
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Trusted Medical & Specialist Care</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Schedule Your Medical Visit in Under <span className="text-blue-600">60 Seconds</span>
                </h1>

                <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                  Welcome to {clinicConfig.clinicName}. Select your preferred doctor and consultation slot. Instant confirmation with zero waiting.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    onClick={scrollToBooking}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer"
                  >
                    <span>Book an Appointment</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`tel:${clinicConfig.phone}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition"
                  >
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Call {clinicConfig.phone}</span>
                  </a>
                </div>

                {/* Key Clinic Assurances */}
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No waiting room queues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Certified specialists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time slot reservation</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Doctor Specialty & Consultation Hours List */}
            <DoctorInfoCard
              doctors={clinicConfig.doctors}
              selectedDoctorId={selectedDoctorId}
              onSelectDoctor={handleSelectDoctorFromList}
            />

            {/* 3. Appointment Form Section */}
            <div id="booking-section" className="scroll-mt-24">
              <AppointmentForm
                doctors={clinicConfig.doctors}
                selectedDoctorId={selectedDoctorId}
                onDoctorChange={(id) => setSelectedDoctorId(id)}
                onBookingSuccess={(apt, fromSupabase) => {
                  setConfirmedBooking(apt);
                  setSavedToSupabase(Boolean(fromSupabase));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">{clinicConfig.clinicName}</span>
            <span>•</span>
            <span>{clinicConfig.address}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConnected ? 'Supabase: Connected' : 'Connect Supabase'}</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-blue-600 hover:text-blue-800 underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Customization Guide</span>
            </button>
            <span>•</span>
            <span>Timezone: {clinicConfig.timezone}</span>
          </div>
        </div>
      </footer>

      {/* Beginner Customization & Setup Guide Modal */}
      <SetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Supabase Connection & SQL Table Setup Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionChanged={checkSupabaseStatus}
      />
    </div>
  );
}
