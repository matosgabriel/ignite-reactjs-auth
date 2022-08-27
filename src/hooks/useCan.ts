import { useAuth } from '~/context/AuthContext';
import { validateUserPermissions } from '~/utils/validateUserPermissions';

interface UseCanParams {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  return validateUserPermissions({ user, permissions, roles });
}
