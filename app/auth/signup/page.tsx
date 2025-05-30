"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createUserProfile } from '@/lib/firebase/firestoreService';
import Link from 'next/link';
import { useAuth } from '@/context/Authcontext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'developer' | 'company'>('developer');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const { firebaseUser } = useAuth();

useEffect(() => {
  if (firebaseUser) {
    router.push('/'); // Redirect to homepage if user is already logged in
  }
}, [firebaseUser, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (role === 'company' && !companyName.trim()) {
        setError("Company name is required for company accounts.");
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await createUserProfile(user.uid, user.email!, displayName, role, companyName);
      router.push('/'); // Redirect to homepage after signup
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError("An account with this email already exists. Try logging in instead.");
        } else {
          setError("Signup failed: " + err.message);
        }
        console.error("Signup error:", err);
      }finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-5">

        
        {/* ... (Input fields for displayName, email, password, role, companyName) ... */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
          <input type="text" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
         <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am a...</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'developer' | 'company')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="developer">Developer</option>
                <option value="company">Company</option>
            </select>
        </div>
        {role === 'company' && (
             <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
          Log in
        </Link>
      </p>
    </div>
  );
}