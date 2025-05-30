"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postBounty } from '@/lib/firebase/firestoreService';
import { Bounty } from '@/types'; // For Omit type
import BountyForm from '@/components/BountyForm';
import { useAuth } from '@/context/Authcontext';
import withAuth from '@/utils/withAuth';

function PostBountyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, firebaseUser } = useAuth(); // this ensure userProfile contains companyName
  const router = useRouter();

  const handleSubmit = async (bountyData: Omit<Bounty, 'id' | 'createdAt' | 'status' | 'companyId' | 'companyName'>) => {
    if (!firebaseUser || !userProfile || userProfile.role !== 'company') {
      setError("You must be logged in as a company to post a bounty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fullBountyData = {
        ...bountyData,
        companyId: firebaseUser.uid,
        companyName: userProfile.companyName || userProfile.displayName || 'Unknown Company',
      };
      const bountyId = await postBounty(fullBountyData, userProfile.displayName || firebaseUser.email!);
      router.push(`/bounties/${bountyId}`);
    } catch (err: any) {
      console.error("Failed to post bounty:", err);
      setError(err.message || "Could not post bounty.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Post a New Job Challenge</h1>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
      <BountyForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
// Protected  route for 'company' users only
export default withAuth(PostBountyPage, ['company']);