import React, { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { servicesData } from '../../../data/servicesData';
import { syncServicesFromData } from '../../../utils/syncServiceData';
import { Database, Play, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Co-Founder / developer utility: bulk sync catalog from `src/data/servicesData.js`.
 * Does not replace Category Master or Rate List — those UIs remain unchanged.
 */
export default function DeveloperToolsTab() {
  const [running, setRunning] = useState(false);
  const [logLines, setLogLines] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const appendLog = useCallback((line) => {
    setLogLines((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  }, []);

  const handleSync = async () => {
    if (
      !window.confirm(
        'Run catalog sync from servicesData.js?\n\nUses Supabase upsert (onConflict: slug for categories; name+category or name for services). Names are trimmed; existing rows update instead of failing on duplicates.'
      )
    ) {
      return;
    }

    setRunning(true);
    setLogLines([]);
    setLastResult(null);
    appendLog('Starting sync…');

    try {
      const result = await syncServicesFromData(supabase, servicesData, {
        onProgress: (msg) => appendLog(msg),
      });
      setLastResult(result);

      if (result.errors.length > 0) {
        appendLog('Completed with errors:');
        result.errors.forEach((e) => appendLog(`  ⚠ ${e}`));
      } else {
        appendLog('Completed successfully.');
      }

      appendLog(
        `Summary — categories synced: ${result.categoriesSynced ?? result.categoriesUpdated}, services synced: ${result.servicesSynced ?? result.servicesUpdated}`
      );
    } catch (e) {
      appendLog(`Fatal: ${e?.message || e}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-3xl">
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Database className="text-teal-500" size={28} />
          Developer Tools
        </h2>
        <p className="text-slate-400 text-xs">
          Internal utilities for Kshatryx Technologies — not shown to end customers.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3">
        <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-amber-100/90 leading-relaxed">
          <p className="font-bold uppercase tracking-widest text-[10px] text-amber-400 mb-1">
            Before you sync
          </p>
          <ul className="list-disc list-inside space-y-1 text-amber-50/90">
            <li>Edit the centralized file <code className="text-amber-200">src/data/servicesData.js</code> first.</li>
            <li>Sync uses admin RLS — you must be logged in as an app admin.</li>
            <li>
              Services are matched by <strong>name + category</strong> to avoid duplicate rows.{' '}
              <code className="text-amber-200">service_cities</code> is set to{' '}
              <code className="text-amber-200">[&apos;all&apos;]</code> for state-wide visibility.
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-teal-400 flex items-center gap-2">
          <Play size={16} />
          Catalog auto-sync
        </h3>
        <p className="text-xs text-slate-400">
          Reads <code className="text-slate-300">servicesData.js</code> and upserts into{' '}
          <code className="text-slate-300">categories</code> and <code className="text-slate-300">services</code>.
        </p>

        <button
          type="button"
          onClick={handleSync}
          disabled={running}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3 uppercase tracking-widest transition-colors"
        >
          {running ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Syncing…
            </>
          ) : (
            <>
              <Database size={18} />
              Sync catalog from servicesData.js
            </>
          )}
        </button>

        {lastResult && !running && lastResult.errors.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-teal-400 font-bold">
            <CheckCircle size={18} /> Last run finished without blocking errors.
          </p>
        )}

        {logLines.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Log</p>
            <pre className="text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-72 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
              {logLines.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
