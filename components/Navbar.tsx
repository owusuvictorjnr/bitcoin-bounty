"use client";

import Link from 'next/link';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { LogIn, LogOut, UserPlus, Briefcase, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/Authcontext';

export default function Navbar() {
  const { firebaseUser, userProfile, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // User will be redirected or UI will update via AuthContext
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-sm md:text-xl font-bold hover:text-yellow-400 transition-colors">
          ₿ Bounty Platform
        </Link>
        <div className="space-x-3 md:space-x-5 flex items-center">
          <Link href="/" className="hover:text-yellow-400 flex items-center gap-1">
            <Search className='hidden md:block' size={18}/>
             Bounties
          </Link>
          {userProfile?.role === 'company' && (
            <Link href="/bounties/post" className="hover:text-yellow-400 flex items-center gap-1">
              <Briefcase className='hidden md:block' size={18} /> Post Challenge
            </Link>
          )}
           <Link href="/audit-log" className="hover:text-yellow-400 flex items-center gap-1">
              <ShieldCheck className='hidden md:block' size={18}/> Audit Log
          </Link>

          {loading ? (
            <span className="text-sm">Loading...</span>
          ) : firebaseUser ? (
            <>
              <Link href={`/profile/${firebaseUser.uid}`} className="hover:text-yellow-400 text-sm">
                {userProfile?.displayName || firebaseUser.email}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
              >
                <LogOut size={16}/> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-yellow-400 flex items-center gap-1">
                 <LogIn className='hidden md:block' size={18}/> Login
              </Link>
              <Link href="/auth/signup"
                className="bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
              >
                <UserPlus className='hidden md:block' size={16}/> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}