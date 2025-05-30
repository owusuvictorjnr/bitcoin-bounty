import { db } from './config';
import { UserProfile, AuditLogEntry } from '@/types';
import { doc, setDoc, query, where, orderBy, Timestamp, getDocs, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';


import { Bounty } from '@/types'; // Ensure Bounty type is imported

import { Submission } from '@/types'; // Ensure Submission type is imported


export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  role: 'company' | 'developer',
  companyName?: string
): Promise<UserProfile> => {
  const userProfile: UserProfile = {
    uid,
    email,
    displayName,
    role,
    ...( role === 'company' && companyName ? {companyName}: {}), // Only include companyName if role is 'company'
    createdAt: serverTimestamp() as any, // Cast because serverTimestamp is a sentinel
  };
  await setDoc(doc(db, 'users', uid), userProfile);
  await addAuditLogEntry({
    eventType: 'USER_CREATED',
    actorUserId: uid,
    actorDisplayName: displayName,
    targetUserId: uid,
    details: `User <span class="math-inline">\{displayName\} \(</span>{email}) created as ${role}.`
  });
  return userProfile;
};

export const addAuditLogEntry = async (
  entryData: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<string> => {
  const auditEntry: Omit<AuditLogEntry, 'id'> & { timestamp: any } = {
    ...entryData,
    timestamp: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'auditLog'), auditEntry);
  console.log("Audit log added with ID: ", docRef.id);
  return docRef.id;
};



export const getOpenBounties = async (): Promise<Bounty[]> => {
  const bountiesCol = collection(db, 'bounties');
  const q = query(
    bountiesCol,
    where('status', '==', 'OPEN'), 
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),

    // Ensure Timestamps are correctly handled if not automatically converted
    createdAt: doc.data().createdAt as Timestamp,
    deadline: doc.data().deadline as Timestamp | undefined,
  })) as Bounty[];
};




export const postBounty = async (
  bountyData: Omit<Bounty, 'id' | 'createdAt' | 'status' | 'companyName'>,
  actorDisplayName: string
): Promise<string> => {
  const newBountyRef = doc(collection(db, 'bounties')); // Auto-generate ID
  const newBounty: Bounty = {
    ...bountyData,
    id: newBountyRef.id,
    status: 'OPEN', // [cite: 4]
    createdAt: serverTimestamp() as Timestamp,
    // companyName: bountyData.companyName, // This should come from UserProfile or passed in
  };
  await setDoc(newBountyRef, newBounty);

  await addAuditLogEntry({
    eventType: 'BOUNTY_POSTED',
    actorUserId: bountyData.companyId,
    actorDisplayName: actorDisplayName,
    targetBountyId: newBounty.id,
    targetBountyTitle: newBounty.title,
    details: `Bounty "${newBounty.title}" posted for ${newBounty.bountyAmountBTC} BTC.`
  });
  return newBounty.id;
};



export const getBountyById = async (id: string): Promise<Bounty | null> => {
  const docRef = doc(db, 'bounties', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Bounty;
  }
  return null;
};

export const submitSolution = async (
  submissionData: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'developerName'>,
  actorDisplayName: string
): Promise<string> => {
  const newSubmissionRef = doc(collection(db, 'submissions')); // Auto-generate ID
  const newSubmission: Submission = {
    ...submissionData,
    id: newSubmissionRef.id,
    submittedAt: serverTimestamp() as Timestamp,
    status: 'PENDING_REVIEW', 
    developerName: actorDisplayName, // Passed in
  };
  await setDoc(newSubmissionRef, newSubmission);

  
  await addAuditLogEntry({
    eventType: 'SUBMISSION_RECEIVED',
    actorUserId: submissionData.developerId,
    actorDisplayName: actorDisplayName,
    targetBountyId: submissionData.bountyId,
    targetBountyTitle: (await getBountyById(submissionData.bountyId))?.title, // Fetch if needed
    targetSubmissionId: newSubmission.id,
    details: `Solution submitted for bounty ID ${submissionData.bountyId} by ${actorDisplayName}. GitHub: ${submissionData.githubRepoUrl}` // [cite: 2, 3]
  });
  return newSubmission.id;
};

export const getSubmissionsForBounty = async (bountyId: string): Promise<Submission[]> => {
    const submissionsCol = collection(db, 'submissions');
    const q = query(submissionsCol, where('bountyId', '==', bountyId), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt as Timestamp,
    })) as Submission[];
};

export const selectWinnerForBounty = async (
    bountyId: string,
    winningSubmissionId: string,
    winnerId: string, // developerId
    actorUserId: string,
    actorDisplayName: string,
    bountyTitle: string
): Promise<void> => {
    const bountyRef = doc(db, 'bounties', bountyId);
    const submissionRef = doc(db, 'submissions', winningSubmissionId);

    // Update bounty status and link winner
    await updateDoc(bountyRef, {
        status: 'CLOSED', 
        winnerId: winnerId,
        winningSubmissionId: winningSubmissionId,
    });

    // Update submission status
    await updateDoc(submissionRef, {
        status: 'WINNER',
    });


    await addAuditLogEntry({
        eventType: 'WINNER_SELECTED',
        actorUserId: actorUserId,
        actorDisplayName,
        targetBountyId: bountyId,
        targetBountyTitle: bountyTitle,
        targetSubmissionId: winningSubmissionId,
        targetUserId: winnerId,
        details: `Winner selected for bounty "${bountyTitle}". Submission ID: ${winningSubmissionId}. Winner: ${winnerId}`
    });
};

export const markBountyAsPaid = async (
    bountyId: string,
    actorUserId: string,
    actorDisplayName: string,
    bountyTitle: string,
    btcAmount: number
): Promise<void> => {
    const bountyRef = doc(db, 'bounties', bountyId);
    await updateDoc(bountyRef, {
        status: 'PAID', // [cite: 5]
    });

    await addAuditLogEntry({
        eventType: 'BOUNTY_PAYMENT_MARKED_PAID',
        actorUserId: actorUserId,
        actorDisplayName,
        targetBountyId: bountyId,
        targetBountyTitle: bountyTitle,
        details: `Bounty "${bountyTitle}" marked as paid. Amount: ${btcAmount} BTC.`
    });
};


export const getAuditLogEntries = async (limitCount: number = 50): Promise<AuditLogEntry[]> => {
    const auditCol = collection(db, 'auditLog');
    const q = query(auditCol, orderBy('timestamp', 'desc'), where('timestamp', '!=', null)); //  limit(limitCount) if desired
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp as Timestamp,
    })) as AuditLogEntry[];
  };


  export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
        return userDocSnap.data() as UserProfile;
    }
    return null;
};

export const updateUserBtcAddress = async (uid: string, btcAddress: string): Promise<void> => {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { btcAddress });
};
