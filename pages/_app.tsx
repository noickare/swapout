import '../styles/main.css'
require('../styles/antd.less')
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react';
import NextNProgress from 'nextjs-progressbar'
import Navbar from '../components/nav/Navbar';
import { AuthUserProvider } from '../context/authContext';
import GooglePlacesScript from '../components/scripts/GooglePlaces';

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
        <GooglePlacesScript />
        <Navbar />
        <Component {...pageProps} />
      </AuthUserProvider>
    </NextUIProvider>
  )
}

export default MyApp
