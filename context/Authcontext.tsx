"use client";

import React,  { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null | undefined;
  userProfile: UserProfile | null | undefined;
  loading: boolean;
  error: Error | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, loadingAuth, errorAuth] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null | undefined>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (firebaseUser) {
        setLoadingProfile(true);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            // This case might happen if user profile creation failed or is pending
            setUserProfile(null); // Or handle as an error/incomplete profile state
            console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUserProfile(null); // Or set an error state
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [firebaseUser]);

  const loading = loadingAuth || loadingProfile;

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, error: errorAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};