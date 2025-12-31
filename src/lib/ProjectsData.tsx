// Define the Project type (if needed)
export interface Project {
  id: number;
  title: string;
  description: string;
  image?: string;  // If you have images
  example?: string;
  link?: string;
  githubLink: string;
  videoPath?: string;
  detailedImage?: string;
}

// Export an array of projects
export const projects: Project[] = [
  {
    id: 1,
    title: 'Trajectory Oracle',
    description: 'Predicts object trajectories with reinforcement learning.',
    image: '/traj.jpg',
    videoPath: '/videos/output_with_trajectory.mp4',
    detailedImage: '/prediction.png',
    githubLink: 'https://github.com/aaronbern/Trajectory-Oracle'
  },
  {
    id: 2,
    title: 'Yap-Chat',
    description: 'A real-time web chat app built with the MERN stack, featuring live updates and scalable architecture.',
    link: 'https://yapp-chat-app-de1a44a0cf7e.herokuapp.com/',
    image: '/chat.jpg',
    detailedImage: '/selected_yap-chat.png',
    githubLink: 'https://github.com/aaronbern/yap'
  },
  {
    id: 3,
    title: 'Vulkan Game Engine',
    description: 'A Vulkan-powered game engine focused on low-level rendering control and performance.',
    example: 'Rendering a simple triangle.',
    image: '/engine.jpg',
    videoPath: '/videos/enginevid.mp4',
    githubLink: 'https://github.com/aaronbern/VulkanGameEngine'
  }
];
