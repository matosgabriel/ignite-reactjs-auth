import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import { AuthTokenError } from '~/services/errors/AuthTokenError';
import { validateUserPermissions } from './validateUserPermissions';

import { decodeToken } from 'react-jwt';

interface WithSSRAuthOptions {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: WithSSRAuthOptions
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['auth.token'];

    if (!token) {
      return { redirect: { destination: '/', permanent: false } };
    }

    if (options) {
      const user = decodeToken<{ permissions: string[]; roles: string[] }>(
        token
      );

      const tokenHasPermissions = validateUserPermissions({
        user,
        permissions: options.permissions,
        roles: options.roles,
      });

      if (!tokenHasPermissions) {
        return { redirect: { destination: '/dashboard', permanent: false } };
      }
    }

    try {
      return await fn(ctx);
    } catch (err) {
      console.log(err);

      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, 'auth.token');
        destroyCookie(ctx, 'auth.refreshToken');

        return { redirect: { destination: '/', permanent: false } };
      }
    }
  };
}
