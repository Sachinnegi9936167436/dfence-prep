'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, RefreshCw, CheckCircle, XCircle, Trash2, Users, Pencil, X } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // User Management State Map
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newSubStatus, setNewSubStatus] = useState('inactive');
  const [addingUser, setAddingUser] = useState(false);
  const [userError, setUserError] = useState('');

  // Edit User State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editSubStatus, setEditSubStatus] = useState('inactive');
  const [editPassword, setEditPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setUserError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, name: newName, password: newPassword, role: newRole, subscriptionStatus: newSubStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
        setNewEmail(''); setNewName(''); setNewPassword(''); setNewRole('user'); setNewSubStatus('inactive');
      } else {
        setUserError(data.error || 'Registration failed');
      }
    } catch (err) {
      setUserError('A network error occurred');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you strictly positive you want to completely erase this user? This action wipes their history permanently.')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Deletion protocol failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'user');
    setEditSubStatus(user.subscriptionStatus || 'inactive');
    setEditPassword('');
    setEditError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    setEditError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser._id, name: editName, email: editEmail, role: editRole, subscriptionStatus: editSubStatus, newPassword: editPassword || undefined })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
        setEditingUser(null);
      } else {
        setEditError(data.error || 'Update failed');
      }
    } catch (err) {
      setEditError('A network error occurred');
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleUpdatePayment = async (paymentId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status })
      });
      if (res.ok) {
        fetchPayments(); // refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetQuizzes = async () => {
    if (!confirm('This will DELETE all existing quizzes and reset articles so they can be regenerated fresh. Continue?')) return;
    setResetting(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/reset-quizzes', { method: 'POST' });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Reset failed' });
    } finally {
      setResetting(false);
    }
  };

  const handleFetchNews = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/fetch-news', {
        method: 'POST',
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to fetch news' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage platform content and user subscriptions.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Content Engine</h2>
              <p className="text-sm text-slate-500">Run the daily news & AI quiz generator.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleFetchNews} 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 shadow-sm"
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Processing AI generated content...</>
              ) : (
                <><Plus className="mr-2 h-5 w-5" /> Fetch Latest News &amp; Generate Quizzes</>
              )}
            </button>

            <button
              onClick={handleResetQuizzes}
              disabled={resetting}
              className="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-xl hover:bg-red-100 transition flex items-center justify-center disabled:opacity-70 text-sm"
            >
              {resetting ? (
                <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Resetting...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" /> Reset &amp; Clear All Quizzes</>
              )}
            </button>
          </div>

          {result && (
            <div className={`mt-6 p-4 rounded-xl text-sm ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <pre className="whitespace-pre-wrap font-medium">
                 {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Subscription Approvals</h2>
          
          {loadingPayments ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
          ) : payments.length === 0 ? (
            <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">No payment requests found.</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {payments.map(payment => (
                <div key={payment._id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">{payment.userId?.email}</p>
                      <p className="text-slate-500 text-xs">Plan: <span className="font-semibold text-slate-700">{payment.plan}</span> (₹{payment.amount})</p>
                      <p className="text-slate-500 text-xs font-mono mt-1">UTR: <span className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">{payment.utrNumber}</span></p>
                      <p className="text-slate-400 text-xs mt-1">{new Date(payment.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        payment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {payment.status === 'pending' && (
                    <div className="flex space-x-2 pt-2 border-t border-slate-200">
                      <button onClick={() => handleUpdatePayment(payment._id, 'approved')} className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 py-1.5 rounded-lg flex items-center justify-center font-semibold transition">
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </button>
                      <button onClick={() => handleUpdatePayment(payment._id, 'rejected')} className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 py-1.5 rounded-lg flex items-center justify-center font-semibold transition">
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Component Scope: Dedicated User Control Management */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Management System</h2>
            <p className="text-sm text-slate-500">Manually inspect, provision, and eradicate user accounts from the central database.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create User Sub-Form Container */}
          <div className="lg:col-span-1 border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-start">
            <h3 className="font-extrabold text-slate-900 mb-4 border-b pb-3">Create User Form</h3>
            {userError && <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 py-2 px-3 border border-red-200 rounded-lg">{userError}</div>}
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm" placeholder="Johnathan Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Coordinates <span className="text-red-500">*</span></label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm" placeholder="hq@dfence.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password <span className="text-red-500">*</span></label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm" placeholder="••••••••" minLength={6} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Access Tier</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 shadow-sm outline-none">
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Auth</label>
                  <select value={newSubStatus} onChange={e => setNewSubStatus(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 shadow-sm outline-none">
                    <option value="inactive">INACTIVE</option>
                    <option value="active">AUTHORIZED</option>
                  </select>
                </div>
              </div>
              <button disabled={addingUser} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 transition-all font-bold text-white py-3 rounded-xl flex items-center justify-center text-sm disabled:opacity-70 mt-4 shadow-sm">
                {addingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Force Create User'}
              </button>
            </form>
          </div>

          {/* User Map Visual Output Table */}
          <div className="lg:col-span-2 border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="bg-slate-100 px-5 py-4 border-b border-slate-200 flex justify-between items-center shadow-inner">
              <span className="font-extrabold text-sm text-slate-800 tracking-tight">Active Identity Index</span>
              <span className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-full font-mono">{users.length} Logs</span>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto max-h-[500px] bg-white w-full">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-purple-600" /></div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Users className="h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No external users mapped in matrix.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#f8fafc] text-slate-500 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                     <tr>
                       <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Identity Locator (Email)</th>
                       <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Clearance</th>
                       <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Premium Access</th>
                       <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Eradicate</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <React.Fragment key={user._id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 text-slate-800">
                            <p className="font-bold">{user.email}</p>
                            <p className="text-xs text-slate-500 font-medium">{user.name || 'UNVERIFIED ALIAS'}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100/80 text-purple-700 ring-1 ring-purple-200/50' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/50'}`}>{user.role}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700 ring-1 ring-green-200/50' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/50'}`}>{user.subscriptionStatus}</span>
                          </td>
                          <td className="px-5 py-4 text-right flex items-center justify-end gap-1">
                            <button
                              onClick={() => editingUser?._id === user._id ? setEditingUser(null) : openEdit(user)}
                              className={`p-2 rounded-xl transition ${editingUser?._id === user._id ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                              title="Edit User"
                            >
                              {editingUser?._id === user._id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                            </button>
                            <button onClick={() => handleDeleteUser(user._id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition" title="Force Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                        {editingUser?._id === user._id && (
                          <tr key={`edit-${user._id}`} className="bg-blue-50/60">
                            <td colSpan={4} className="px-5 py-5">
                              <form onSubmit={handleSaveEdit} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                                {editError && <div className="col-span-full text-xs font-semibold text-red-600 bg-red-50 py-2 px-3 border border-red-200 rounded-lg">{editError}</div>}
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Name</label>
                                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="Full Name" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Email*</label>
                                  <input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">New Password <span className="normal-case text-slate-400 font-normal">(leave blank to keep)</span></label>
                                  <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} minLength={6} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="••••••••" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Role</label>
                                  <select value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 outline-none shadow-sm">
                                    <option value="user">USER</option>
                                    <option value="admin">ADMIN</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Subscription</label>
                                  <select value={editSubStatus} onChange={e => setEditSubStatus(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 outline-none shadow-sm">
                                    <option value="inactive">INACTIVE</option>
                                    <option value="active">ACTIVE</option>
                                  </select>
                                </div>
                                <div className="col-span-full flex justify-end gap-2 pt-1">
                                  <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition">Cancel</button>
                                  <button type="submit" disabled={savingEdit} className="px-5 py-2 text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-60 flex items-center gap-1">
                                    {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
