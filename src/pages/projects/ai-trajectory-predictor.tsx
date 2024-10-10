import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { useState } from 'react';

export default function AITrajectoryPredictor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      // Implement secure upload logic here
      console.log('Uploading:', selectedFile.name);
    }
  };

  return (
    <>
      <SEO title="AI Trajectory Predictor" description="Learn about the AI Trajectory Predictor project" />
      <div className='min-h-screen bg-gray-100'>
        <Navbar />
        <main className='container mx-auto py-8'>
          <h1 className='text-3xl font-bold'>AI Trajectory Predictor</h1>
          <p className='mt-4'>
            This project is an AI-powered tool that uses reinforcement learning to predict object trajectories in videos.
            You can upload your own video to see the predictions.
          </p>
          <div className='mt-8'>
            <input type='file' accept='video/*' onChange={handleFileChange} />
            <button onClick={handleFileUpload} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mt-4'>
              Upload and Predict
            </button>
            {selectedFile && (
              <div className='mt-2'>
                <p>Selected File: {selectedFile.name}</p>
              </div>
            )}
          </div>
          <p className='text-sm text-gray-600 mt-4'>
            Note: The video is processed securely, and we do not store user-uploaded videos.
          </p>
        </main>
        <Footer />
      </div>
    </>
  );
}
