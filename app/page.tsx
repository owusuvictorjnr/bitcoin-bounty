"use client"; 

import { useEffect, useState } from 'react';
import { Bounty } from '@/types';
import { getOpenBounties } from '@/lib/firebase/firestoreService';
import { Loader2 } from 'lucide-react';
import BountyCard from '@/components/BountyCard';

export default function HomePage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBounties = async () => {
      setLoading(true);
      try {
        const openBounties = await getOpenBounties();
        setBounties(openBounties);
      } catch (err) {
        console.error("Failed to fetch bounties:", err);
        setError("Could not load bounties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBounties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-3 text-lg">Loading Bounties...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Discover Bitcoin-Powered Job Challenges
      </h1>
      {bounties.length === 0 ? (
        <p className="text-center text-gray-600">No open bounties at the moment. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      )}
    </div>
  );
}