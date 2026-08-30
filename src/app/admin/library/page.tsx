'use client';

import React, { useState, useEffect } from 'react';
import { Library, Search, BookOpen, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminLibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/library')
      .then((res) => res.json())
      .then((data) => {
        if (data.books) setBooks(data.books);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Campus Library System
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Book Catalog & Circulation Tracker
          </h1>
          <p className="text-xs text-slate-500">
            Manage physical book inventory, categories, shelf locations, and issue/return ledger.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((b) => (
          <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{b.title}</h3>
                <p className="text-xs text-slate-500">Author: {b.author}</p>
                <span className="text-[10px] font-mono text-indigo-800 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border">
                  {b.accessionNo}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 border-t pt-2">
              <div className="flex justify-between">
                <span>Category:</span>
                <strong className="text-slate-800">{b.category}</strong>
              </div>
              <div className="flex justify-between">
                <span>Shelf Location:</span>
                <strong className="text-slate-800">{b.shelfLocation}</strong>
              </div>
              <div className="flex justify-between">
                <span>Copies Available:</span>
                <strong className="text-emerald-700 font-bold">{b.availableCopies} / {b.totalCopies}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
