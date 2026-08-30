'use client';

import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setItems(data.items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Assets & Supplies
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            School Assets, Lab Equipment & Stationery Inventory
          </h1>
          <p className="text-xs text-slate-500">
            Track high-value lab microscopes, computer hardware, furniture, and stationery stock balances.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{it.name}</h3>
                <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 px-1.5 py-0.2 rounded border">
                  {it.itemCode}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 border-t pt-2">
              <div className="flex justify-between">
                <span>Category:</span>
                <strong className="text-slate-800">{it.category}</strong>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <strong className="text-slate-800">{it.location || 'Campus Store'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Stock Quantity:</span>
                <strong className="text-emerald-700 font-bold text-sm">
                  {it.quantity} {it.unit}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Unit Price:</span>
                <strong className="font-mono text-slate-900">Rs. {it.unitPrice?.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
