import { destroyCookie } from 'nookies';
import { useEffect, useRef } from 'react';
import { Can } from '~/components/Can';
import { useAuth } from '~/context/AuthContext';
import { useCan } from '~/hooks/useCan';
import { setupAPIClient } from '~/services/api';
import { api } from '~/services/apiClient';
import { AuthTokenError } from '~/services/errors/AuthTokenError';
import { withSSRAuth } from '~/utils/withSSRAuth';

export default function Dashboard() {
  const effectRan = useRef(false);

  const { user } = useAuth();

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list'],
  });

  useEffect(() => {
    if (!effectRan.current)
      api
        .get('/me')
        .then((response) => console.log(response.data))
        .catch((err) => {
          console.log(err);
        });

    return () => {
      effectRan.current = true;
    };
  }, []);

  return (
    <div>
      <h1>{userCanSeeMetrics && 'Métricas 1'}</h1>
      <h1>Dashboard: {`${user?.email}`}</h1>

      <Can permissions={['metrics.create']}>Métricas 2</Can>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  await apiClient.get('/me');

  return { props: {} };
});
