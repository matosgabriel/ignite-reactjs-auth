import { authChannel, useAuth } from '~/context/AuthContext';
import { FormEvent, useState } from 'react';
import styles from '../../styles/Home.module.css';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import { withSSRGuest } from '~/utils/withSSRGuest';
import Head from 'next/head';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = { email, password };

    await signIn(data);
  }

  return (
    <>
      <Head>
        <title>AuthApp | Entrar</title>
      </Head>
      <form className={styles.container} onSubmit={(e) => handleSubmit(e)}>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type='submit'>Entrar</button>
      </form>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withSSRGuest(
  async (ctx) => {
    return { props: {} };
  }
);
