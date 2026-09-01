'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bus, 
  MapPin, 
  Phone, 
  User, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign,
  Sparkles,
  RefreshCw,
  Loader2,
  Navigation
} from 'lucide-react';

export default function AdminTransportPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  // Modals
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRouteForAssign, setSelectedRouteForAssign] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Forms
  const [routeForm, setRouteForm] = useState({
    routeName: '',
    startPoint: '',
    endPoint: 'The Hayatabad Model School Campus',
    monthlyFee: 3500,
    vehicleId: '',
    stopsInput: 'Tatara Park (07:15 AM), Zarghoni Chowk (07:30 AM), Phase 3 Roundabout (07:45 AM)',
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNo: '',
    model: 'Toyota Coaster 2024 (AC)',
    capacity: 32,
    driverName: '',
    driverPhone: '',
    helperName: '',
    helperPhone: '',
  });

  const [assignForm, setAssignForm] = useState({
    studentId: '',
  });

  const fetchTransport = () => {
    setLoading(true);
    fetch('/api/transport')
      .then((res) => res.json())
      .then((data) => {
        if (data.routes) setRoutes(data.routes);
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.stats) setStats(data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransport();
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      })
      .catch(console.error);
  }, []);

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const stops = routeForm.stopsInput.split(',').map((s) => {
        const parts = s.trim().split('(');
        const name = parts[0].trim();
        const time = parts[1] ? parts[1].replace(')', '').trim() : '07:30 AM';
        return { stopName: name, pickupTime: time, dropTime: '02:30 PM' };
      }).filter((s) => s.stopName);

      const res = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_ROUTE',
          routeName: routeForm.routeName,
          startPoint: routeForm.startPoint,
          endPoint: routeForm.endPoint,
          monthlyFee: parseFloat(routeForm.monthlyFee.toString()),
          vehicleId: routeForm.vehicleId || undefined,
          stops,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddRouteModal(false);
        setRouteForm({
          routeName: '',
          startPoint: '',
          endPoint: 'The Hayatabad Model School Campus',
          monthlyFee: 3500,
          vehicleId: '',
          stopsInput: 'Tatara Park (07:15 AM), Zarghoni Chowk (07:30 AM), Phase 3 Roundabout (07:45 AM)',
        });
        fetchTransport();
      } else {
        alert(data.error || 'Failed to add route');
      }
    } catch {
      alert('Error adding route');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_VEHICLE',
          ...vehicleForm,
          capacity: parseInt(vehicleForm.capacity.toString(), 10) || 30,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddVehicleModal(false);
        setVehicleForm({
          vehicleNo: '',
          model: 'Toyota Coaster 2024 (AC)',
          capacity: 32,
          driverName: '',
          driverPhone: '',
          helperName: '',
          helperPhone: '',
        });
        fetchTransport();
      } else {
        alert(data.error || 'Failed to add vehicle');
      }
    } catch {
      alert('Error adding vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteForAssign || !assignForm.studentId) return;
    setSaving(true);

    try {
      const res = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_STUDENT',
          routeId: selectedRouteForAssign.id,
          studentId: assignForm.studentId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAssignModal(false);
        fetchTransport();
      } else {
        alert(data.error || 'Failed to assign student');
      }
    } catch {
      alert('Error assigning student to transport');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Top Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] text-white p-8 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Campus Fleet & Transport Network • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Transport Fleet, Routes & Passenger Roster
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Manage Toyota Coaster fleet vehicles, driver contacts, morning pickup stops, and student passenger allotments with automated fee billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Bus className="w-4 h-4 text-blue-400" />
              <span>+ Add Fleet Vehicle</span>
            </button>
            <button
              onClick={() => setShowAddRouteModal(true)}
              className="px-5 py-3.5 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Transport Route</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Routes</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalRoutes ?? routes.length} Routes</h3>
          <p className="text-xs text-blue-600 font-bold">Peshawar Metro Area</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fleet Vehicles</span>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{stats?.totalVehicles ?? vehicles.length} Coasters</h3>
          <p className="text-xs text-slate-500 font-medium">Air Conditioned Buses</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-indigo-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Commuters</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalStudentsOnTransport ?? 0} Students</h3>
          <p className="text-xs text-indigo-600 font-bold">Assigned Daily Riders</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-amber-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fleet Safety</span>
          <h3 className="text-3xl font-black text-amber-600 tracking-tight">100% Tracked</h3>
          <p className="text-xs text-slate-500 font-medium">Supervisor Onboard</p>
        </div>
      </div>

      {/* Routes Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading routes and vehicles...</div>
      ) : routes.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 space-y-3">
          <Bus className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="font-bold text-sm text-slate-700">No transport routes configured</h4>
          <p>Create routes and assign vehicles for student daily commute.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{r.routeName}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Vehicle: <strong className="text-slate-800">{r.vehicle?.vehicleNo || 'PST-Coaster'}</strong> ({r.vehicle?.model || 'Toyota Coaster'})
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    Rs. {r.monthlyFee}/mo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <p>Driver: <strong className="text-slate-900">{r.vehicle?.driverName || 'Designated Driver'}</strong> ({r.vehicle?.driverPhone || '+92 344 7711223'})</p>
                  <p>Capacity: <strong className="text-slate-900">{r.vehicle?.capacity || 32} Seats</strong> ({r.students?.length || 0} Assigned)</p>
                </div>

                {/* Stops */}
                <div className="space-y-1.5 pt-2 border-t text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Route Stops & Timings:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {r.stops?.map((st: any) => (
                      <div key={st.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold text-slate-800 text-[11px]">{st.stopName}</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-blue-900">
                          {st.pickupTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Passengers list */}
                {r.students && r.students.length > 0 && (
                  <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-blue-900 block">Assigned Student Riders ({r.students.length}):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.students.map((st: any) => (
                        <span key={st.id} className="px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-slate-800 font-medium text-[11px]">
                          {st.student?.fullName} ({st.student?.studentId})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRouteForAssign(r);
                    setShowAssignModal(true);
                  }}
                  className="w-full py-2 btn-blue-prestige text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Assign Student to This Route</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Add Route */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Fleet Logistics</span>
                <h3 className="text-lg font-black text-slate-900">Add Transport Route</h3>
              </div>
              <button
                onClick={() => setShowAddRouteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRoute} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Route Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Route 3: Phase 6 & 7 Hayatabad to Campus"
                  value={routeForm.routeName}
                  onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Start Origin Point *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 7 Sector D-4 Roundabout"
                  value={routeForm.startPoint}
                  onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Fare (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={routeForm.monthlyFee}
                    onChange={(e) => setRouteForm({ ...routeForm, monthlyFee: parseFloat(e.target.value) || 3500 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Coaster</label>
                  <select
                    value={routeForm.vehicleId}
                    onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Fleet Vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNo} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stops & Morning Timings (Comma separated)</label>
                <textarea
                  rows={3}
                  value={routeForm.stopsInput}
                  onChange={(e) => setRouteForm({ ...routeForm, stopsInput: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl btn-blue-prestige text-white font-bold shadow flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Route</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Vehicle */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Fleet Registration</span>
                <h3 className="text-lg font-black text-slate-900">Add Fleet Vehicle</h3>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Registration # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PST-4821"
                    value={vehicleForm.vehicleNo}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seating Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: parseInt(e.target.value, 10) || 30 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Make & Model *</label>
                <input
                  type="text"
                  required
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sher Afzal Khan"
                    value={vehicleForm.driverName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driver Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 344 7711223"
                    value={vehicleForm.driverPhone}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl btn-blue-prestige text-white font-bold shadow flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Assign Student */}
      {showAssignModal && selectedRouteForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Passenger Allotment</span>
                <h3 className="text-lg font-black text-slate-900">Assign Student to Route</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs space-y-1">
              <strong className="text-slate-900 block text-sm">{selectedRouteForAssign.routeName}</strong>
              <p className="text-slate-600">Fare: <span className="font-bold text-emerald-700">Rs. {selectedRouteForAssign.monthlyFee}/month</span></p>
            </div>

            <form onSubmit={handleAssignStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
                <select
                  required
                  value={assignForm.studentId}
                  onChange={(e) => setAssignForm({ studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Enrolled Student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentId} - {s.class?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl btn-blue-prestige text-white font-bold shadow flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Route Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
