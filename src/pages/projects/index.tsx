import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

export default function Projects() {
  return (
    <>
      <SEO title="Projects" description="My projects showcase" />
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Projects</h1>
          <p>This page will showcase all the projects I have worked on.</p>
        </main>
        <Footer />
      </div>
    </>
  );
}
