import { destroyCookie } from 'nookies';
import { useEffect, useRef } from 'react';
import { useAuth } from '~/context/AuthContext';
import { setupAPIClient } from '~/services/api';
import { api } from '~/services/apiClient';
import { AuthTokenError } from '~/services/errors/AuthTokenError';
import { withSSRAuth } from '~/utils/withSSRAuth';

export default function Dashboard() {
  const effectRan = useRef(false);

  const { user } = useAuth();

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

  return <h1>Dashboard: {`${user?.email}`}</h1>;
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');

  return { props: {} };
});
