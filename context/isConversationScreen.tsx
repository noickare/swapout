import { useRouter } from 'next/router';
import { createContext, useContext, Context, useState, useEffect } from 'react';

interface IIsConversationContext {
    isConversationScreen: boolean
}

interface IIsConversationProviderProps {
  children: React.ReactNode
}

const isConversationPageContext = createContext<IIsConversationContext>({
  isConversationScreen: false,
});

export function IsConversationPageProvider({ children }: IIsConversationProviderProps) {
  const [isConvoPage, setIsConvePage] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if(router.pathname.includes("conversations")) {
      setIsConvePage(true)
    } else {
      setIsConvePage(false)
    }
  }, [router.pathname])
  return <isConversationPageContext.Provider value={{isConversationScreen: isConvoPage}}>{children}</isConversationPageContext.Provider>;
}


export const useIsConversationScreen = () => useContext(isConversationPageContext);