"use client";
import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { UserProfile as UserProfileType } from '@/types';
import { getUserProfile, updateUserBtcAddress } from '@/lib/firebase/firestoreService';
import { Loader2, UserCircle, Bitcoin, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/Authcontext';


export default function UserProfilePage() {
    const params = useParams();
    const profileUserId = params.userId as string;
    const { firebaseUser, userProfile: authUserProfile, loading: authLoading } = useAuth();

    const [profileData, setProfileData] = useState<UserProfileType | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [btcAddress, setBtcAddress] = useState('');
    const [isEditingBtc, setIsEditingBtc] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        if (!profileUserId) return;
        const fetchProfile = async () => {
            setLoadingProfile(true);
            setError(null);
            try {
                const data = await getUserProfile(profileUserId);
                if (data) {
                    setProfileData(data);
                    if (data.role === 'developer' && data.btcAddress) {
                        setBtcAddress(data.btcAddress);
                    }
                } else {
                    setError("User profile not found.");
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile.");
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [profileUserId]);

    const isOwnProfile = firebaseUser && firebaseUser.uid === profileUserId;

    const handleBtcAddressUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!isOwnProfile || !profileData || profileData.role !== 'developer') return;
        setUpdateLoading(true);
        try {
            await updateUserBtcAddress(profileUserId, btcAddress);
            setProfileData(prev => prev ? { ...prev, btcAddress } : null);
            setIsEditingBtc(false);
            alert("BTC Address updated successfully!");
        } catch (err) {
            console.error("Error updating BTC address:", err);
            alert("Failed to update BTC address.");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (authLoading || loadingProfile) return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
    if (!profileData) return <p className="text-center text-gray-600 mt-10">Profile not available.</p>;

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
            <div className="flex items-center mb-6">
                <UserCircle size={64} className="text-gray-500 mr-4" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{profileData.displayName}</h1>
                    <p className="text-gray-600">{profileData.email}</p>
                </div>
            </div>

            <div className="space-y-3 text-gray-700">
                <p><strong>Role:</strong> <span className="capitalize">{profileData.role}</span></p>
                {profileData.role === 'company' && profileData.companyName && (
                    <p><strong>Company:</strong> {profileData.companyName}</p>
                )}
                <p><strong>Joined:</strong> {format(profileData.createdAt.toDate(), 'PPP')}</p>

                {profileData.role === 'developer' && isOwnProfile && (
                    <div className="mt-6 pt-6 border-t">
                        <h2 className="text-xl font-semibold mb-3 flex items-center">
                            <Bitcoin size={20} className="mr-2 text-yellow-500" /> Bitcoin Address for Bounties
                        </h2>
                        {isEditingBtc ? (
                            <form onSubmit={handleBtcAddressUpdate} className="space-y-3">
                                <input
                                    type="text"
                                    value={btcAddress}
                                    onChange={(e) => setBtcAddress(e.target.value)}
                                    placeholder="Enter your Bitcoin address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    required
                                />
                                <div className="flex gap-2">
                                    <button type="submit" disabled={updateLoading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center">
                                        <Save size={16} className="mr-1"/> {updateLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button type="button" onClick={() => setIsEditingBtc(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-center justify-between">
                                <p className="text-sm break-all">{profileData.btcAddress || "No BTC address set."}</p>
                                <button onClick={() => setIsEditingBtc(true)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                                    {profileData.btcAddress ? 'Edit' : 'Add Address'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                 {profileData.role === 'developer' && !isOwnProfile && profileData.btcAddress && (
                    <p className="mt-2 text-sm"><strong>BTC Address:</strong> {profileData.btcAddress} (For bounty payouts)</p>
                )}
            </div>

            {/* TODO: List bounties posted by company or submissions by developer */}
        </div>
    );
}