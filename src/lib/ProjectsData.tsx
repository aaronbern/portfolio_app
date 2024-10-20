// Define the Project type (if needed)
export interface Project {
  id: number;
  title: string;
  description: string;
  example: string;
  image: string;  // Add image property
}

// Export an array of projects
export const projects: Project[] = [
  { id: 1, title: "Trajectory Oracle", description: "Predicts object trajectories with RL.", example: "Real-time prediction of moving objects.", image: "/traj.jpg" },
  { id: 2, title: "Yap-Chat", description: "A sleek and modern chat app.", example: "Real-time chat and messaging.", image: "/chat.jpg" },
  { id: 3, title: "Vulkan Game Engine", description: "A Vulkan-powered game engine.", example: "Rendering a simple triangle.", image: "/engine.jpg" }
];
