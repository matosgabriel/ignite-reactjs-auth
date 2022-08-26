import { FormEvent, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = { email, password };

    console.log(data);
  }

  return (
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
  );
}
