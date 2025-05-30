"use client";
import { useState, FormEvent } from 'react';
import { Bounty } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface BountyFormProps {
  onSubmit: (bountyData: Omit<Bounty, 'id' | 'createdAt' | 'status' | 'companyId' | 'companyName'>) => Promise<void>;
  initialData?: Partial<Bounty>;
  isLoading: boolean;
}

export default function BountyForm({ onSubmit, initialData = {}, isLoading }: BountyFormProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [skills, setSkills] = useState((initialData.skills || []).join(', '));
  const [bountyAmountBTC, setBountyAmountBTC] = useState<string>(String(initialData.bountyAmountBTC || ''));
  const [deadline, setDeadline] = useState<string>(
    initialData.deadline ? new Date(initialData.deadline.seconds * 1000).toISOString().split('T')[0] : ''
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const bountyData = {
      title,
      description,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      bountyAmountBTC: parseFloat(bountyAmountBTC),
      deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : undefined,
    };
    await onSubmit(bountyData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Challenge Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
        <input
          type="text"
          id="skills"
          value={skills}
          onChange={e => setSkills(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="bountyAmountBTC" className="block text-sm font-medium text-gray-700">Bounty Amount (BTC)</label>
        <input
          type="number"
          step="0.00000001"
          id="bountyAmountBTC"
          value={bountyAmountBTC}
          onChange={e => setBountyAmountBTC(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
        <input
          type="date"
          id="deadline"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
      >
        {isLoading ? 'Submitting...' : (initialData.id ? 'Update Bounty' : 'Post Bounty')}
      </button>
    </form>
  );
}
