'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Library, 
  Search, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Calendar,
  Sparkles,
  RefreshCw,
  Loader2,
  Bookmark,
  DollarSign
} from 'lucide-react';

export default function AdminLibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: 'SCIENCE',
    isbn: '',
    publisher: '',
    edition: '2026 Edition',
    totalCopies: 5,
    shelfLocation: 'Rack A-1',
  });

  const [issueForm, setIssueForm] = useState({
    borrowerType: 'STUDENT',
    studentId: '',
    teacherId: '',
    dueDate: '',
  });

  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const fetchBooks = () => {
    setLoading(true);
    let url = `/api/library?category=${filterCategory}`;
    if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.books) setBooks(data.books);
        if (data.stats) setStats(data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, [filterCategory]);

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      })
      .catch(console.error);

    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.teachers) setTeachers(data.teachers);
      })
      .catch(console.error);
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_BOOK',
          ...bookForm,
          totalCopies: parseInt(bookForm.totalCopies.toString(), 10),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddBookModal(false);
        setBookForm({
          title: '',
          author: '',
          category: 'SCIENCE',
          isbn: '',
          publisher: '',
          edition: '2026 Edition',
          totalCopies: 5,
          shelfLocation: 'Rack A-1',
        });
        fetchBooks();
      } else {
        alert(data.error || 'Failed to add book');
      }
    } catch {
      alert('Error adding book');
    } finally {
      setSaving(false);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForIssue) return;
    setSaving(true);

    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ISSUE_BOOK',
          bookId: selectedBookForIssue.id,
          studentId: issueForm.borrowerType === 'STUDENT' ? issueForm.studentId : undefined,
          teacherId: issueForm.borrowerType === 'TEACHER' ? issueForm.teacherId : undefined,
          dueDate: issueForm.dueDate || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowIssueModal(false);
        setSelectedBookForIssue(null);
        fetchBooks();
      } else {
        alert(data.error || 'Failed to issue book');
      }
    } catch {
      alert('Error issuing book');
    } finally {
      setSaving(false);
    }
  };

  const handleReturnBook = async (issueId: string) => {
    if (!confirm('Confirm return of this book copy to library inventory?')) return;

    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RETURN_BOOK',
          issueId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Book returned successfully and added back to available inventory!');
        fetchBooks();
      } else {
        alert(data.error || 'Failed to return book');
      }
    } catch {
      alert('Error returning book');
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
              <span>Campus Digital Library & Circulation • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Library Catalog & Book Circulation Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Track physical accession codes, catalog categories, shelf racks, and student/faculty issue and return circulation with overdue fine alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddBookModal(true)}
              className="px-5 py-3.5 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Catalog Titles</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalBooks ?? books.length} Titles</h3>
          <p className="text-xs text-blue-600 font-bold">Accession Catalogued</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Copies</span>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{stats?.totalAvailable ?? 45} Copies</h3>
          <p className="text-xs text-slate-500 font-medium">Ready on Library Shelves</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-amber-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Issued Books</span>
          <h3 className="text-3xl font-black text-amber-600 tracking-tight">{stats?.totalIssued ?? 0} Issued</h3>
          <p className="text-xs text-slate-500 font-medium">With Students & Teachers</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-rose-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overdue Dues</span>
          <h3 className="text-3xl font-black text-rose-600 tracking-tight">{stats?.overdueCount ?? 0} Overdue</h3>
          <p className="text-xs text-rose-600 font-bold">Fine Tracking Active</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {['ALL', 'SCIENCE', 'MATHEMATICS', 'LITERATURE', 'ISLAMIYAT', 'HISTORY', 'REFERENCE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button
            onClick={fetchBooks}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Books Catalog Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading catalog from database...</div>
      ) : books.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="font-bold text-sm text-slate-700">No books found</h4>
          <p>Add books to catalog physical accession registers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{b.title}</h3>
                      <p className="text-xs text-slate-500">By {b.author}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                    {b.accessionNo}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t pt-2.5">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <strong className="text-slate-800">{b.category}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Shelf Location:</span>
                    <strong className="text-slate-800">{b.shelfLocation || 'Main Stack'}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span>Available Copies:</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      b.availableCopies > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {b.availableCopies} / {b.totalCopies} Available
                    </span>
                  </div>
                </div>

                {/* Active Issues for this book */}
                {b.issues && b.issues.length > 0 && (
                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Active Borrowers:</span>
                    {b.issues.map((iss: any) => (
                      <div key={iss.id} className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{iss.student?.fullName || iss.teacher?.fullName}</span>
                        <button
                          onClick={() => handleReturnBook(iss.id)}
                          className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded"
                        >
                          Return Book
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  disabled={b.availableCopies <= 0}
                  onClick={() => {
                    setSelectedBookForIssue(b);
                    setShowIssueModal(true);
                  }}
                  className="w-full py-2 btn-blue-prestige disabled:opacity-50 text-white font-bold text-xs rounded-xl text-center shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Issue This Book</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Add New Book */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Catalog Entry</span>
                <h3 className="text-lg font-black text-slate-900">Add Book to Library</h3>
              </div>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Concepts of Physics"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Beiser"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="SCIENCE">Science</option>
                    <option value="MATHEMATICS">Mathematics</option>
                    <option value="LITERATURE">Literature</option>
                    <option value="ISLAMIYAT">Islamiyat</option>
                    <option value="HISTORY">History</option>
                    <option value="REFERENCE">Reference</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Copies *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shelf Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Stack 2, Shelf B"
                    value={bookForm.shelfLocation}
                    onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISBN Number</label>
                  <input
                    type="text"
                    placeholder="978-0-123456-78-9"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
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
                  <span>Save Catalog Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Issue Book */}
      {showIssueModal && selectedBookForIssue && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Circulation Desk</span>
                <h3 className="text-lg font-black text-slate-900">Issue Book to Scholar</h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs space-y-1">
              <strong className="text-slate-900 block text-sm">{selectedBookForIssue.title}</strong>
              <p className="text-slate-600">Accession: <span className="font-mono font-bold text-blue-900">{selectedBookForIssue.accessionNo}</span> • Copies: {selectedBookForIssue.availableCopies} available</p>
            </div>

            <form onSubmit={handleIssueBook} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Borrower Category *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIssueForm({ ...issueForm, borrowerType: 'STUDENT' })}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                      issueForm.borrowerType === 'STUDENT' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Student Scholar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueForm({ ...issueForm, borrowerType: 'TEACHER' })}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                      issueForm.borrowerType === 'TEACHER' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Faculty Member
                  </button>
                </div>
              </div>

              {issueForm.borrowerType === 'STUDENT' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
                  <select
                    required
                    value={issueForm.studentId}
                    onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
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
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Teacher *</label>
                  <select
                    required
                    value={issueForm.teacherId}
                    onChange={(e) => setIssueForm({ ...issueForm, teacherId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Faculty Teacher...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Return Due Date</label>
                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
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
                  <span>Issue Book</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
