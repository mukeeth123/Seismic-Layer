import { useState } from 'react';
import { USERS, PROJECTS, PERMISSIONS } from '../mock/users';
import { Tabs, Table, Badge, Button, Modal } from '../components/ui';
import { useToast } from '../components/ui';

const AUDIT_LOG = Array.from({ length: 50 }, (_, i) => ({
  ts: `2026-05-0${Math.floor(i / 10) + 1} ${String(8 + (i % 10)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
  user: USERS[i % 4].name,
  ip: `192.168.${Math.floor(i/10)+1}.${(i * 7 + 12) % 255}`,
  action: ['Login','View Dataset','Run Model','Export Report','Add Annotation','Deploy Model','Change Role','Upload Data'][i % 8],
  resource: ['Block 31 Dataset','CNN v3.1','Fault Detector','Seismic Viewer','Interpretation','Admin Panel','User Management','Reports'][i % 8],
  result: i % 12 === 0 ? 'failed' : 'success',
}));

const SYSTEM_METRICS = {
  cpu: Array.from({ length: 24 }, (_, i) => 20 + Math.sin(i / 3) * 15 + Math.random() * 10),
  memory: 68,
  storage: { used: 448.5, total: 2000 },
  apiToday: 1247,
  apiMonth: 38420,
  inferenceRequests: 892,
};

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState(USERS);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', username: '', role: 'Viewer', password: '' });
  const [page, setPage] = useState(0);
  const toast = useToast();
  const PAGE_SIZE = 10;

  function handleAddUser() {
    const u = { ...newUser, id: `u${Date.now()}`, avatar: newUser.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(), roleColor: '#F5A623', email: `${newUser.username}@sios.io`, lastLogin: '—', status: 'active' };
    setUsers(prev => [...prev, u]);
    setAddModal(false);
    setNewUser({ name: '', username: '', role: 'Viewer', password: '' });
    toast(`User ${u.name} added successfully`, 'success');
  }

  function handleDeactivate(user) {
    setConfirmModal({
      title: 'Deactivate User',
      message: `Deactivate ${user.name}? They will lose access to all SIOS modules immediately.`,
      action: () => { setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'inactive' } : u)); toast(`${user.name} deactivated`, 'info'); setConfirmModal(null); },
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Admin Panel</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>User management, projects, system health, and audit log</div>
      </div>

      <Tabs
        tabs={[{ id: 'users', label: 'Users' }, { id: 'projects', label: 'Projects' }, { id: 'system', label: 'System' }, { id: 'audit', label: 'Audit Log' }]}
        active={tab}
        onChange={setTab}
        style={{ marginBottom: 16 }}
      />

      {tab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button variant="primary" onClick={() => setAddModal(true)}>+ Add User</Button>
          </div>
          <Table
            columns={[
              { key: 'avatar', label: '', render: (v, row) => (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${row.roleColor}22`, border: `1px solid ${row.roleColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: row.roleColor }}>{v}</div>
              )},
              { key: 'name', label: 'Name' },
              { key: 'username', label: 'Username', render: v => <span style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{v}</span> },
              { key: 'role', label: 'Role', render: (v, row) => <Badge color={{ Admin: 'red', Geophysicist: 'blue', 'Data Scientist': 'purple', Viewer: 'yellow' }[v] || 'gray'}>{v}</Badge> },
              { key: 'lastLogin', label: 'Last Login', render: v => v === '—' ? '—' : new Date(v).toLocaleString() },
              { key: 'status', label: 'Status', render: v => <Badge color={v === 'active' ? 'green' : 'gray'}>{v}</Badge> },
              { key: 'id', label: 'Actions', render: (v, row) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditModal(row); }}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={e => { e.stopPropagation(); handleDeactivate(row); }} disabled={row.status === 'inactive'}>Deactivate</Button>
                </div>
              )},
            ]}
            data={users}
          />
        </div>
      )}

      {tab === 'projects' && (
        <Table
          columns={[
            { key: 'name', label: 'Project', render: v => <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>{v}</span> },
            { key: 'block', label: 'Block' },
            { key: 'country', label: 'Country' },
            { key: 'operator', label: 'Operator' },
            { key: 'datasets', label: 'Datasets' },
            { key: 'models', label: 'Models' },
            { key: 'team', label: 'Team Size' },
            { key: 'created', label: 'Created' },
          ]}
          data={PROJECTS}
        />
      )}

      {tab === 'system' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {/* CPU */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>CPU Usage (24h)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
              {SYSTEM_METRICS.cpu.map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v}%`, background: v > 70 ? 'var(--danger)' : v > 50 ? 'var(--warning)' : 'var(--accent-blue)', borderRadius: '2px 2px 0 0', opacity: 0.8 }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Current: {SYSTEM_METRICS.cpu[23].toFixed(1)}%</div>
          </div>

          {/* Memory */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Memory Usage</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: SYSTEM_METRICS.memory > 80 ? 'var(--danger)' : 'var(--accent-blue)', marginBottom: 8 }}>{SYSTEM_METRICS.memory}%</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
              <div style={{ width: `${SYSTEM_METRICS.memory}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>54.4 GB / 80 GB</div>
          </div>

          {/* Storage */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Storage</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 8 }}>{SYSTEM_METRICS.storage.used} GB</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
              <div style={{ width: `${(SYSTEM_METRICS.storage.used / SYSTEM_METRICS.storage.total) * 100}%`, height: '100%', background: 'var(--accent-purple)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{SYSTEM_METRICS.storage.used} / {SYSTEM_METRICS.storage.total} GB used</div>
          </div>

          {[['API Calls Today', SYSTEM_METRICS.apiToday.toLocaleString(), 'var(--success)'], ['API Calls (Month)', SYSTEM_METRICS.apiMonth.toLocaleString(), 'var(--accent-blue)'], ['Inference Requests', SYSTEM_METRICS.inferenceRequests.toLocaleString(), 'var(--warning)']].map(([l, v, c]) => (
            <div key={l} className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <div>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, AUDIT_LOG.length)} of {AUDIT_LOG.length} events</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <Button variant="ghost" size="sm" disabled={(page + 1) * PAGE_SIZE >= AUDIT_LOG.length} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          </div>
          <Table
            columns={[
              { key: 'ts', label: 'Timestamp', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</span> },
              { key: 'user', label: 'User' },
              { key: 'ip', label: 'IP', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{v.replace(/\.\d+$/, '.***')}</span> },
              { key: 'action', label: 'Action' },
              { key: 'resource', label: 'Resource', style: { color: 'var(--text-secondary)' } },
              { key: 'result', label: 'Result', render: v => <Badge color={v === 'success' ? 'green' : 'red'}>{v}</Badge> },
            ]}
            data={AUDIT_LOG.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
          />
        </div>
      )}

      {/* Add user modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New User">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['Full Name', 'name', 'text'], ['Username', 'username', 'text'], ['Temp Password', 'password', 'password']].map(([l, k, t]) => (
            <div key={k}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{l.toUpperCase()}</label>
              <input type={t} value={newUser[k]} onChange={e => setNewUser(u => ({ ...u, [k]: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter', outline: 'none' }} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>ROLE</label>
            <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0F1520', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter', outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}>
              {Object.keys(PERMISSIONS).map(r => <option key={r} value={r} style={{ backgroundColor: '#0F1520', color: '#fff' }}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddUser} disabled={!newUser.name || !newUser.username}>Add User</Button>
          </div>
        </div>
      </Modal>

      {/* Edit user modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit User — ${editModal?.name}`}>
        {editModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>ROLE</label>
              <select value={editModal.role} onChange={e => setEditModal(u => ({ ...u, role: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0F1520', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter', outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}>
                {Object.keys(PERMISSIONS).map(r => <option key={r} value={r} style={{ backgroundColor: '#0F1520', color: '#fff' }}>{r}</option>)}
              </select>
            </div>
            <div style={{ padding: '10px', background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 6, fontSize: 11, color: 'var(--warning)' }}>
              Changing role will immediately update permissions for this user.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setEditModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => { setUsers(prev => prev.map(u => u.id === editModal.id ? editModal : u)); toast(`${editModal.name} role updated to ${editModal.role}`, 'success'); setEditModal(null); }}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm modal */}
      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)} title={confirmModal?.title}>
        {confirmModal && (
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{confirmModal.message}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmModal.action}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
