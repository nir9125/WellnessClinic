import { ClinicConfig } from './types';

/**
 * =======================================================================
 * CLINIC CONFIGURATION FILE
 * =======================================================================
 * You can easily edit your clinic details, doctor list, consultation hours,
 * and Supabase connection right here!
 *
 * For beginners: Just edit the values inside the quotes "..." or numbers.
 */

export const clinicConfig: ClinicConfig = {
  // 1. Clinic Basic Information
  clinicName: "CarePoint Family Medical & Dental Center",
  tagline: "Compassionate, high-quality healthcare for you and your family",
  address: "124 Healthcare Boulevard, Suite 300, Cityville, ST 12345",
  phone: "+1 (555) 234-5678",
  email: "appointments@carepointmedical.com",
  emergencyContact: "+1 (555) 911-0000",
  
  // 2. Clinic Local Timezone
  // Examples: 'America/New_York', 'America/Los_Angeles', 'Asia/Kolkata', 'Europe/London'
  timezone: "America/New_York",

  // 3. Consultation Hours & Appointment Duration
  // 24-hour format: 9 = 9:00 AM, 17 = 5:00 PM
  startHour: 9,              // Clinic opens at 9:00 AM
  endHour: 17,               // Clinic closes at 5:00 PM
  slotDurationMinutes: 30,   // Each appointment slot duration in minutes (e.g. 15, 30, 45, or 60)
  
  // Optional Lunch / Staff Break (leave null or undefined if no break)
  breakStartHour: 13,        // 1:00 PM lunch break starts
  breakEndHour: 14,          // 2:00 PM lunch break ends

  // 4. SUPABASE DATABASE CONNECTION
  supabase: {
    url: "https://eunpxzethgdjvmujdsvo.supabase.co",
    anonKey: "sb_publishable_Sa8U4ateYa-DdVFH6gQTBw_J3PmxVx3"
  },

  // 5. List of Available Doctors
  doctors: [
    {
      id: "doc-1",
      name: "Dr. Sarah Mitchell, MD",
      specialty: "General Physician & Family Medicine",
      qualification: "MBBS, MD (Family Medicine)",
      consultationHours: "09:00 AM – 05:00 PM (Monday to Friday)",
      availableDays: [1, 2, 3, 4, 5], // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
    },
    {
      id: "doc-2",
      name: "Dr. James Richardson, MD",
      specialty: "Internal Medicine & Cardiology",
      qualification: "MD, FACC",
      consultationHours: "10:00 AM – 04:00 PM (Monday, Wednesday, Friday)",
      availableDays: [1, 3, 5], // Mon, Wed, Fri
    },
    {
      id: "doc-3",
      name: "Dr. Elena Rodriguez, DDS",
      specialty: "Dental Surgeon",
      qualification: "BDS, MDS (Dentistry)",
      consultationHours: "09:00 AM – 03:00 PM (Tuesday, Thursday, Saturday)",
      availableDays: [2, 4, 6], // Tue, Thu, Sat
    },
    {
      id: "doc-4",
      name: "Dr. Robert Chen, MD",
      specialty: "Pediatrician (Child Specialist)",
      qualification: "MD (Pediatrics), FAAP",
      consultationHours: "09:00 AM – 05:00 PM (Monday to Saturday)",
      availableDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    }
  ]
};
