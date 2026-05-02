export const USERS = [
  {
    id: 'u1',
    username: 'admin',
    password: 'admin123',
    name: 'Alexandra Reeves',
    role: 'Admin',
    roleColor: '#E84040',
    avatar: 'AR',
    email: 'a.reeves@sios.io',
    lastLogin: '2026-05-02T08:14:00Z',
    status: 'active',
  },
  {
    id: 'u2',
    username: 'geo',
    password: 'geo123',
    name: 'Dr. Khalid Al-Mansouri',
    role: 'Geophysicist',
    roleColor: '#3B7FE8',
    avatar: 'KM',
    email: 'k.almansouri@sios.io',
    lastLogin: '2026-05-02T07:45:00Z',
    status: 'active',
  },
  {
    id: 'u3',
    username: 'ds',
    password: 'ds123',
    name: 'Priya Nair',
    role: 'Data Scientist',
    roleColor: '#7C4DFF',
    avatar: 'PN',
    email: 'p.nair@sios.io',
    lastLogin: '2026-05-01T22:30:00Z',
    status: 'active',
  },
  {
    id: 'u4',
    username: 'view',
    password: 'view123',
    name: 'James Thornton',
    role: 'Viewer',
    roleColor: '#F5A623',
    avatar: 'JT',
    email: 'j.thornton@sios.io',
    lastLogin: '2026-04-30T14:10:00Z',
    status: 'active',
  },
];

export const PROJECTS = [
  { id: 'p1', name: "Block 31 - Rub' al Khali", block: '31', country: 'Saudi Arabia', operator: 'Saudi Aramco', datasets: 3, models: 4, team: 8, created: '2025-11-01' },
  { id: 'p2', name: 'Offshore Delta Field', block: 'ODF-7', country: 'Nigeria', operator: 'Shell Nigeria', datasets: 2, models: 2, team: 5, created: '2025-08-15' },
  { id: 'p3', name: 'North Sea Shelf Survey', block: 'NS-22', country: 'Norway', operator: 'ExxonMobil', datasets: 4, models: 3, team: 6, created: '2025-06-20' },
];

export const PERMISSIONS = {
  Admin:          { canUploadData: true,  canRunModels: true,  canInterpret: true,  canViewReports: true, canManageUsers: true,  canExport: true,  canAccessAdmin: true  },
  Geophysicist:   { canUploadData: true,  canRunModels: true,  canInterpret: true,  canViewReports: true, canManageUsers: false, canExport: true,  canAccessAdmin: false },
  'Data Scientist':{ canUploadData: false, canRunModels: true,  canInterpret: false, canViewReports: true, canManageUsers: false, canExport: false, canAccessAdmin: false },
  Viewer:         { canUploadData: false, canRunModels: false, canInterpret: false, canViewReports: true, canManageUsers: false, canExport: false, canAccessAdmin: false },
};
