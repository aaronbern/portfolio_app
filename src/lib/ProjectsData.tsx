// Define the Project type (if needed)
export interface Project {
    id: number;
    title: string;
    description: string;
    example: string;
  }
  
  // Export an array of projects
  export const projects: Project[] = [
    { id: 1, title: "Project A", description: "This is project A description.", example: "Example of Project A" },
    { id: 2, title: "Project B", description: "This is project B description.", example: "Example of Project B" },
    { id: 3, title: "Project C", description: "This is project C description.", example: "Example of Project C" },
    { id: 4, title: "Project D", description: "This is project D description.", example: "Example of Project D" },
    { id: 5, title: "Project E", description: "This is project E description.", example: "Example of Project E" },
  ];
  