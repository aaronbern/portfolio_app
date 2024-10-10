import '../styles/globals.css';
import SEO from '../components/SEO';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <SEO title="My Portfolio" description="A showcase of my projects and experience" />
      <div className='min-h-screen bg-gray-100'>
        <Navbar />
        <main>
          {/* Introduction and project highlights will go here */}
        </main>
        <Footer />
      </div>
    </>
  );
}