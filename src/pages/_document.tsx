// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Primary Favicon */}
          <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
          <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />

          {/* Android Chrome Icons */}
          <link rel="icon" sizes="192x192" href="/android-chrome-192x192.png" />
          <link rel="icon" sizes="512x512" href="/android-chrome-512x512.png" />

          {/* Apple Touch Icon */}
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

          {/* Web Manifest for PWA support */}
          <link rel="manifest" href="/site.webmanifest" />

          {/* Page Title */}
          <title>Aaron Bernard Portfolio</title>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
