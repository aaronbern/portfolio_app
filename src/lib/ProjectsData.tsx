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
    description: 'Predicts object trajectories with RL.',
    link: 'https://github.com/aaronbern/Trajectory-Oracle',
    image: '/traj.jpg',
    videoPath: "/videos/output_with_trajectory.mp4", 
    detailedImage: "/prediction.png"
  },
  {
    id: 2,
    title: 'Yap-Chat',
    description: 'A real-time web chat app built with MERN stack.',
    image: '/chat.jpg',
    example: 'A simple chat app using websockets and MERN stack.',
    link: 'https://yapp-chat-app-de1a44a0cf7e.herokuapp.com/',  
    detailedImage: "/selected_yap-chat.png"
  },

  { id: 3, title: "Vulkan Game Engine", description: "A Vulkan-powered game engine.", example: "Rendering a simple triangle.", image: "/engine.jpg" }
];
