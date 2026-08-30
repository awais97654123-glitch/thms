'use client';

import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Phone, User, Plus } from 'lucide-react';

export default function AdminTransportPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transport')
      .then((res) => res.json())
      .then((data) => {
        if (data.routes) setRoutes(data.routes);
        if (data.vehicles) setVehicles(data.vehicles);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Logistics & Fleet
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Transport Fleet, Routes & Stops
          </h1>
          <p className="text-xs text-slate-500">
            Manage Toyota Coaster AC fleet, driver assignments, pickup/drop timings, and passenger lists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((r) => (
          <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{r.routeName}</h3>
                  <p className="text-xs text-slate-500">
                    Vehicle: <strong>{r.vehicle?.vehicleNo}</strong> ({r.vehicle?.model})
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                Rs. {r.monthlyFee}/mo
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>Driver: <strong>{r.vehicle?.driverName}</strong> ({r.vehicle?.driverPhone})</p>
              <p>Capacity: <strong>{r.vehicle?.capacity} Passengers</strong></p>
            </div>

            {/* Stops list */}
            <div className="space-y-1.5 pt-2 border-t text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Route Stops & Morning Timings:
              </span>
              {r.stops?.map((st: any) => (
                <div key={st.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-slate-800">{st.stopName}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-blue-900">
                    {st.pickupTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
