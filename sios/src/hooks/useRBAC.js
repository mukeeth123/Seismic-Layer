import { useAuth } from '../auth/AuthContext';

export function useRBAC() {
  const { auth } = useAuth();
  const permissions = auth?.permissions ?? {};
  return {
    can: (permission) => !!permissions[permission],
    role: auth?.role,
    permissions,
  };
}
