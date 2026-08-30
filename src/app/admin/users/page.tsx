'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Key, 
  Search, 
  Filter, 
  UserCheck, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Edit3, 
  Sparkles,
  Eye,
  EyeOff,
  ArrowLeft,
  Share2
} from 'lucide-react';

interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  displayName: string;
  extraInfo: string;
  lastLoginAt?: string;
  createdAt: string;
}

export default function AdminUserCredentialsPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals state
  const [passwordModalUser, setPasswordModalUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [editModalUser, setEditModalUser] = useState<UserAccount | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [savingEdit, setSavingEdit] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    let url = `/api/admin/users/credentials?role=${selectedRole}`;
    if (searchQuery.trim()) {
      url += `&q=${encodeURIComponent(searchQuery.trim())}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setUsers(data.users);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Thms@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword) return;

    setSavingPassword(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordModalUser.id,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Password for ${passwordModalUser.displayName} updated successfully!`, type: 'success' });
        setPasswordModalUser(null);
        setNewPassword('');
        fetchUsers();
      } else {
        setMessage({ text: data.error || 'Failed to update password', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error while updating password', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;

    setSavingEdit(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editModalUser.id,
          newUsername: editUsername.trim(),
          newEmail: editEmail.trim() === 'None' ? '' : editEmail.trim(),
          newStatus: editStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Account details for ${editModalUser.displayName} updated!`, type: 'success' });
        setEditModalUser(null);
        fetchUsers();
      } else {
        setMessage({ text: data.error || 'Failed to update account', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error while updating account details', type: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">Admin</span>;
      case 'TEACHER':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">Teacher</span>;
      case 'STUDENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">Student</span>;
      case 'PARENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">Parent</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span>/</span>
            <span className="text-blue-600 font-bold">User Credentials & Passwords</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-amber-500" />
            <span>Login & Password Manager</span>
          </h1>
          <p className="text-xs text-slate-500">
            View, edit login Gmail / emails, change usernames, and reset passwords for Students, Faculty, Parents, and Admins.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Flash Alert */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All Accounts' },
            { id: 'STUDENT', label: 'Students' },
            { id: 'TEACHER', label: 'Teachers' },
            { id: 'PARENT', label: 'Parents' },
            { id: 'ADMIN', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedRole === tab.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID, Gmail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            Registered Accounts ({users.length})
          </span>
          <span className="text-slate-500">
            Click &quot;Change Password&quot; or &quot;Edit Details&quot; to modify credentials
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">User / Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Login Username / ID</th>
                <th className="py-3 px-4">Login Gmail / Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Credential Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Loading user accounts from database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shadow-inner">
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-slate-900 block leading-tight">{u.displayName}</strong>
                          <span className="text-[10px] text-slate-500 block">{u.extraInfo || 'Direct Account'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {getRoleBadge(u.role)}
                    </td>

                    {/* Username with Copy */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                          {u.username}
                        </code>
                        <button
                          onClick={() => copyToClipboard(u.username, `user-${u.id}`)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy Username"
                        >
                          {copiedField === `user-${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Email with Copy */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] ${u.email === 'None' ? 'text-slate-400 italic' : 'text-slate-700 font-medium'}`}>
                          {u.email}
                        </span>
                        {u.email !== 'None' && (
                          <button
                            onClick={() => copyToClipboard(u.email, `email-${u.id}`)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copy Email"
                          >
                            {copiedField === `email-${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span>{u.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPasswordModalUser(u);
                            setNewPassword('');
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition-all"
                        >
                          <Key className="w-3 h-3" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditModalUser(u);
                            setEditUsername(u.username);
                            setEditEmail(u.email === 'None' ? '' : u.email);
                            setEditStatus(u.status);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Reset / Change Password */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Reset Account Password</span>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Target User:</span>
                <strong className="text-slate-900">{passwordModalUser.displayName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Username:</span>
                <code className="font-mono font-bold text-blue-900">{passwordModalUser.username}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="font-bold text-purple-800">{passwordModalUser.role}</span>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                  <span className="text-blue-900 font-medium">Ready to share:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `*THE HAYATABAD MODEL SCHOOL — PASSWORD RESET*\nName: ${passwordModalUser.displayName}\nUsername: ${passwordModalUser.username}\nNew Password: ${newPassword}\nPortal Link: http://localhost:3000/login`;
                      navigator.clipboard.writeText(text);
                      alert('Login details copied to clipboard!');
                    }}
                    className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700"
                  >
                    📱 Copy for WhatsApp
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  {savingPassword ? <span>Saving...</span> : <span>Update Password</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Username & Gmail / Email */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Edit Login Username & Email</span>
              </div>
              <button
                onClick={() => setEditModalUser(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Login Username / Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Login Gmail / Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. user@gmail.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="ACTIVE">ACTIVE (Allowed to login)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily blocked)</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  {savingEdit ? <span>Saving...</span> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
