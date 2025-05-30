"use client";
import { useState, FormEvent } from 'react';

interface SubmissionFormProps {
  bountyId: string;
  onSubmit: (data: {
    githubRepoUrl: string;
    deployedUrl: string;
    commitHash: string;
    solutionHash: string;
    hostedSolutionUrl?: string;
    comments?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function SubmissionForm({  onSubmit, isLoading }: SubmissionFormProps) {
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [solutionHash, setSolutionHash] = useState('');
  const [hostedSolutionUrl, setHostedSolutionUrl] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!githubRepoUrl.trim() || !deployedUrl.trim() || !commitHash.trim() || !solutionHash.trim()) {
      alert("All required fields must be filled.");
      return;
    }

    onSubmit({
      githubRepoUrl,
      deployedUrl,
      commitHash,
      solutionHash,
      hostedSolutionUrl,
      comments,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg border mt-6">
      <h3 className="text-lg font-semibold text-gray-800">Submit Your Solution</h3>

      <div>
        <label htmlFor="githubRepoUrl" className="block text-sm font-medium text-gray-700">GitHub Repository URL *</label>
        <input type="url" id="githubRepoUrl" value={githubRepoUrl} onChange={e => setGithubRepoUrl(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>

      <div>
        <label htmlFor="deployedUrl" className="block text-sm font-medium text-gray-700">Deployed App URL *</label>
        <input type="url" id="deployedUrl" value={deployedUrl} onChange={e => setDeployedUrl(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>

      <div>
        <label htmlFor="commitHash" className="block text-sm font-medium text-gray-700">Commit Hash *</label>
        <input type="text" id="commitHash" value={commitHash} onChange={e => setCommitHash(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>

      <div>
        <label htmlFor="solutionHash" className="block text-sm font-medium text-gray-700">Solution Hash *</label>
        <input type="text" id="solutionHash" value={solutionHash} onChange={e => setSolutionHash(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>

      <div>
        <label htmlFor="hostedSolutionUrl" className="block text-sm font-medium text-gray-700">Hosted Solution URL (Optional)</label>
        <input type="url" id="hostedSolutionUrl" value={hostedSolutionUrl} onChange={e => setHostedSolutionUrl(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments (Optional)</label>
        <textarea id="comments" value={comments} onChange={e => setComments(e.target.value)} rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
        {isLoading ? 'Submitting...' : 'Submit Solution'}
      </button>
    </form>
  );
}
