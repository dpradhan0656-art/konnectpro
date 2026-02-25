import React, { useEffect, useState } from 'react';
import { supabase } from "../../../lib/supabase";
import { CreditCard, CheckCircle, Clock, Loader2, IndianRupee, History } from 'lucide-react';

export default function WalletManager() {
  // States
  const [requests, setRequests] = useState([]);
  const [experts, setExperts] = useState([]);
  const [areaHeads, setAreaHeads] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Manual Form States
  const [selectedUser, setSelectedUser] = useState(''); // Format: "type|id"
  const [amount, setAmount] = useState('');
  const [actionType, setActionType] = useState('credit');
  const [desc, setDesc] = useState('');

  useEffect(() => { fetchAllWalletData(); }, []);

  const fetchAllWalletData = async () => {
    setLoading(true);
    
    // 1. Fetch Withdraw Requests
    const { data: reqData } = await supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false });
    if (reqData) setRequests(reqData);

    // 2. Fetch Experts Balances
    const { data: eData } = await supabase.from('experts').select('id, name, phone, wallet_balance');
    if (eData) setExperts(eData);

    // 3. Fetch Area Heads Balances
    const { data: aData } = await supabase.from('area_heads').select('id, name, wallet_balance');
    if (aData) setAreaHeads(aData);

    // 4. Fetch Ledger (Passbook)
    const { data: tData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(30);
    if (tData) setTransactions(tData);

    setLoading(false);
  };

  // ✅ APPROVE WITHDRAWAL REQUEST
  const handleApprove = async (req) => {
    const confirmApprove = window.confirm(`Approve ₹${req.amount} for ${req.user_name}?`);
    if (!confirmApprove) return;

    setProcessingId(req.id);
    try {
        await supabase.from('withdrawal_requests').update({ status: 'approved' }).eq('id', req.id);
        
        const table = req.user_type === 'expert' ? 'experts' : 'area_heads';
        const { data: userData } = await supabase.from(table).select('wallet_balance, id').eq('user_id', req.user_id).single();

        if (userData) {
            const newBalance = parseFloat(userData.wallet_balance || 0) - parseFloat(req.amount);
            await supabase.from(table).update({ wallet_balance: newBalance }).eq('id', userData.id);
            
            await supabase.from('transactions').insert({
                user_type: req.user_type, user_id: userData.id,
                amount: req.amount, transaction_type: 'debit',
                description: `Bank Withdrawal to ${req.payment_method} (${req.payment_details})`
            });
        }
        alert("✅ Payment Approved!");
        fetchAllWalletData();
    } catch (error) {
        alert("Error approving request!");
    } finally {
        setProcessingId(null);
    }
  };

  // 💰 MANUAL RECHARGE / PENALTY
  const handleManualTransaction = async (e) => {
      e.preventDefault();
      if (!selectedUser || !amount) return alert("Select user and enter amount!");

      setProcessingId('manual');
      const [type, id] = selectedUser.split('|'); // Split 'expert|id'
      const amt = parseFloat(amount);
      const table = type === 'expert' ? 'experts' : 'area_heads';
      
      const userList = type === 'expert' ? experts : areaHeads;
      const user = userList.find(u => u.id === id);
      
      if(!user) return;

      let newBalance = parseFloat(user.wallet_balance || 0);
      if (actionType === 'credit') newBalance += amt;
      else newBalance -= amt;

      try {
          // 1. Update Balance
          await supabase.from(table).update({ wallet_balance: newBalance }).eq('id', id);

          // 2. Add to Transactions Ledger
          await supabase.from('transactions').insert({
              user_type: type,
              user_id: id,
              amount: amt,
              transaction_type: actionType,
              description: desc || `Manual ${actionType} by Admin`
          });

          alert(`✅ Wallet Updated! New Balance: ₹${newBalance}`);
          setAmount(''); setDesc(''); setSelectedUser('');
          fetchAllWalletData();
      } catch (err) {
          alert("Transaction Failed!");
      } finally {
          setProcessingId(null);
      }
  };

  if (loading) return <div className="text-teal-500 flex justify-center py-20"><Loader2 className="animate-spin" size={40}/></div>;

  const pendingReqs = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-[2rem] border border-teal-500/30 shadow-xl">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2"><IndianRupee className="text-teal-500"/> HQ Finance Ops</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Manage payouts, penalties, and ledger</p>
        </div>
        <button onClick={fetchAllWalletData} className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-slate-300 font-bold transition-colors">Refresh All</button>
      </div>

      {/* ⚠️ PENDING WITHDRAWALS (ACTION REQUIRED) */}
      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mt-8"><Clock size={16} className="text-amber-500"/> Payout Requests ({pendingReqs.length})</h3>
      <div className="grid gap-4">
          {pendingReqs.length === 0 ? (
              <div className="text-center py-6 text-slate-500 bg-slate-900 rounded-3xl border border-slate-800 text-xs font-bold uppercase tracking-widest">No pending requests.</div>
          ) : pendingReqs.map(req => (
              <div key={req.id} className="bg-slate-900 p-5 rounded-[2rem] border border-amber-500/30 flex justify-between items-center shadow-lg relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-500"></div>
                  <div className="pl-2">
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded font-black uppercase tracking-widest">{req.user_type}</span>
                      <h4 className="text-lg font-black text-white mt-2">{req.user_name}</h4>
                      <p className="text-xs text-slate-400 mt-1"><span className="text-slate-500">To:</span> {req.payment_method} - <span className="text-teal-400 font-mono">{req.payment_details}</span></p>
                  </div>
                  <div className="text-right">
                      <p className="text-2xl font-black text-white mb-3">₹{req.amount}</p>
                      <button onClick={() => handleApprove(req)} disabled={processingId === req.id} className="bg-green-500 hover:bg-green-400 text-slate-900 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 transition-all shadow-md">
                          {processingId === req.id ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>} Pay & Approve
                      </button>
                  </div>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* 💰 LEFT: MANUAL ADD/CUT FORM */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
             <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6"><CreditCard size={16} className="text-blue-500"/> Manual Adjustment</h3>
             <form onSubmit={handleManualTransaction} className="space-y-4">
                 <div>
                     <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Select Partner / Manager</label>
                     <select required value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none focus:border-teal-500 font-medium">
                         <option value="">-- Choose User --</option>
                         <optgroup label="Ground Experts">
                            {experts.map(ex => <option key={ex.id} value={`expert|${ex.id}`}>{ex.name} (Bal: ₹{ex.wallet_balance || 0})</option>)}
                         </optgroup>
                         <optgroup label="Area Commanders">
                            {areaHeads.map(ah => <option key={ah.id} value={`area_head|${ah.id}`}>{ah.name} (Bal: ₹{ah.wallet_balance || 0})</option>)}
                         </optgroup>
                     </select>
                 </div>
                 <div className="flex gap-4">
                     <div className="flex-1">
                         <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Amount (₹)</label>
                         <input type="number" required min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none focus:border-teal-500 font-black" placeholder="500" />
                     </div>
                     <div className="flex-1">
                         <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Action Type</label>
                         <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none font-bold">
                             <option value="credit">Bonus / Add (+)</option>
                             <option value="debit">Penalty / Cut (-)</option>
                         </select>
                     </div>
                 </div>
                 <div>
                     <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Reason (Optional)</label>
                     <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none focus:border-teal-500 text-sm" placeholder="e.g. Penalty for late arrival" />
                 </div>
                 <button type="submit" disabled={processingId === 'manual'} className={`w-full py-4 mt-2 rounded-xl font-black uppercase tracking-widest text-white shadow-lg transition-all flex justify-center items-center gap-2 ${actionType === 'credit' ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/50' : 'bg-red-600 hover:bg-red-500 shadow-red-900/50'}`}>
                     {processingId === 'manual' ? <Loader2 size={18} className="animate-spin"/> : actionType === 'credit' ? 'Add Funds' : 'Deduct Funds'}
                 </button>
             </form>
          </div>

          {/* 📊 RIGHT: CURRENT BALANCES LIST */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col h-[420px]">
             <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Live Balances</h3>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                 {/* Area Heads Section */}
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2 border-b border-slate-800 pb-1">Area Commanders</div>
                 {areaHeads.map(ah => (
                     <div key={ah.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-2xl border border-slate-800/50">
                         <div>
                             <p className="font-bold text-white text-sm">{ah.name}</p>
                             <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">Manager</span>
                         </div>
                         <div className={`text-lg font-black ${ah.wallet_balance < 0 ? 'text-red-500' : 'text-green-500'}`}>₹{ah.wallet_balance || 0}</div>
                     </div>
                 ))}

                 {/* Experts Section */}
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4 border-b border-slate-800 pb-1">Ground Experts</div>
                 {experts.map(ex => (
                     <div key={ex.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-2xl border border-slate-800/50">
                         <div>
                             <p className="font-bold text-white text-sm">{ex.name}</p>
                             <p className="text-[10px] text-slate-500">{ex.phone}</p>
                         </div>
                         <div className={`text-lg font-black ${ex.wallet_balance < 0 ? 'text-red-500' : 'text-green-500'}`}>₹{ex.wallet_balance || 0}</div>
                     </div>
                 ))}
             </div>
          </div>
      </div>

      {/* 🧾 BOTTOM: TRANSACTIONS LEDGER */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden mt-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6"><History size={16} className="text-teal-500"/> System Ledger (Passbook)</h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase font-black">
                      <tr>
                          <th className="p-4 rounded-l-2xl">Date / Time</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Description</th>
                          <th className="p-4 text-right rounded-r-2xl">Amount</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                      {transactions.map(txn => (
                          <tr key={txn.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="p-4 text-xs font-medium text-slate-400">{new Date(txn.created_at).toLocaleString()}</td>
                              <td className="p-4">
                                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">{txn.user_type}</span>
                              </td>
                              <td className="p-4">
                                  <span className="text-xs font-bold text-white">{txn.description}</span>
                                  {txn.booking_id && <span className="block text-[10px] text-teal-500 mt-1">Booking Ref: #{txn.booking_id}</span>}
                              </td>
                              <td className={`p-4 text-right font-black text-lg ${txn.transaction_type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                  {txn.transaction_type === 'credit' ? '+' : '-'}₹{txn.amount}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}