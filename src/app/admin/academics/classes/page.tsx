'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Users, BookOpen, UserCheck, Plus } from 'lucide-react';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Academics Structure
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Classes, Sections & Subjects
          </h1>
          <p className="text-xs text-slate-500">
            Configure academic hierarchy from Nursery to Class 10 with section allocations and class teachers.
          </p>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">No classes configured yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Initialize your academic grade hierarchy from Nursery through Class 10 using the setup wizard.
            </p>
          </div>
          <a
            href="/admin/setup"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all inline-block"
          >
            Launch Setup Wizard
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    {c.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <span className="text-[10px] text-slate-500">{c._count?.students || 0} Enrolled Students</span>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sections:</span>
                <div className="space-y-1.5 text-xs">
                  {c.sections?.map((sec: any) => (
                    <div key={sec.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900">{sec.name}</strong>
                        <p className="text-[10px] text-slate-500">
                          Class Teacher: {sec.classTeacher?.fullName || 'Assigned Staff'} • {sec.roomNo || 'Room'}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-slate-600 font-bold bg-white px-2 py-0.5 rounded border">
                        {sec._count?.students || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              <div className="pt-2 border-t text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subjects ({c.subjects?.length || 0}):</span>
                <div className="flex flex-wrap gap-1">
                  {c.subjects?.map((sub: any) => (
                    <span key={sub.id} className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 text-[10px] font-semibold">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
