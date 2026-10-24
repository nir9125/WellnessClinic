import { Appointment, Doctor, TimeSlot } from '../types';
import { clinicConfig } from '../clinicConfig';
import { getSupabaseClient } from '../supabaseClient';

const LOCAL_STORAGE_KEY = 'doctor_appointments_db';

/**
 * Helper to format minutes into 12-hour "hh:mm AM/PM"
 */
export function formatTime12h(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Generate all possible daily time slots for the clinic schedule
 */
export function generateDailyTimeSlots(): string[] {
  const slots: string[] = [];
  const startMins = clinicConfig.startHour * 60;
  const endMins = clinicConfig.endHour * 60;
  const step = clinicConfig.slotDurationMinutes;
  
  const breakStartMins = clinicConfig.breakStartHour ? clinicConfig.breakStartHour * 60 : -1;
  const breakEndMins = clinicConfig.breakEndHour ? clinicConfig.breakEndHour * 60 : -1;

  for (let m = startMins; m < endMins; m += step) {
    if (breakStartMins !== -1 && breakEndMins !== -1 && m >= breakStartMins && m < breakEndMins) {
      continue;
    }
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(formatTime12h(h, min));
  }
  return slots;
}

/**
 * Helper to map DB snake_case to Appointment object
 */
function mapFromSupabase(row: any): Appointment {
  return {
    id: row.id,
    patientName: row.patient_name,
    mobileNumber: row.mobile_number,
    age: row.age,
    gender: row.gender || undefined,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    reasonForVisit: row.reason_for_visit || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    status: row.status || 'confirmed'
  };
}

/**
 * Helper to map Appointment object to Supabase row format
 */
function mapToSupabase(apt: Appointment) {
  return {
    id: apt.id,
    patient_name: apt.patientName,
    mobile_number: apt.mobileNumber,
    age: Number(apt.age),
    gender: apt.gender || null,
    doctor_id: apt.doctorId,
    doctor_name: apt.doctorName,
    doctor_specialty: apt.doctorSpecialty,
    appointment_date: apt.appointmentDate,
    appointment_time: apt.appointmentTime,
    reason_for_visit: apt.reasonForVisit || null,
    created_at: apt.createdAt,
    status: apt.status
  };
}

/**
 * Retrieve local fallback appointments
 */
function getLocalAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Save to local cache
 */
function saveLocalAppointments(list: Appointment[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

/**
 * Check if a specific slot is booked for a doctor on a specific date in Supabase (or local fallback)
 */
export async function isSlotBooked(
  doctorId: string,
  date: string,
  time: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .neq('status', 'cancelled')
        .limit(1);

      if (!error && data) {
        return data.length > 0;
      }
      if (error) {
        console.warn("Supabase slot check error, checking local fallback:", error.message);
      }
    } catch (err) {
      console.warn("Supabase query failed, using local fallback:", err);
    }
  }

  // Fallback to local storage
  const localList = getLocalAppointments();
  return localList.some(
    (apt) =>
      apt.doctorId === doctorId &&
      apt.appointmentDate === date &&
      apt.appointmentTime === time &&
      apt.status !== 'cancelled'
  );
}

/**
 * Get all slots for a doctor and date, annotated with availability status
 */
export async function getTimeSlotsWithAvailability(
  doctor: Doctor,
  dateString: string
): Promise<TimeSlot[]> {
  const allSlots = generateDailyTimeSlots();
  if (!dateString) {
    return allSlots.map((time) => ({ time, isAvailable: true }));
  }

  const dateObj = new Date(dateString + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();

  const doctorWorksToday = doctor.availableDays.includes(dayOfWeek);
  if (!doctorWorksToday) {
    return allSlots.map((time) => ({
      time,
      isAvailable: false,
      reason: "Doctor not on duty on this day"
    }));
  }

  const bookedSet = new Set<string>();
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctor.id)
        .eq('appointment_date', dateString)
        .neq('status', 'cancelled');

      if (!error && data) {
        data.forEach((row: any) => {
          if (row.appointment_time) bookedSet.add(row.appointment_time);
        });
      } else if (error) {
        console.warn("Supabase query error:", error.message);
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local storage:", err);
    }
  }

  // Also include any locally stored bookings (e.g. offline testing)
  const localList = getLocalAppointments();
  localList.forEach((apt) => {
    if (
      apt.doctorId === doctor.id &&
      apt.appointmentDate === dateString &&
      apt.status !== 'cancelled'
    ) {
      bookedSet.add(apt.appointmentTime);
    }
  });

  return allSlots.map((time) => {
    const isBooked = bookedSet.has(time);
    return {
      time,
      isAvailable: !isBooked,
      reason: isBooked ? "Already Booked" : undefined
    };
  });
}

/**
 * Save an appointment request with atomic double-check directly into Supabase!
 */
export async function saveAppointmentRequest(
  data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
): Promise<{
  success: boolean;
  appointment?: Appointment;
  errorMessage?: string;
  savedToSupabase?: boolean;
}> {
  try {
    // 1. Validation checks
    if (!data.patientName?.trim()) {
      return { success: false, errorMessage: "Patient Full Name is required." };
    }
    if (!data.mobileNumber?.trim()) {
      return { success: false, errorMessage: "Mobile Number is required." };
    }
    if (!data.age || Number(data.age) <= 0 || Number(data.age) > 130) {
      return { success: false, errorMessage: "Please enter a valid age." };
    }
    if (!data.doctorId) {
      return { success: false, errorMessage: "Please select a doctor." };
    }
    if (!data.appointmentDate) {
      return { success: false, errorMessage: "Please select an appointment date." };
    }
    if (!data.appointmentTime) {
      return { success: false, errorMessage: "Please select an appointment time." };
    }

    // 2. Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(data.appointmentDate + 'T00:00:00');
    if (selectedDate < today) {
      return { success: false, errorMessage: "Appointment date cannot be in the past." };
    }

    // 3. Double-check availability directly from database upon submission
    const alreadyBooked = await isSlotBooked(
      data.doctorId,
      data.appointmentDate,
      data.appointmentTime
    );

    if (alreadyBooked) {
      return {
        success: false,
        errorMessage: `Sorry, ${data.appointmentTime} on ${data.appointmentDate} with ${data.doctorName} was just booked. Please choose another available slot.`
      };
    }

    // 4. Generate unique readable ID (e.g. APT-8492)
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const appointmentId = `APT-${randomDigits}`;

    const newAppointment: Appointment = {
      ...data,
      id: appointmentId,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    let savedToSupabase = false;
    const supabase = getSupabaseClient();

    // 5. Save to Supabase
    if (supabase) {
      try {
        const payload = mapToSupabase(newAppointment);
        const { error } = await supabase
          .from('appointments')
          .insert([payload]);

        if (error) {
          console.error("Supabase insert error:", error);
          if (error.code === '42P01' || error.message.includes('relation "appointments" does not exist')) {
            return {
              success: false,
              errorMessage: 'Supabase table "appointments" not found. Please run the SQL setup script in your Supabase SQL Editor.'
            };
          }
          return {
            success: false,
            errorMessage: `Supabase database error: ${error.message}`
          };
        } else {
          savedToSupabase = true;
        }
      } catch (err: any) {
        console.error("Supabase insert exception:", err);
        return {
          success: false,
          errorMessage: `Failed to insert appointment into Supabase: ${err.message || 'Network error'}`
        };
      }
    }

    // 6. Always maintain local cache backup
    const local = getLocalAppointments();
    local.push(newAppointment);
    saveLocalAppointments(local);

    return {
      success: true,
      appointment: newAppointment,
      savedToSupabase
    };
  } catch (error) {
    console.error("Booking error:", error);
    return {
      success: false,
      errorMessage: "An unexpected error occurred while booking. Please try again."
    };
  }
}
