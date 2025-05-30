import { getAuth } from 'firebase/auth';
import { getBountyById } from './firebase/firestoreService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const sendBitcoinPayment = async (bountyId: string, winnerId: string) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  //  Get the bounty details
  const bounty = await getBountyById(bountyId);
  if (!bounty) {
    throw new Error('Bounty not found');
  }

  //  Get the winner's Bitcoin address
  const winnerProfile = await getUserProfileById(winnerId);
  if (!winnerProfile || !winnerProfile.btcAddress) {
    throw new Error('Winner does not have a Bitcoin address');
  }

  //  Initiate the Bitcoin transaction
  const transactionResult = await sendBitcoinTransaction({
    fromAddress: user.email ?? (() => { throw new Error('Authenticated user does not have an email address'); })(), // Ensure email is not null
    toAddress: winnerProfile.btcAddress,
    amount: bounty.bountyAmountBTC,
  });

  if (!transactionResult.success) {
    throw new Error('Bitcoin transaction failed');
  }

  console.log(`BTC payment sent for bounty ${bountyId} to user ${winnerId}`);

  return {
    success: true,
    transactionId: transactionResult.transactionId,
    timestamp: new Date().toISOString(),
  };
};

// Function to fetch user profile by ID
export const getUserProfileById = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error('User not found');
  }
  return userSnap.data();
};

// Hypothetical Bitcoin transaction service
export const sendBitcoinTransaction = async ({ fromAddress, toAddress, amount }: { fromAddress: string; toAddress: string; amount: number }) => {
  if (!fromAddress) {
    throw new Error('Sender address is required');
  }
  // Simulate a Bitcoin transaction
  console.log(`Sending ${amount} BTC from ${fromAddress} to ${toAddress}`);
  return {
    success: true,
    transactionId: `tx-${Date.now()}`,
  };
};