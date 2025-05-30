"use client";
import { useRouter }    from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/Authcontext';

type UserRole = 'developer' | 'company' | undefined;

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) => {
  const ComponentWithAuth = (props: P) => {
    const { firebaseUser, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!firebaseUser) {
          router.replace('/auth/login?message=Please login to access this page.&redirect=' + window.location.pathname);
        } else if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
          router.replace('/?message=You do not have permission to access this page.');
        }
      }
    }, [firebaseUser, userProfile, loading, router, allowedRoles]);

    if (loading || !firebaseUser || (allowedRoles && !userProfile)) {
      return (
        <div className="flex justify-center items-center h-screen">
           <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      );
    }
    // Additional check for role if userProfile is loaded but doesn't match
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
         return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-xl text-red-500">Access Denied</p>
                <p>You do not have the required role to view this page.</p>
            </div>
        );
    }


    return <WrappedComponent {...props} />;
  };
  return ComponentWithAuth;
};

export default withAuth;