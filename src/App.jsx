import { useEffect, useState } from 'react';

export default function App() {
  const [experts, setExperts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch('/api/experts')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((body) => {
        setExperts(body.data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <main>
      <h1>Expert Listing</h1>
      {status === 'loading' && <p>Loading experts…</p>}
      {status === 'error' && <p role="alert">Could not load experts. Please try again later.</p>}
      {status === 'ready' && (
        <ul>
          {experts.map((expert) => (
            <li key={expert.id}>
              <strong>{expert.name}</strong>
              <span>{expert.specialty} · {expert.city}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
