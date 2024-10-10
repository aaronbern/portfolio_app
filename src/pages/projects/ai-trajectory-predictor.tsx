import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

export default function AITrajectoryPredictor() {
  return (
    <>
      <SEO title="AI Trajectory Predictor" description="Learn about the AI Trajectory Predictor project" />
      <div className='min-h-screen bg-gray-100'>
        <Navbar />
        <main className='container mx-auto py-8'>
          <h1 className='text-3xl font-bold'>AI Trajectory Predictor</h1>
          <p className='mt-4'>
            This project is an AI-powered tool that uses reinforcement learning to predict object trajectories in videos.
            Upload your video and see the power of machine learning in action.
          </p>
          <div className='mt-8'>
            {/* Add an interactive demo for the AI Trajectory Predictor */}
            {/* Placeholder for video upload and prediction output */}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
