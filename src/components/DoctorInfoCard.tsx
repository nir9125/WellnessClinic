import React from 'react';
import { UserCheck, Clock, Award, Calendar } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorInfoCardProps {
  doctors: Doctor[];
  selectedDoctorId: string;
  onSelectDoctor: (doctorId: string) => void;
}

export const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
}) => {
  return (
    <section className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Medical Faculty
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Our Specialist Doctors</h2>
          <p className="text-slate-600 text-sm">
            Choose your specialist doctor to view consultation hours and book a visit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc) => {
          const isSelected = doc.id === selectedDoctorId;
          return (
            <div
              key={doc.id}
              onClick={() => onSelectDoctor(doc.id)}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative bg-white ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-md shadow-blue-500/10 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                      {doc.name}
                    </h3>
                    {isSelected && (
                      <span className="text-[11px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-blue-700">{doc.specialty}</p>
                  {doc.qualification && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doc.qualification}</span>
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{doc.consultationHours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
