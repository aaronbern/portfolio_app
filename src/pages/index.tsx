import '../styles/globals.css';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  return (
    <>
      <SEO title="My Portfolio" description="A showcase of my projects and experience" />
      <div className='min-h-screen bg-gray-100'>
        <Navbar />
        <main className='container mx-auto py-8'>
          <section className='mb-8'>
            <h1 className='text-4xl font-bold'>Welcome to My Portfolio</h1>
            <p className='mt-4 text-lg'>I'm an aspiring software developer passionate about creating innovative projects.</p>
          </section>
          <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <ProjectCard
              title="AI Trajectory Predictor"
              description="An AI-powered tool that predicts object trajectories in videos."
              link="/projects/ai-trajectory-predictor"
            />
            <ProjectCard
              title="MERN Chat App"
              description="A real-time chat application built with the MERN stack."
              link="/projects/mern-chat"
            />
            <ProjectCard
              title="3D Graphics Engine"
              description="A basic graphics engine to render 3D objects."
              link="/projects/graphics-engine"
            />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
