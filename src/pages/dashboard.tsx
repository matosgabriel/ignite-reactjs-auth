import { useEffect, useRef } from 'react';
import { useAuth } from '~/context/AuthContext';
import { api } from '~/services/api';

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
