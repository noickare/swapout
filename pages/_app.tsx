import '../styles/main.css'
require('../styles/antd.less')
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react';
import NextNProgress from 'nextjs-progressbar'
import { AuthUserProvider } from '../context/authContext';
import GooglePlacesScript from '../components/scripts/GooglePlaces';
import { IsConversationPageProvider } from '../context/isConversationScreen';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import("../components/nav/Navbar"), {
  ssr: false,
});

function MyApp({ Component, pageProps }: AppProps) {
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
