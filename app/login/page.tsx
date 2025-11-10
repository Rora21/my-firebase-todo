// pages/login.tsx
import { useState, useContext } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';
import { AuthContext } from '../utils/authContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useContext(AuthContext);

  if (user) {
    // if already logged in redirect to dashboard
    if (typeof window !== 'undefined') router.replace('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      setErr(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 border rounded">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="mb-2 w-full p-2 border" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="mb-2 w-full p-2 border" />
        {err && <p className="text-red-600">{err}</p>}
        <button type="submit" className="px-4 py-2 border rounded">Login</button>
      </form>
    </div>
  );
}
