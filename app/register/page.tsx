// pages/register.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // after successful registration, redirect to login
      router.push('/login');
    } catch  {
      setError;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 border rounded">
        <h1 className="text-xl font-semibold mb-4">Register</h1>
        <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="mb-2 w-full p-2 border" />
        <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="mb-2 w-full p-2 border" />
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <button type="submit" className="px-4 py-2 border rounded">Create account</button>
      </form>
    </div>
  );
}
