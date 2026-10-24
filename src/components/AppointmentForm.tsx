import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Info
} from 'lucide-react';
import { Doctor, TimeSlot, Appointment } from '../types';
import { clinicConfig } from '../clinicConfig';
import {
  getTimeSlotsWithAvailability,
  saveAppointmentRequest
} from '../services/bookingStorage';

interface AppointmentFormProps {
  doctors: Doctor[];
  selectedDoctorId: string;
  onDoctorChange: (doctorId: string) => void;
  onBookingSuccess: (appointment: Appointment, savedToSupabase?: boolean) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  doctors,
  selectedDoctorId,
  onDoctorChange,
  onBookingSuccess
}) => {
  // Form fields
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');

  // Slot states
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Errors & Alerts
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Get today's date in YYYY-MM-DD for min date attribute
  const todayStr = new Date().toISOString().split('T')[0];

  // Currently selected doctor object
  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  // Load available time slots whenever doctor or appointmentDate changes
  useEffect(() => {
    if (!currentDoctor || !appointmentDate) {
      setTimeSlots([]);
      return;
    }

    let isMounted = true;
    setLoadingSlots(true);
    setFormError(null);

    getTimeSlotsWithAvailability(currentDoctor, appointmentDate)
      .then((slots) => {
        if (isMounted) {
          setTimeSlots(slots);
          // If previously selected time is no longer available in this day/doc, reset it
          const isCurrentTimeAvailable = slots.some(
            (s) => s.time === appointmentTime && s.isAvailable
          );
          if (!isCurrentTimeAvailable) {
            setAppointmentTime('');
          }
          setLoadingSlots(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error fetching slots:", err);
          setLoadingSlots(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentDoctor?.id, appointmentDate]);

  // Form field validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!patientName.trim()) {
      errors.patientName = 'Patient full name is required.';
    } else if (patientName.trim().length < 2) {
      errors.patientName = 'Please enter a valid name.';
    }

    if (!mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required.';
    } else if (mobileNumber.trim().replace(/\D/g, '').length < 7) {
      errors.mobileNumber = 'Please enter a valid mobile phone number.';
    }

    if (!age) {
      errors.age = 'Age is required.';
    } else {
      const numAge = Number(age);
      if (isNaN(numAge) || numAge <= 0 || numAge > 125) {
        errors.age = 'Please enter an age between 1 and 125.';
      }
    }

    if (!appointmentDate) {
      errors.appointmentDate = 'Please select an appointment date.';
    } else if (appointmentDate < todayStr) {
      errors.appointmentDate = 'Appointment date cannot be in the past.';
    }

    if (!appointmentTime) {
      errors.appointmentTime = 'Please select a preferred appointment time.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      // Scroll smoothly to top of form to see error
      return;
    }

    setSubmitting(true);

    try {
      // Save appointment & double-check slot availability
      const result = await saveAppointmentRequest({
        patientName: patientName.trim(),
        mobileNumber: mobileNumber.trim(),
        age: Number(age),
        gender: gender || undefined,
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorSpecialty: currentDoctor.specialty,
        appointmentDate,
        appointmentTime,
        reasonForVisit: reasonForVisit.trim() || undefined
      });

      if (!result.success || !result.appointment) {
        // Slot became unavailable or validation failed
        setFormError(
          result.errorMessage ||
            'Selected time slot is no longer available. Please select another time.'
        );

        // Refresh slots immediately to show new availability
        if (currentDoctor && appointmentDate) {
          const freshSlots = await getTimeSlotsWithAvailability(currentDoctor, appointmentDate);
          setTimeSlots(freshSlots);
          setAppointmentTime('');
        }
        setSubmitting(false);
        return;
      }

      // Success! Reset form and notify parent
      setPatientName('');
      setMobileNumber('');
      setAge('');
      setGender('');
      setAppointmentDate('');
      setAppointmentTime('');
      setReasonForVisit('');
      setFieldErrors({});

      onBookingSuccess(result.appointment, result.savedToSupabase);
    } catch (err) {
      console.error("Booking error:", err);
      setFormError('An unexpected network or system error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="appointment-form-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
          <Stethoscope className="w-4 h-4" />
          <span>Patient Registration & Scheduling</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">Book an Appointment</h2>
        <p className="text-sm text-slate-600 mt-1">
          Please fill out the form below. All time slots are shown in the clinic's local timezone (
          <span className="font-semibold text-slate-800">{clinicConfig.timezone}</span>).
        </p>
      </div>

      {/* Global Error Banner */}
      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-sm">
            <p className="font-semibold">Unable to complete appointment</p>
            <p className="mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Patient Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              1. Patient Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  if (fieldErrors.patientName) {
                    setFieldErrors((prev) => ({ ...prev, patientName: '' }));
                  }
                }}
                placeholder="e.g. John Doe"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                  fieldErrors.patientName
                    ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            {fieldErrors.patientName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.patientName}</p>
            )}
          </div>

          {/* 2. Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              2. Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  if (fieldErrors.mobileNumber) {
                    setFieldErrors((prev) => ({ ...prev, mobileNumber: '' }));
                  }
                }}
                placeholder="e.g. +1 (555) 000-1234"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                  fieldErrors.mobileNumber
                    ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            {fieldErrors.mobileNumber && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.mobileNumber}</p>
            )}
          </div>

          {/* 3. Age */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              3. Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="125"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                if (fieldErrors.age) {
                  setFieldErrors((prev) => ({ ...prev, age: '' }));
                }
              }}
              placeholder="e.g. 32"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                fieldErrors.age
                  ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            {fieldErrors.age && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.age}</p>
            )}
          </div>

          {/* 4. Gender (Optional dropdown) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              4. Gender <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">Select Gender (optional)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* 5. Doctor Name (Dropdown) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              5. Doctor Name <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => onDoctorChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.specialty}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Available: {currentDoctor?.consultationHours}</span>
            </p>
          </div>

          {/* 6. Appointment Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              6. Appointment Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  if (fieldErrors.appointmentDate) {
                    setFieldErrors((prev) => ({ ...prev, appointmentDate: '' }));
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 transition ${
                  fieldErrors.appointmentDate
                    ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
            </div>
            {fieldErrors.appointmentDate && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.appointmentDate}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Past dates are not allowed.
            </p>
          </div>

          {/* 7. Preferred Appointment Time (Dropdown showing available times) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              7. Preferred Appointment Time <span className="text-red-500">*</span>
            </label>
            <select
              value={appointmentTime}
              disabled={!appointmentDate || loadingSlots}
              onChange={(e) => {
                setAppointmentTime(e.target.value);
                if (fieldErrors.appointmentTime) {
                  setFieldErrors((prev) => ({ ...prev, appointmentTime: '' }));
                }
              }}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition ${
                !appointmentDate
                  ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                  : fieldErrors.appointmentTime
                  ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            >
              {!appointmentDate ? (
                <option value="">Please select a date first</option>
              ) : loadingSlots ? (
                <option value="">Checking available slots...</option>
              ) : timeSlots.length === 0 ? (
                <option value="">No slots found for this date</option>
              ) : (
                <>
                  <option value="">Select an available time slot</option>
                  {timeSlots.map((slot) => (
                    <option
                      key={slot.time}
                      value={slot.time}
                      disabled={!slot.isAvailable}
                    >
                      {slot.time} {slot.isAvailable ? '✓ Available' : `— (${slot.reason || 'Booked'})`}
                    </option>
                  ))}
                </>
              )}
            </select>
            {fieldErrors.appointmentTime && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.appointmentTime}</p>
            )}

            {appointmentDate && !loadingSlots && timeSlots.length > 0 && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>
                  {timeSlots.filter((s) => s.isAvailable).length} slots available on this date ({clinicConfig.slotDurationMinutes} mins each).
                </span>
              </p>
            )}
          </div>

          {/* 8. Reason for Visit (Optional short text field) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              8. Reason for Visit <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={150}
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="e.g. Mild fever, sore throat, or routine wellness checkup"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
            <p className="text-[11px] text-slate-400 mt-1 text-right">
              {reasonForVisit.length}/150 characters
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Instant booking confirmation • Real-time slot reservation</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white shadow-sm transition flex items-center justify-center gap-2 cursor-pointer ${
              submitting
                ? 'bg-blue-400 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-600/30'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying & Saving...</span>
              </>
            ) : (
              <span>Submit Appointment Request</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
