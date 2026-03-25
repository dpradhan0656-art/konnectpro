import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ExpertRegistrationForm from '../components/forms/ExpertRegistrationForm';

export default function RegisterExpert() {
  const location = useLocation();
  const fromExpertLogin = location.state?.fromExpertLogin;
  const fromExpertMessage = location.state?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-xl bg-slate-900 p-8 rounded-[2rem] border border-teal-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="text-center mb-6">
            <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mb-1">
              Join Kshatryx Technologies
            </p>
            <h1 className="text-2xl font-black text-white">Expert Registration</h1>
          </div>

          {fromExpertLogin && (
            <div className="mb-4 p-3 bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-bold rounded-xl text-center">
              {fromExpertMessage || 'You are signed in. Complete the form below to register as an Expert.'}
            </div>
          )}

          <ExpertRegistrationForm variant="self" className="border-0 shadow-none bg-transparent p-0" />

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/expert/login" className="text-teal-400 font-bold hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
