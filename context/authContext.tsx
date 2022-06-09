import { createContext, useContext, Context } from 'react';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import { IUser } from '../models/user';

interface IAUthUserContext {
    authUser: IUser | null,
    authLoading: boolean
}

interface AUthUserPRoviderProps {
  children: React.ReactNode
}

const authUserContext = createContext<IAUthUserContext>({
  authUser: null,
  authLoading: true
});

export function AuthUserProvider({ children }: AUthUserPRoviderProps) {
  const auth = useFirebaseAuth();
  return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>;
}


export const useAuth = () => useContext(authUserContext);