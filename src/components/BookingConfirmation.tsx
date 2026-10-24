import React from 'react';
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Printer,
  PlusCircle,
  FileText,
  Database
} from 'lucide-react';
import { Appointment } from '../types';
import { clinicConfig } from '../clinicConfig';

interface BookingConfirmationProps {
  appointment: Appointment;
  savedToSupabase?: boolean;
  onBookAnother: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  appointment,
  savedToSupabase,
  onBookAnother
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-6 sm:p-10 max-w-2xl mx-auto my-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Success Badge */}
      <div className="text-center pb-6 border-b border-slate-100">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Database className="w-3.5 h-3.5" />
          <span>{savedToSupabase ? 'Saved to Supabase Database' : 'Booking Confirmed & Saved'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Appointment Request Received
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Your slot has been reserved. Please arrive 10 minutes prior to your consultation.
        </p>
      </div>

      {/* Reference Number Card */}
      <div className="my-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Appointment Reference ID
          </p>
          <p className="text-2xl font-mono font-bold text-blue-900">
            {appointment.id}
          </p>
        </div>
        <div className="text-xs text-slate-500 sm:text-right">
          <p>Booked on:</p>
          <p className="font-medium text-slate-700">
            {new Date(appointment.createdAt).toLocaleDateString()} at{' '}
            {new Date(appointment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Patient Details</p>
              <p className="font-semibold text-slate-900">{appointment.patientName}</p>
              <p className="text-xs text-slate-600">
                Age: {appointment.age} yrs {appointment.gender ? `• ${appointment.gender}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Contact Phone</p>
              <p className="font-semibold text-slate-900">{appointment.mobileNumber}</p>
              <p className="text-xs text-emerald-600">SMS confirmation sent</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Appointment Date & Time</p>
              <p className="font-semibold text-slate-900">
                {appointment.appointmentDate}
              </p>
              <p className="text-xs font-medium text-blue-700 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {appointment.appointmentTime} ({clinicConfig.timezone})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              Dr
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Doctor Assigned</p>
              <p className="font-semibold text-slate-900">{appointment.doctorName}</p>
              <p className="text-xs text-slate-600">{appointment.doctorSpecialty}</p>
            </div>
          </div>
        </div>

        {appointment.reasonForVisit && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Reason for Visit</p>
              <p className="text-slate-800 text-sm">{appointment.reasonForVisit}</p>
            </div>
          </div>
        )}

        {/* Clinic Location Reminder */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3 text-xs text-slate-600">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">{clinicConfig.clinicName}</p>
            <p>{clinicConfig.address}</p>
            <p className="mt-1 text-blue-700">Questions or rescheduling? Call us at {clinicConfig.phone}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Confirmation</span>
        </button>

        <button
          onClick={onBookAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm shadow-blue-600/30 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Another Appointment</span>
        </button>
      </div>
    </div>
  );
};
