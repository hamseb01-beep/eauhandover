import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardList, 
  PlusCircle, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  RefreshCw, 
  LogOut,
  User,
  Calendar,
  Stethoscope,
  Activity,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Patient {
  name: string;
  age: string;
  site: string;
  history: string;
  physical: string;
  investigations: string;
  assessment: string;
  done: string;
  plan: string;
}

interface Shift {
  shift_id: string;
  shift_date: string;
  shift_letter: string;
  senior_resident: string;
  junior_resident: string;
  gp: string;
  intern: string;
  total_patients_seen: number;
  total_vd: number;
  total_cs: number;
  admissions_maternity: number;
  admissions_medical: number;
  admissions_nicu: number;
  created_by: string;
  patients: Patient[];
}

type Role = 'editor' | 'viewer' | null;
type Tab = 'create' | 'view';

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [step, setStep] = useState(1);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [currentShift, setCurrentShift] = useState<Shift>({
    shift_id: `SH-${Date.now()}`,
    shift_date: new Date().toISOString().slice(0, 16),
    shift_letter: 'A',
    senior_resident: '',
    junior_resident: '',
    gp: '',
    intern: '',
    total_patients_seen: 0,
    total_vd: 0,
    total_cs: 0,
    admissions_maternity: 0,
    admissions_medical: 0,
    admissions_nicu: 0,
    created_by: 'Editor',
    patients: []
  });

  const [currentPatient, setCurrentPatient] = useState<Patient>({
    name: '',
    age: '',
    site: 'Maternity ward',
    history: '',
    physical: '',
    investigations: '',
    assessment: '',
    done: '',
    plan: ''
  });

  useEffect(() => {
    if (role) {
      fetchShifts();
    }
  }, [role]);

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwy1onJAKESlRdRZUb-xiPC-D-jTvpQtJmehpAOMRVtecNCWXyyzYCjAewhwCeY_CZY/exec";

  const fetchShifts = async () => {
    setLoading(true);
    try {
      // Use no-cache to ensure we get fresh data
      const response = await fetch(`${GAS_URL}?method=GET`, {
        method: 'GET',
        mode: 'cors',
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setShifts(data);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShift = async () => {
    setSaving(true);
    try {
      // Google Apps Script POST requires specific handling for CORS redirects
      const response = await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors', // POST to GAS often requires no-cors or handling redirects
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentShift)
      });
      
      // Since 'no-cors' won't let us read the response, we assume success or wait a bit
      alert('Shift data sent! It may take a few seconds to appear in the list.');
      
      // Reset form
      setCurrentShift({
        shift_id: `SH-${Date.now()}`,
        shift_date: new Date().toISOString().slice(0, 16),
        shift_letter: 'A',
        senior_resident: '',
        junior_resident: '',
        gp: '',
        intern: '',
        total_patients_seen: 0,
        total_vd: 0,
        total_cs: 0,
        admissions_maternity: 0,
        admissions_medical: 0,
        admissions_nicu: 0,
        created_by: role === 'editor' ? 'Editor' : 'Viewer',
        patients: []
      });
      setStep(1);
      setActiveTab('view');
      setTimeout(fetchShifts, 3000); // Wait 3 seconds for GAS to process
    } catch (error) {
      console.error('Error saving shift:', error);
      alert('Failed to send data. Check your internet connection.');
    } finally {
      setSaving(false);
    }
  };

  const addPatient = () => {
    if (!currentPatient.name) {
      alert('Please enter at least a patient name.');
      return;
    }
    setCurrentShift(prev => ({
      ...prev,
      patients: [...prev.patients, currentPatient]
    }));
    setCurrentPatient({
      name: '',
      age: '',
      site: 'Maternity ward',
      history: '',
      physical: '',
      investigations: '',
      assessment: '',
      done: '',
      plan: ''
    });
    alert('Patient added to current shift.');
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-200">
            <Stethoscope className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Edna Adan Hospital</h1>
          <p className="text-slate-500 mb-8">Clinical Handover System</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => setRole('editor')}
              className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
            >
              <PlusCircle size={20} />
              Editor Role
            </button>
            <button 
              onClick={() => setRole('viewer')}
              className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <ClipboardList size={20} />
              Viewer Role
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 p-2 rounded-lg">
            <Stethoscope size={20} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">EAUH Handover</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-teal-500/20 text-teal-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30">
            {role}
          </span>
          <button 
            onClick={() => setRole(null)}
            className="text-slate-400 hover:text-white transition-colors p-2"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 flex">
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'create' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <PlusCircle size={18} />
          Create Report
        </button>
        <button 
          onClick={() => setActiveTab('view')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'view' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <ClipboardList size={18} />
          View Reports
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {activeTab === 'create' ? (
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200 overflow-hidden">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${step === s ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400'}`}
                >
                  {s === 1 ? 'Shift Info' : s === 2 ? 'Patients' : 'Review'}
                </div>
              ))}
            </div>

            {/* Step 1: Shift Details */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
                <section>
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Calendar className="text-teal-600" size={20} />
                    Shift Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={currentShift.shift_date}
                        onChange={e => setCurrentShift({...currentShift, shift_date: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shift Letter</label>
                      <select 
                        value={currentShift.shift_letter}
                        onChange={e => setCurrentShift({...currentShift, shift_letter: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                      >
                        {['A', 'B', 'C', 'D'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Users className="text-teal-600" size={20} />
                    Duty Team
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(['senior_resident', 'junior_resident', 'gp', 'intern'] as const).map(role => (
                      <div key={role} className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{role.replace('_', ' ')}</label>
                        <input 
                          type="text" 
                          value={currentShift[role]}
                          onChange={e => setCurrentShift({...currentShift, [role]: e.target.value})}
                          placeholder="Name..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity className="text-teal-600" size={20} />
                    Statistics & Admissions
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Seen', key: 'total_patients_seen' },
                      { label: 'Total VD', key: 'total_vd' },
                      { label: 'Total CS', key: 'total_cs' },
                      { label: 'Adm Mat', key: 'admissions_maternity' },
                      { label: 'Adm Med', key: 'admissions_medical' },
                      { label: 'Adm NICU', key: 'admissions_nicu' },
                    ].map(stat => (
                      <div key={stat.key} className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</label>
                        <input 
                          type="number" 
                          value={currentShift[stat.key as keyof Shift] as number}
                          onChange={e => setCurrentShift({...currentShift, [stat.key]: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <div className="pt-6 flex justify-end">
                  <button 
                    onClick={() => setStep(2)}
                    className="px-8 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all flex items-center gap-2"
                  >
                    Next: Patients
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Patient Details */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <User className="text-teal-600" size={20} />
                    Add Patient Record
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name / ID</label>
                      <input 
                        type="text" 
                        value={currentPatient.name}
                        onChange={e => setCurrentPatient({...currentPatient, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                      <input 
                        type="text" 
                        value={currentPatient.age}
                        onChange={e => setCurrentPatient({...currentPatient, age: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Site</label>
                      <select 
                        value={currentPatient.site}
                        onChange={e => setCurrentPatient({...currentPatient, site: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                      >
                        {['Maternity ward', 'Labor ward', 'Medical ward', 'NICU'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(['history', 'physical', 'investigations', 'assessment', 'done', 'plan'] as const).map(field => (
                      <div key={field} className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{field}</label>
                        <textarea 
                          rows={2}
                          value={currentPatient[field]}
                          onChange={e => setCurrentPatient({...currentPatient, [field]: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-3 text-slate-500 font-bold flex items-center gap-2 hover:text-slate-800 transition-all"
                    >
                      <ChevronLeft size={20} />
                      Back
                    </button>
                    <div className="flex gap-4">
                      <button 
                        onClick={addPatient}
                        className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Save Patient
                      </button>
                      <button 
                        onClick={() => setStep(3)}
                        className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all flex items-center gap-2"
                      >
                        Review Report
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Patient List Summary */}
                {currentShift.patients.length > 0 && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Added Patients ({currentShift.patients.length})</h3>
                    <div className="flex flex-wrap gap-3">
                      {currentShift.patients.map((p, i) => (
                        <div key={i} className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-sm font-semibold border border-teal-100">
                          {p.name} <span className="text-teal-400 text-xs ml-2">{p.site}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">Review & Submit</h2>
                  <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-auto max-h-[400px]">
                    <pre>{JSON.stringify(currentShift, null, 2)}</pre>
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button 
                      onClick={() => setStep(2)}
                      className="px-6 py-3 text-slate-500 font-bold flex items-center gap-2 hover:text-slate-800 transition-all"
                    >
                      <ChevronLeft size={20} />
                      Back
                    </button>
                    <button 
                      onClick={handleSaveShift}
                      disabled={saving}
                      className="px-10 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-200 hover:bg-teal-700 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                      {saving ? 'Saving to Sheets...' : 'Finish & Save to Sheets'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* View Tab */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Shift Reports</h2>
              <button 
                onClick={fetchShifts}
                disabled={loading}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <RefreshCw className="animate-spin text-teal-600" size={40} />
                <p className="text-slate-500 font-medium">Syncing with Google Sheets...</p>
              </div>
            ) : shifts.length === 0 ? (
              <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-300 text-center">
                <ClipboardList className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500">No reports found in Google Sheets.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {shifts.map((s, idx) => (
                  <motion.div 
                    key={s.shift_id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-teal-500 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">
                          {s.shift_letter}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shift Date</p>
                          <p className="font-semibold">{new Date(s.shift_date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report ID</p>
                        <p className="font-mono text-xs">{s.shift_id}</p>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border-b border-slate-200">
                      {[
                        { label: 'Sr Resident', val: s.senior_resident },
                        { label: 'Jr Resident', val: s.junior_resident },
                        { label: 'GP', val: s.gp },
                        { label: 'Intern', val: s.intern },
                      ].map(t => (
                        <div key={t.label}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.label}</p>
                          <p className="text-sm font-semibold text-slate-700">{t.val || '—'}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 flex flex-wrap gap-8 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patients Seen</p>
                          <p className="text-sm font-bold text-slate-800">{s.total_patients_seen}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                          <Activity size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VD / CS</p>
                          <p className="text-sm font-bold text-slate-800">{s.total_vd} / {s.total_cs}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                          <PlusCircle size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admissions (Mat/Med/NICU)</p>
                          <p className="text-sm font-bold text-slate-800">{s.admissions_maternity} / {s.admissions_medical} / {s.admissions_nicu}</p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {s.patients && s.patients.length > 0 ? s.patients.map((p, pIdx) => (
                        <div key={pIdx} className="p-8 hover:bg-slate-50/50 transition-colors">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                                {pIdx + 1}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-slate-800">{p.name}</h4>
                                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">{p.site} • {p.age} years</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {[
                              { label: 'History', val: p.history },
                              { label: 'Physical Exam', val: p.physical },
                              { label: 'Investigations', val: p.investigations },
                              { label: 'Assessment', val: p.assessment },
                              { label: 'Done', val: p.done },
                              { label: 'Plan', val: p.plan },
                            ].map(item => (
                              <div key={item.label} className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <FileText size={10} />
                                  {item.label}
                                </p>
                                <p className="text-sm text-slate-600 leading-relaxed">{item.val || '—'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )) : (
                        <div className="p-10 text-center text-slate-400 text-sm italic">
                          No patient details recorded for this shift.
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
