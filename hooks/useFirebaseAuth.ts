import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react'
import { signOut } from "firebase/auth";
import { openNotificationWithIcon } from '../components/notification/Notification';
import { IUser } from '../models/user';
import { getUser } from '../services/firestore/users';
import { firebaseAuth } from '../services/init_firebase';


export default function useFirebaseAuth() {
    const [authUser, setAuthUser] = useState<IUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useRouter();

    const getUserDetails = useCallback(async (user: User) => {
        try {
            const userDetails = await getUser(user.uid);
            setAuthUser(userDetails);
        } catch (error: any) {
            if (error.message.includes('User not found')) {
                await signOut(firebaseAuth);
                router.push('/login');
            } else {
                console.log(error);
                openNotificationWithIcon('error', 'Internal server error', 'Something went wrong, please try again!');
            }
        }
    }, [router]);
    
    useEffect(() => {
        const unsubscribe = firebaseAuth.onAuthStateChanged((authState) => {
            if (!authState) {
                setAuthUser(null);
                setAuthLoading(false);
                return;
            } else {
                setAuthLoading(true);
                getUserDetails(authState);
                setAuthLoading(false);

            }
        });
        return () => unsubscribe();
    }, []);

    return {
        authUser,
        authLoading
    };
}