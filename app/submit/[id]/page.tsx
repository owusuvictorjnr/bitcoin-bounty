'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { submitSolution } from '@/lib/firebase/firestoreService';
import { useAuth } from '@/context/Authcontext';




export default function SubmitSolution() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [githubRepo, setGithubRepo] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      await submitSolution(
        {
          bountyId: id,
          developerId: firebaseUser?.uid || '',
          githubRepoUrl: githubRepo,
          deployedUrl,
          commitHash,
          solutionHash: commitHash, 
          hostedSolutionUrl: '',    
          comments: '',            
        },
        firebaseUser?.displayName || 'Anonymous'
      );
      router.push(`/bounties/${id}`);
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Submit Your Solution</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="githubRepo" className="block text-sm font-medium text-gray-700 mb-1">
            GitHub Repository URL
          </label>
          <input
            type="url"
            id="githubRepo"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="deployedUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Deployed Application URL
          </label>
          <input
            type="url"
            id="deployedUrl"
            value={deployedUrl}
            onChange={(e) => setDeployedUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="commitHash" className="block text-sm font-medium text-gray-700 mb-1">
            Commit Hash (for verification)
          </label>
          <input
            type="text"
            id="commitHash"
            value={commitHash}
            onChange={(e) => setCommitHash(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Solution'}
          </button>
        </div>
      </form>
    </div>
  );
}