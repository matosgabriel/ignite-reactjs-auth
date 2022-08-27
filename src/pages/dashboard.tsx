import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { Can } from '~/components/Can';
import { authChannel, useAuth } from '~/context/AuthContext';
import { useCan } from '~/hooks/useCan';
import { setupAPIClient } from '~/services/api';
import { api } from '~/services/apiClient';
import { withSSRAuth } from '~/utils/withSSRAuth';

export default function Dashboard() {
  const effectRan = useRef(false);

  const { user, signOut } = useAuth();

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list'],
  });

  useEffect(() => {
    if (!effectRan.current)
      api.get('/me').catch((err) => {
        console.log(err);
      });

    return () => {
      effectRan.current = true;
    };
  }, []);

  return (
    <>
      <Head>
        <title>AuthApp | Dashboard</title>
      </Head>
      <div>
        <h1>{userCanSeeMetrics && 'Métricas 1'}</h1>
        <h1>Dashboard: {`${user?.email}`}</h1>

        <button
          onClick={() => {
            authChannel.postMessage('signOut');
          }}
        >
          Sair
        </button>

        <Can permissions={['metrics.create']}>Métricas 2</Can>
      </div>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  await apiClient.get('/me');

  return { props: {} };
});
