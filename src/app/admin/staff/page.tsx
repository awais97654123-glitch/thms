'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Phone, 
  Mail, 
  Award, 
  Shield, 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Briefcase, 
  DollarSign, 
  Calendar,
  Key,
  Edit3,
  Loader2,
  Users,
  Sparkles
} from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Staff Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'ACCOUNTANT',
    phone: '',
    email: '',
    address: '',
    createPortalAccount: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchStaff = () => {
    setLoading(true);
    let url = `/api/staff?role=${filterRole}`;
    if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) setStaff(data.staff);
        if (data.stats) setStats(data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, [filterRole]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setFormData({
          fullName: '',
          role: 'ACCOUNTANT',
          phone: '',
          email: '',
          address: '',
          createPortalAccount: true,
        });
        fetchStaff();
      } else {
        alert(data.error || 'Failed to add staff member');
      }
    } catch {
      alert('Error adding staff');
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
              <span>Human Resources & Operations • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Administrative & Support Staff Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Manage non-teaching faculty: chief accountants, head librarians, fleet transport supervisors, and laboratory attendants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3.5 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Staff Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Staff Registered</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{staff.length} Employees</h3>
          <p className="text-xs text-blue-600 font-bold">Operational Support</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Staff Status</span>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{stats?.activeCount ?? staff.length} Active</h3>
          <p className="text-xs text-slate-500 font-medium">Verified Campus Personnel</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-indigo-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Core Departments</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Accounts, Library, Transport</h3>
          <p className="text-xs text-indigo-600 font-bold">Dedicated Role Portals</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {['ALL', 'ACCOUNTANT', 'LIBRARIAN', 'DRIVER', 'RECEPTIONIST', 'LAB_ATTENDANT', 'SECURITY'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterRole === role
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {role.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, employee ID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStaff()}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button
            onClick={fetchStaff}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading staff directory from database...</div>
      ) : staff.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="font-bold text-sm text-slate-700">No staff members found</h4>
          <p>Add staff employees to configure accounting, library, and fleet operational roles.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 btn-blue-prestige text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add First Staff Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staff.map((s) => (
            <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 font-bold flex items-center justify-center text-base border border-blue-200">
                    {s.fullName.charAt(0)}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {s.employeeId}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{s.fullName}</h3>
                  <p className="text-xs text-blue-700 font-bold mt-0.5">{s.role.replace(/_/g, ' ')}</p>
                </div>

                <div className="space-y-1 text-xs text-slate-600 border-t pt-2.5">
                  <p className="font-mono">{s.phone}</p>
                  <p className="truncate text-slate-400">{s.email || 'No email specified'}</p>
                  <p className="text-[10px] text-slate-400">Joined: {new Date(s.joiningDate).toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/admin/users?q=${encodeURIComponent(s.employeeId)}`}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Login Info</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">HR Onboarding</span>
                <h3 className="text-lg font-black text-slate-900">Add Staff Employee</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shahid Mehmood"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ACCOUNTANT">Chief Accountant / Accounts Officer</option>
                  <option value="LIBRARIAN">Head Librarian / Library Manager</option>
                  <option value="DRIVER">Fleet Driver / Transport Supervisor</option>
                  <option value="RECEPTIONIST">Campus Front Desk Receptionist</option>
                  <option value="LAB_ATTENDANT">Science & Computer Lab Attendant</option>
                  <option value="SECURITY">Campus Security Incharge</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 333 1122334"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="staff@hayatabadmodel.edu.pk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Phase 3, Hayatabad, Peshawar"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
                <span className="text-slate-700 font-medium">Create ERP Portal Login Account</span>
                <input
                  type="checkbox"
                  checked={formData.createPortalAccount}
                  onChange={(e) => setFormData({ ...formData, createPortalAccount: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  <span>Save Staff Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
