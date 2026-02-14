import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Wallet, ArrowUpRight, ArrowDownLeft, Save } from 'lucide-react';

export default function WalletManager() {
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('credit'); // credit or debit
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      const getExperts = async () => {
          const { data } = await supabase.from('experts').select('id, name, wallet_balance');
          if(data) setExperts(data);
      };
      getExperts();
  }, []);

  const handleTransaction = async () => {
      if(!selectedExpert || !amount) return alert("⚠️ Select Expert & Amount");
      
      setLoading(true);

      // ✅ FIX: No parseInt (UUID support)
      const expert = experts.find(e => e.id === selectedExpert);
      
      if (!expert) {
          alert("❌ Expert not found!");
          setLoading(false);
          return;
      }

      const currentBal = parseFloat(expert.wallet_balance) || 0;
      const finalAmount = parseFloat(amount);
      
      // Calculate New Balance
      const newBal = type === 'credit' ? currentBal + finalAmount : currentBal - finalAmount;

      // 1. Update Expert Balance
      const { error: updateError } = await supabase
        .from('experts')
        .update({ wallet_balance: newBal })
        .eq('id', expert.id);

      if (updateError) {
          alert("Error updating balance: " + updateError.message);
          setLoading(false);
          return;
      }

      // 2. Log Transaction
      const { error: logError } = await supabase.from('transactions').insert([{
          expert_id: expert.id,
          amount: finalAmount,
          type: type,
          description: reason || (type === 'credit' ? 'Bonus/Recharge' : 'Penalty/Deduction')
      }]);

      if (logError) {
          console.error("Transaction Log Error:", logError);
      }

      alert(`✅ Wallet Updated! New Balance: ₹${newBal}`);
      setAmount(''); 
      setReason('');
      setLoading(false);
      
      // Refresh logic without reload
      // (Better User Experience)
      const { data } = await supabase.from('experts').select('id, name, wallet_balance');
      if(data) setExperts(data);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="text-green-500" /> Wallet Manager
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Transaction Form */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-slate-400 font-bold uppercase text-xs mb-4">Process Transaction</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1">Select Expert</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none cursor-pointer focus:border-green-500" 
                            onChange={e => setSelectedExpert(e.target.value)}
                            value={selectedExpert}
                        >
                            <option value="">-- Choose Expert --</option>
                            {experts.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.name} (Bal: ₹{e.wallet_balance || 0})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 font-bold ml-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                placeholder="0.00"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none font-bold focus:border-green-500" 
                                value={amount} 
                                onChange={e=>setAmount(e.target.value)} 
                            />
                        </div>
                        <div>
                             <label className="text-xs text-slate-500 font-bold ml-1">Action Type</label>
                             <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-700">
                                 <button onClick={()=>setType('credit')} className={`flex-1 rounded-lg text-xs font-bold py-2 transition-all ${type==='credit' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Credit (+)</button>
                                 <button onClick={()=>setType('debit')} className={`flex-1 rounded-lg text-xs font-bold py-2 transition-all ${type==='debit' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Debit (-)</button>
                             </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1">Reason / Note</label>
                        <input 
                            type="text" 
                            placeholder={type === 'credit' ? "e.g. Bonus for good work" : "e.g. Penalty for late arrival"} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-green-500" 
                            value={reason} 
                            onChange={e=>setReason(e.target.value)} 
                        />
                    </div>

                    <button 
                        onClick={handleTransaction} 
                        disabled={loading}
                        className={`w-full font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${loading ? 'bg-slate-700 text-slate-400' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50'}`}
                    >
                        {loading ? 'Processing...' : <><Save size={18}/> Process Transaction</>}
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
                <div className="bg-green-900/10 p-6 rounded-2xl border border-green-500/20 hover:bg-green-900/20 transition-colors">
                    <h4 className="text-green-500 font-bold flex items-center gap-2"><ArrowUpRight/> Total Credits</h4>
                    <p className="text-3xl font-black text-white mt-2">Live System</p>
                    <p className="text-xs text-green-400 mt-1">Wallet Recharges & Bonuses</p>
                </div>
                <div className="bg-red-900/10 p-6 rounded-2xl border border-red-500/20 hover:bg-red-900/20 transition-colors">
                    <h4 className="text-red-500 font-bold flex items-center gap-2"><ArrowDownLeft/> Total Debits</h4>
                    <p className="text-3xl font-black text-white mt-2">Active</p>
                    <p className="text-xs text-red-400 mt-1">Penalties & Commissions</p>
                </div>
            </div>
        </div>
    </div>
  );
}