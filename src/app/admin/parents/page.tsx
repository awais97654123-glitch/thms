'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, MapPin } from 'lucide-react';

export default function AdminParentsPage() {
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/parents')
      .then((res) => res.json())
      .then((data) => {
        if (data.parents) setParents(data.parents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Parents & Guardians
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Parents Directory & Family Accounts
          </h1>
          <p className="text-xs text-slate-500">
            Verified parent records, CNIC data, emergency contact lines, and linked enrolled children.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parents.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                {p.fatherName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{p.fatherName}</h3>
                <p className="text-xs text-slate-500">{p.fatherOccupation || 'Parent'}</p>
                <span className="text-[10px] font-mono text-slate-400">CNIC: {p.fatherCnic || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t pt-3">
              <p className="flex items-center gap-2 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{p.fatherPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{p.address}</span>
              </p>
            </div>

            <div className="pt-2 border-t text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Linked Children:</span>
              <div className="flex flex-wrap gap-1">
                {p.students?.map((s: any) => (
                  <span key={s.id} className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
                    {s.fullName} ({s.class?.name} - {s.rollNo})
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
