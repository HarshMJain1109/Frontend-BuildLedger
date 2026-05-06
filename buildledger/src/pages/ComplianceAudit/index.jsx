import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Plus, Loader2, RefreshCw } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import {
  Button, FormInput, FormSelect, FormTextarea, PageHeader, SectionCard,
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell,
} from '../../components/ui';
import { getAllCompliance, createCompliance, updateComplianceStatus } from '../../api/compliance';
import { getAllAudits, createAudit, updateAuditStatus } from '../../api/audits';
import { getAllContracts } from '../../api/contracts';
import { getAllUsers } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const COMPLIANCE_TYPES = ['SAFETY', 'ENVIRONMENTAL', 'FINANCIAL', 'LEGAL', 'QUALITY', 'CONTRACT_TERMS', 'OTHER'];
const PIE_COLORS       = ['#22C55E', '#F59E0B', '#EF4444'];

const COMPLIANCE_TRANSITIONS = {
  PENDING:      ['UNDER_REVIEW'],
  UNDER_REVIEW: ['PASSED', 'FAILED', 'WAIVED'],
  FAILED:       ['PENDING'],
  PASSED:       [], WAIVED: [],
};
const COMPLIANCE_TRANSITION_LABELS = {
  UNDER_REVIEW: { label: 'Start Review', color: '#3b82f6' },
  PASSED:       { label: 'Mark Passed',  color: '#22C55E' },
  FAILED:       { label: 'Mark Failed',  color: '#EF4444' },
  WAIVED:       { label: 'Waive',        color: '#94a3b8' },
  PENDING:      { label: 'Re-open',      color: '#F59E0B' },
};
const AUDIT_TRANSITIONS = {
  SCHEDULED:      ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS:    ['PENDING_REVIEW', 'CANCELLED'],
  PENDING_REVIEW: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], CANCELLED: [],
};
const AUDIT_TRANSITION_LABELS = {
  IN_PROGRESS:    { label: 'Start Audit',   color: '#3b82f6' },
  PENDING_REVIEW: { label: 'Submit Review', color: '#F59E0B' },
  COMPLETED:      { label: 'Complete',      color: '#22C55E' },
  CANCELLED:      { label: 'Cancel',        color: '#EF4444' },
};

function showErrors(err) {
  const apiErrors = err.response?.data?.data;
  if (apiErrors && typeof apiErrors === 'object') {
    toast.error(Object.entries(apiErrors).map(([f, m]) => `${f}: ${m}`).join(' | '));
  } else {
    toast.error(err.response?.data?.message || 'Request failed');
  }
}

function contractLabel(contracts, contractId) {
  const c = contracts.find(x => x.contractId === contractId);
  if (!c) return `#${contractId}`;
  return `${c.vendorName || 'Unknown'} — ${c.projectName || 'Unknown'} (#${contractId})`;
}

function ComplianceActions({ record, canManage, onTransition, loading }) {
  if (!canManage) return null;
  const nexts = COMPLIANCE_TRANSITIONS[record.status] || [];
  if (nexts.length === 0) return <span className="text-[10px] text-slate-400">—</span>;
  return (
    <div className="flex gap-1 flex-wrap">
      {nexts.map(next => {
        const cfg = COMPLIANCE_TRANSITION_LABELS[next];
        return (
          <button key={next} onClick={() => onTransition(record.complianceId, next)}
            disabled={loading[record.complianceId]}
            className="text-[10px] px-2 py-1 rounded-lg font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: cfg.color }}>
            {loading[record.complianceId] ? <Loader2 size={9} className="animate-spin inline" /> : cfg.label}
          </button>
        );
      })}
    </div>
  );
}

function AuditActions({ audit, canManage, onTransition, loading }) {
  if (!canManage) return null;
  const nexts = AUDIT_TRANSITIONS[audit.status] || [];
  if (nexts.length === 0) return <span className="text-[10px] text-slate-400">—</span>;
  return (
    <div className="flex gap-1 flex-wrap">
      {nexts.map(next => {
        const cfg = AUDIT_TRANSITION_LABELS[next];
        return (
          <button key={next} onClick={() => onTransition(audit.auditId, next)}
            disabled={loading[audit.auditId]}
            className="text-[10px] px-2 py-1 rounded-lg font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: cfg.color }}>
            {loading[audit.auditId] ? <Loader2 size={9} className="animate-spin inline" /> : cfg.label}
          </button>
        );
      })}
    </div>
  );
}

const EMPTY_COMPLIANCE = { contractId: '', type: '', result: '', date: '', notes: '' };
const EMPTY_AUDIT      = { complianceOfficerId: '', scope: '', findings: '', date: '' };

export default function ComplianceAudit() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [compliance, setCompliance]   = useState([]);
  const [audits, setAudits]           = useState([]);
  const [contracts, setContracts]     = useState([]);
  const [officers, setOfficers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showCreateC, setShowCreateC] = useState(false);
  const [showCreateA, setShowCreateA] = useState(false);
  const [formC, setFormC]             = useState(EMPTY_COMPLIANCE);
  const [formA, setFormA]             = useState(EMPTY_AUDIT);
  const [saving, setSaving]           = useState(false);
  const [cLoading, setCLoading]       = useState({});
  const [aLoading, setALoading]       = useState({});
  const [cErrors, setCErrors]         = useState({});
  const [aErrors, setAErrors]         = useState({});

  const canManage = ['ADMIN', 'COMPLIANCE_OFFICER'].includes(user?.role);
  const today     = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, a, con, usr] = await Promise.allSettled([
        getAllCompliance(), getAllAudits(), getAllContracts(), getAllUsers()
      ]);
      setCompliance(c.status === 'fulfilled'   ? (c.value.data?.data || []) : []);
      setAudits(a.status === 'fulfilled'       ? (a.value.data?.data || []) : []);
      setContracts(con.status === 'fulfilled'  ? (con.value.data?.data || []) : []);
      if (usr.status === 'fulfilled') {
        const allUsers = usr.value.data?.data || usr.value.data || [];
        setOfficers(allUsers.filter(u => u.role === 'COMPLIANCE_OFFICER' || u.role === 'ADMIN'));
      }
    } catch { toast.error('Failed to load compliance data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const compliant    = compliance.filter(c => c.status === 'PASSED' || c.status === 'WAIVED').length;
  const nonCompliant = compliance.filter(c => c.status === 'FAILED').length;
  const pending      = compliance.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length;
  const total        = compliance.length || 1;
  const overallScore = Math.round((compliant / total) * 100);

  const pieData = [
    { name: 'Passed / Waived', value: compliant },
    { name: 'Pending / Review', value: pending },
    { name: 'Failed',           value: nonCompliant },
  ];

  const handleCreateCompliance = async () => {
    const e = {};
    if (!formC.contractId) e.contractId = 'Please select a contract';
    if (!formC.type)       e.type       = 'Compliance type is required';
    if (!formC.date)       e.date       = 'Date is required';
    setCErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await createCompliance({ contractId: Number(formC.contractId), type: formC.type, result: formC.result || undefined, date: formC.date, notes: formC.notes || undefined });
      toast.success('Compliance record created');
      setShowCreateC(false); setFormC(EMPTY_COMPLIANCE); setCErrors({}); fetchData();
    } catch (err) { showErrors(err); }
    finally { setSaving(false); }
  };

  const handleCreateAudit = async () => {
    const e = {};
    if (!formA.complianceOfficerId)                    e.complianceOfficerId = 'Please select an officer';
    if (!formA.scope || formA.scope.trim().length < 5) e.scope               = 'Scope must be at least 5 characters';
    if (!formA.date)                                   e.date                = 'Scheduled date is required';
    setAErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await createAudit({ complianceOfficerId: Number(formA.complianceOfficerId), scope: formA.scope, findings: formA.findings || undefined, date: formA.date });
      toast.success('Audit scheduled');
      setShowCreateA(false); setFormA(EMPTY_AUDIT); setAErrors({}); fetchData();
    } catch (err) { showErrors(err); }
    finally { setSaving(false); }
  };

  const handleComplianceTransition = async (id, nextStatus) => {
    setCLoading(p => ({ ...p, [id]: true }));
    try { await updateComplianceStatus(id, nextStatus); toast.success(`Compliance → ${nextStatus}`); fetchData(); }
    catch (err) { showErrors(err); }
    finally { setCLoading(p => ({ ...p, [id]: false })); }
  };

  const handleAuditTransition = async (id, nextStatus) => {
    setALoading(p => ({ ...p, [id]: true }));
    try { await updateAuditStatus(id, nextStatus); toast.success(`Audit → ${nextStatus}`); fetchData(); }
    catch (err) { showErrors(err); }
    finally { setALoading(p => ({ ...p, [id]: false })); }
  };

  const setC = k => e => setFormC(p => ({ ...p, [k]: e.target.value }));
  const setA = k => e => setFormA(p => ({ ...p, [k]: e.target.value }));

  const pieTrack = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-2 text-slate-400">
      <Loader2 size={20} className="animate-spin text-blue-500" /><span className="text-sm">Loading compliance data…</span>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-5">
      <PageHeader
        title="Compliance & Audit"
        subtitle={`${compliance.length} compliance records · ${audits.length} audits`}
        actions={
          <>
            <Button variant="secondary" size="xs" icon={<RefreshCw size={13} />} onClick={fetchData}>Refresh</Button>
            {canManage && (
              <>
                <Button variant="secondary" size="xs" icon={<Plus size={13} />} onClick={() => setShowCreateC(true)}>Compliance</Button>
                <Button variant="primary" size="xs" icon={<Plus size={13} />} onClick={() => setShowCreateA(true)}>Audit</Button>
              </>
            )}
          </>
        }
      />

      {/* Overview row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall score */}
        <div className="glass-card p-5 flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ value: overallScore }, { value: 100 - overallScore }]}
                  cx="50%" cy="50%" innerRadius={42} outerRadius={54} startAngle={90} endAngle={-270}
                  dataKey="value" strokeWidth={0}>
                  <Cell fill="#3b82f6" />
                  <Cell fill={pieTrack} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{overallScore}%</p>
              <p className="text-[9px] text-slate-400 font-medium">OVERALL</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Compliance Score</p>
          <p className="text-xs text-slate-400">Based on {compliance.length} record{compliance.length !== 1 ? 's' : ''}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 w-full text-center text-xs">
            <div className="rounded-xl p-2 bg-green-50 dark:bg-green-900/20 border border-transparent dark:border-green-700/25">
              <p className="font-bold text-green-700 dark:text-green-400">{compliant}</p>
              <p className="text-slate-400 text-[9px]">Passed</p>
            </div>
            <div className="rounded-xl p-2 bg-amber-50 dark:bg-amber-900/20 border border-transparent dark:border-amber-700/25">
              <p className="font-bold text-amber-700 dark:text-amber-400">{pending}</p>
              <p className="text-slate-400 text-[9px]">Pending</p>
            </div>
            <div className="rounded-xl p-2 bg-red-50 dark:bg-red-900/20 border border-transparent dark:border-red-700/25">
              <p className="font-bold text-red-700 dark:text-red-400">{nonCompliant}</p>
              <p className="text-slate-400 text-[9px]">Failed</p>
            </div>
          </div>
        </div>

        {/* Pie breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Status Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="glass-card px-2 py-1 text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{payload[0].name}: {payload[0].value}</p>
                  </div>
                ) : null} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{d.name}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent compliance */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Recent Compliance</h3>
          <div className="space-y-2.5 overflow-y-auto max-h-[180px]">
            {compliance.slice(0, 6).map(c => (
              <div key={c.complianceId} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[130px]">{c.type || contractLabel(contracts, c.contractId)}</span>
                <Badge status={c.status} />
              </div>
            ))}
            {compliance.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No compliance records</p>}
          </div>
        </div>
      </div>

      {/* Compliance Records Table */}
      <SectionCard title="Compliance Records">
        <div className="overflow-x-auto">
          <Table elevated={false}>
            <TableHead>
              {['ID', 'Contract', 'Type', 'Result', 'Date', 'Status', canManage ? 'Actions' : ''].filter(Boolean).map(h => (
                <TableHeader key={h}>{h}</TableHeader>
              ))}
            </TableHead>
            <TableBody>
              {compliance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-400">No compliance records found</TableCell>
                </TableRow>
              ) : compliance.map(c => (
                <TableRow key={c.complianceId}>
                  <TableCell className="text-xs font-mono text-slate-400">#{c.complianceId}</TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400 max-w-[150px]">
                    <span className="truncate block">{contractLabel(contracts, c.contractId)}</span>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-200">{c.type || '—'}</TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400 max-w-[120px]">
                    <span className="truncate block">{c.result || '—'}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400 whitespace-nowrap">{c.date || '—'}</TableCell>
                  <TableCell><Badge status={c.status} /></TableCell>
                  {canManage && (
                    <TableCell>
                      <ComplianceActions record={c} canManage={canManage} onTransition={handleComplianceTransition} loading={cLoading} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Audit Records Table */}
      <SectionCard title="Audit Records">
        <div className="overflow-x-auto">
          <Table elevated={false}>
            <TableHead>
              {['ID', 'Scope', 'Officer', 'Scheduled', 'Status', canManage ? 'Actions' : ''].filter(Boolean).map(h => (
                <TableHeader key={h}>{h}</TableHeader>
              ))}
            </TableHead>
            <TableBody>
              {audits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-400">No audit records found</TableCell>
                </TableRow>
              ) : audits.map(a => (
                <TableRow key={a.auditId}>
                  <TableCell className="text-xs font-mono text-slate-400">#{a.auditId}</TableCell>
                  <TableCell className="text-xs text-slate-700 dark:text-slate-200 max-w-[200px]">
                    <p className="truncate">{a.scope || '—'}</p>
                    {a.findings && <p className="text-[10px] text-slate-400 truncate">{a.findings}</p>}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{a.officerName || `#${a.complianceOfficerId}` || '—'}</TableCell>
                  <TableCell className="text-xs text-slate-400 whitespace-nowrap">{a.date || '—'}</TableCell>
                  <TableCell><Badge status={a.status} /></TableCell>
                  {canManage && (
                    <TableCell>
                      <AuditActions audit={a} canManage={canManage} onTransition={handleAuditTransition} loading={aLoading} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Create Compliance Modal */}
      <Modal open={showCreateC} onClose={() => { setShowCreateC(false); setFormC(EMPTY_COMPLIANCE); setCErrors({}); }} title="Create Compliance Record">
        <div className="space-y-4">
          <FormSelect
            label="Contract"
            required
            value={formC.contractId}
            onChange={e => { setC('contractId')(e); if (e.target.value) setCErrors(p => ({ ...p, contractId: '' })); }}
            error={cErrors.contractId}
          >
            <option value="">Select contract…</option>
            {contracts.map(c => (
              <option key={c.contractId} value={c.contractId}>{c.vendorName || 'Unknown'} — {c.projectName || 'Unknown'} (#{c.contractId})</option>
            ))}
          </FormSelect>
          <FormSelect
            label="Compliance Type"
            required
            value={formC.type}
            onChange={e => { setC('type')(e); if (e.target.value) setCErrors(p => ({ ...p, type: '' })); }}
            error={cErrors.type}
          >
            <option value="">Select type…</option>
            {COMPLIANCE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </FormSelect>
          <FormInput
            label="Date"
            required
            type="date"
            max={today}
            value={formC.date}
            onChange={e => { setC('date')(e); if (e.target.value) setCErrors(p => ({ ...p, date: '' })); }}
            error={cErrors.date}
          />
          <FormInput label="Result" value={formC.result} onChange={setC('result')} placeholder="Compliance check outcome…" />
          <FormTextarea label="Notes" value={formC.notes} onChange={setC('notes')} rows={2} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" size="xs" onClick={() => { setShowCreateC(false); setFormC(EMPTY_COMPLIANCE); setCErrors({}); }}>Cancel</Button>
            <Button variant="primary" size="xs" onClick={handleCreateCompliance} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Create Audit Modal */}
      <Modal open={showCreateA} onClose={() => { setShowCreateA(false); setFormA(EMPTY_AUDIT); setAErrors({}); }} title="Schedule Audit">
        <div className="space-y-4">
          <FormSelect
            label="Compliance Officer"
            required
            value={formA.complianceOfficerId}
            onChange={e => { setA('complianceOfficerId')(e); if (e.target.value) setAErrors(p => ({ ...p, complianceOfficerId: '' })); }}
            error={aErrors.complianceOfficerId}
            hint={officers.length === 0 ? 'No compliance officers found.' : ''}
          >
            <option value="">Select officer…</option>
            {officers.map(o => <option key={o.userId} value={o.userId}>{o.name || o.username} ({o.role})</option>)}
          </FormSelect>
          <FormTextarea
            label="Scope"
            required
            hint="(min 5 chars)"
            value={formA.scope}
            onChange={e => { setA('scope')(e); if (e.target.value.trim().length >= 5) setAErrors(p => ({ ...p, scope: '' })); }}
            rows={3}
            placeholder="Describe what this audit covers…"
            error={aErrors.scope}
          />
          <FormInput
            label="Scheduled Date"
            required
            type="date"
            min={today}
            value={formA.date}
            onChange={e => { setA('date')(e); if (e.target.value) setAErrors(p => ({ ...p, date: '' })); }}
            error={aErrors.date}
          />
          <FormTextarea label="Initial Findings" hint="(optional)" value={formA.findings} onChange={setA('findings')} rows={2} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" size="xs" onClick={() => { setShowCreateA(false); setFormA(EMPTY_AUDIT); setAErrors({}); }}>Cancel</Button>
            <Button variant="primary" size="xs" onClick={handleCreateAudit} loading={saving}>Schedule Audit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
