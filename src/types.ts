export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification?: string;
  consultationHours: string; // e.g. "9:00 AM - 5:00 PM (Mon - Sat)"
  availableDays: number[]; // 0 for Sun, 1 for Mon, ..., 6 for Sat
}

export interface ClinicConfig {
  clinicName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  emergencyContact?: string;
  timezone: string; // e.g. "America/New_York", "Asia/Kolkata", "UTC"
  
  // Schedule settings
  startHour: number; // e.g. 9 (9 AM)
  endHour: number; // e.g. 17 (5 PM)
  slotDurationMinutes: number; // e.g. 30 (30 min per appointment)
  breakStartHour?: number; // e.g. 13 (1 PM lunch break)
  breakEndHour?: number; // e.g. 14 (2 PM)
  
  // Supabase Database Config
  supabase?: {
    url: string;
    anonKey: string;
  };

  doctors: Doctor[];
}

export interface Appointment {
  id: string;
  patientName: string;
  mobileNumber: string;
  age: number | string;
  gender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "09:30 AM"
  reasonForVisit?: string;
  createdAt: string; // ISO string
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface TimeSlot {
  time: string; // e.g. "09:00 AM"
  isAvailable: boolean;
  reason?: string;
}
