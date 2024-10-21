// Define the Project type (if needed)
export interface Project {
  id: number;
  title: string;
  description: string;
  image?: string;  // If you have images
  example?: string;
  link?: string; 
  videoPath?: string;
  detailedImage?: string;
}

// Export an array of projects
export const projects: Project[] = [
  {
    id: 1,
    title: 'Trajectory Oracle',
    description: 'Predicts object trajectories with reinforcement learning.',
    link: 'https://github.com/aaronbern/Trajectory-Oracle', // Link to GitHub repository
    image: '/traj.jpg', // Image for the project card
    videoPath: "/videos/output_with_trajectory.mp4", // Video for detailed view
    detailedImage: "/prediction.png" // Additional image for detailed view
  },
  {
    id: 2,
    title: 'Yap-Chat',
    description: 'A real-time web chat app built with the MERN stack.',
    link: 'https://yapp-chat-app-de1a44a0cf7e.herokuapp.com/',  // Link to live app
    image: '/chat.jpg', // Image for the project card
    detailedImage: "/selected_yap-chat.png" // Detailed image for the expanded view
  },
  {
    id: 3,
    title: "Vulkan Game Engine",
    description: "A Vulkan-powered game engine.",
    example: "Rendering a simple triangle.", // Example or additional info
    image: "/engine.jpg" // Image for the project card
  }
];
