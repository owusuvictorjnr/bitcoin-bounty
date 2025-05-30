"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bounty, Submission } from '@/types';
import { getBountyById, submitSolution, getSubmissionsForBounty, selectWinnerForBounty, markBountyAsPaid } from '@/lib/firebase/firestoreService';
import { format } from 'date-fns';
import { Loader2, Award, Briefcase, CalendarDays, Link as  CheckCircle, XCircle, Hourglass, ShieldQuestion, Bitcoin, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/Authcontext';
import SubmissionForm from '@/components/SubmissionForm';

export default function BountyDetailsPage() {
  const params = useParams();
  const bountyId = params.id as string;
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { firebaseUser, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!bountyId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const bountyData = await getBountyById(bountyId);
        if (!bountyData) {
          setError("Bounty not found.");
          setLoading(false);
          return;
        }
        setBounty(bountyData);


        // Fetch submissions if the current user is the company that posted it or if bounty is closed or paid
        if (userProfile && bountyData.companyId === userProfile.uid || ['CLOSED', 'PAID'].includes(bountyData.status)) {
            const submissionData = await getSubmissionsForBounty(bountyId);
            setSubmissions(submissionData);
        }

      } catch (err) {
        console.error("Error fetching bounty details:", err);
        setError("Failed to load bounty details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bountyId, userProfile]); // Re-fetch if userProfile changes ( after login)

  const handleSolutionSubmit = async (data: { githubRepoUrl: string; solutionHash: string; hostedSolutionUrl?: string; comments?: string }) => {
    if (!firebaseUser || !userProfile || userProfile.role !== 'developer') {
      alert("Please login as a developer to submit.");
      router.push(`/auth/login?redirect=/bounties/${bountyId}`);
      return;
    }
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...data,
        bountyId: bountyId,
        developerId: firebaseUser.uid,
      };
      await submitSolution(submissionData, userProfile.displayName || firebaseUser.email!);
      alert("Solution submitted successfully!");

      // Refresh submissions or add to local state
      const updatedSubmissions = await getSubmissionsForBounty(bountyId);
      setSubmissions(updatedSubmissions);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit solution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectWinner = async (submission: Submission) => {
    if (!bounty || !userProfile || userProfile.role !== 'company' || bounty.companyId !== userProfile.uid) return;
    setActionLoading(true);
    try {
        await selectWinnerForBounty(bounty.id, submission.id, submission.developerId, userProfile.uid, userProfile.displayName || firebaseUser?.email!, bounty.title);
        alert(`Selected ${submission.developerName} as winner!`);
        
        // Refresh bounty data
        const updatedBounty = await getBountyById(bountyId);
        setBounty(updatedBounty);
        const updatedSubmissions = await getSubmissionsForBounty(bountyId); // Refresh to show winner status
        setSubmissions(updatedSubmissions);

    } catch (err) {
        console.error("Error selecting winner:", err);
        alert("Failed to select winner.");
    } finally {
        setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
     if (!bounty || !userProfile || userProfile.role !== 'company' || bounty.companyId !== userProfile.uid || bounty.status !== 'CLOSED') return;
     setActionLoading(true);
     try {
        await markBountyAsPaid(bounty.id, userProfile.uid, userProfile.displayName || firebaseUser?.email!, bounty.title, bounty.bountyAmountBTC);
        alert("Bounty marked as paid!");
        const updatedBounty = await getBountyById(bountyId);
        setBounty(updatedBounty);
     } catch (err) {
        console.error("Error marking as paid:", err);
        alert("Failed to mark as paid.");
     } finally {
        setActionLoading(false);
     }
  };


  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!bounty) return <p className="text-center text-gray-600 mt-10">Bounty details not available.</p>;

  const isCompanyOwner = userProfile && userProfile.role === 'company' && bounty.companyId === userProfile.uid;
  const canSubmit = userProfile && userProfile.role === 'developer' && bounty.status === 'OPEN' && !submissions.find(s => s.developerId === userProfile.uid);

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{bounty.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <p className="text-gray-600 flex items-center"><Briefcase size={16} className="mr-2 text-blue-500"/> By: {bounty.companyName}</p>
        <p className="text-yellow-600 font-semibold flex items-center"><Award size={16} className="mr-2 text-yellow-500"/> {bounty.bountyAmountBTC} BTC</p>
        <p className={`font-medium flex items-center ${
            bounty.status === 'OPEN' ? 'text-green-600' :
            bounty.status === 'CLOSED' ? 'text-red-600' :
            bounty.status === 'PAID' ? 'text-purple-600' :
            'text-gray-600'
        }`}>
            {bounty.status === 'OPEN' && <Hourglass size={16} className="mr-2"/>}
            {bounty.status === 'CLOSED' && <XCircle size={16} className="mr-2"/>}
            {bounty.status === 'PAID' && <CheckCircle size={16} className="mr-2"/>}
            {bounty.status === 'REVIEWING' && <ShieldQuestion size={16} className="mr-2"/>}
            Status: {bounty.status}
        </p>
         <p className="text-gray-500 flex items-center col-span-1 md:col-span-3"><CalendarDays size={16} className="mr-2 text-gray-400"/> Posted: {format(bounty.createdAt.toDate(), 'PPP')}</p>
        {bounty.deadline && <p className="text-red-500 flex items-center col-span-1 md:col-span-3"><CalendarDays size={16} className="mr-2"/> Deadline: {format(bounty.deadline.toDate(), 'PPP p')}</p>}
      </div>

      <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: bounty.description.replace(/\n/g, '<br />') }}></div>

      {bounty.skills && bounty.skills.length > 0 && (
        <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-1">Skills Required:</h3>
            <div className="flex flex-wrap gap-2">
                {bounty.skills.map(skill => <span key={skill} className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">{skill}</span>)}
            </div>
        </div>
      )}

      {/* Solution Submission Form for Developers */}
      {canSubmit && (
        <SubmissionForm bountyId={bountyId} onSubmit={handleSolutionSubmit} isLoading={isSubmitting} />
      )}
      {userProfile && userProfile.role === 'developer' && bounty.status === 'OPEN' && submissions.find(s => s.developerId === userProfile.uid) && (
         <p className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-center">You have already submitted a solution for this bounty.</p>
      )}


      {/* Submissions List for Company Owner */}
      {isCompanyOwner && (bounty.status === 'OPEN' || bounty.status === 'REVIEWING') && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Submissions ({submissions.length})</h2>
          {submissions.length === 0 ? <p>No submissions yet.</p> : (
            <ul className="space-y-4">
              {submissions.map(sub => (
                <li key={sub.id} className="p-4 border rounded-md bg-gray-50">
                  <p className="font-semibold">{sub.developerName || sub.developerId}</p>
                  <p className="text-sm text-gray-600">Submitted: {format(sub.submittedAt.toDate(), 'PPP p')}</p>
                  <p className="text-sm"><a href={sub.githubRepoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">GitHub Repo <ExternalLink size={14} className="ml-1"/></a></p>
                  <p className="text-sm">Hash: {sub.solutionHash}</p>
                  {sub.hostedSolutionUrl && <p className="text-sm"><a href={sub.hostedSolutionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">Hosted Solution <ExternalLink size={14} className="ml-1"/></a></p>}
                  {sub.comments && <p className="text-sm mt-1 italic">Comments: {sub.comments}</p>}
                  {bounty.status !== 'CLOSED' && bounty.status !== 'PAID' && (
                    <button onClick={() => handleSelectWinner(sub)} disabled={actionLoading}
                      className="mt-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">
                      {actionLoading ? 'Processing...' : 'Select as Winner'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

       {/* Display Winner Info */}
        { (bounty.status === 'CLOSED' || bounty.status === 'PAID') && bounty.winnerId && (
            <div className="mt-8 p-4 bg-green-50 border-l-4 border-green-500">
                <h3 className="text-xl font-semibold text-green-700 flex items-center"><Award size={20} className="mr-2"/> Winner Selected!</h3>
                {submissions.find(s => s.id === bounty.winningSubmissionId) ? (
                    <div className="mt-2 text-sm">
                        <p><strong>Developer:</strong> {submissions.find(s => s.id === bounty.winningSubmissionId)?.developerName}</p>
                        <p><strong>Submission:</strong> <a href={submissions.find(s => s.id === bounty.winningSubmissionId)?.githubRepoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View GitHub Repo</a></p>
                    </div>
                ) : <p>Winner details are being processed.</p>}

                {isCompanyOwner && bounty.status === 'CLOSED' && (
                    <button onClick={handleMarkAsPaid} disabled={actionLoading}
                        className="mt-4 px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center">
                        <Bitcoin size={16} className="mr-2"/> {actionLoading ? 'Processing...' : 'Mark Bounty as Paid'}
                    </button>
                )}
                 {bounty.status === 'PAID' && <p className="mt-3 text-purple-700 font-semibold">Bounty has been marked as PAID.</p>}
            </div>
        )}
    </div>
  );
}