import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const INITIAL_CHECKS = {
    supabaseUrl: { status: 'pending', message: 'Checking URL...' },
    supabaseKey: { status: 'pending', message: 'Checking Anon Key...' },
    dbConnection: { status: 'pending', message: 'Testing DB Connection...' },
    authSession: { status: 'pending', message: 'Verifying Auth State...' },
};

const EnvVerifier = () => {
    const [checks, setChecks] = useState(INITIAL_CHECKS);

    const runDiagnostics = useCallback(async () => {
        const newChecks = { ...INITIAL_CHECKS };

        // 1. Check Env Variables
        newChecks.supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            ? { status: 'pass', message: 'VITE_SUPABASE_URL is set' }
            : { status: 'fail', message: 'VITE_SUPABASE_URL is missing!' };

        newChecks.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
            ? { status: 'pass', message: 'VITE_SUPABASE_ANON_KEY is set' }
            : { status: 'fail', message: 'VITE_SUPABASE_ANON_KEY is missing!' };

        // 2. Test DB Connection (Simple select)
        try {
            const { error } = await supabase.from('admin_action_logs').select('id').limit(1);
            if (error) throw error;
            newChecks.dbConnection = { status: 'pass', message: 'Database is reachable' };
        } catch (err) {
            newChecks.dbConnection = { status: 'fail', message: `DB Error: ${err.message}` };
        }

        // 3. Check Auth
        const { data: { session } } = await supabase.auth.getSession();
        newChecks.authSession = session
            ? { status: 'pass', message: `Logged in as: ${session.user.email}` }
            : { status: 'fail', message: 'No active session found' };

        setChecks(newChecks);
    }, []);

    useEffect(() => {
        runDiagnostics();
    }, [runDiagnostics]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Environment Verifier</h2>

            <div className="space-y-4">
                {Object.entries(checks).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                        <span className="capitalize font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="flex items-center">
                            <span className={`mr-2 px-2 py-1 rounded text-xs font-bold uppercase ${value.status === 'pass' ? 'bg-green-100 text-green-700' :
                                    value.status === 'fail' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {value.status}
                            </span>
                            <span className="text-sm text-gray-600">{value.message}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={runDiagnostics}
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Re-Run Diagnostics
            </button>
        </div>
    );
};

export default EnvVerifier;