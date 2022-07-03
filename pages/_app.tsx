import '../styles/main.css'
require('../styles/antd.less')
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react';
import NextNProgress from 'nextjs-progressbar'
import { AuthUserProvider } from '../context/authContext';
import GooglePlacesScript from '../components/scripts/GooglePlaces';
import { IsConversationPageProvider } from '../context/isConversationScreen';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { fireApp, firebaseCloudMessaging } from '../services/init_firebase';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';



const Navbar = dynamic(() => import("../components/nav/Navbar"), {
  ssr: false,
});

function MyApp({ Component, pageProps }: AppProps) {

  const [mounted, setMounted] = useState(false);

  if (mounted) {
    firebaseCloudMessaging.onMessage();
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeAppCheck(fireApp, {
        provider: new ReCaptchaV3Provider("6LeRe6ogAAAAAPGOgykIk3md6xZKCueBkNuTnx7Y"),
        isTokenAutoRefreshEnabled: true,
      });
    }
    firebaseCloudMessaging.init();
    const setToken = async () => {
      const token = await firebaseCloudMessaging.tokenInlocalforage();
      if (token) {
        setMounted(true);
        // not working
      }
    };
    const result = setToken();
  }, []);

  return (
    <NextUIProvider>
      <NextNProgress
        color="#b122dd"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow={true}
      />
      <AuthUserProvider>
        <IsConversationPageProvider>
          <GooglePlacesScript />
          <Navbar />
          <Component {...pageProps} />
        </IsConversationPageProvider>
      </AuthUserProvider>
    </NextUIProvider>
  )
}

export default MyApp
