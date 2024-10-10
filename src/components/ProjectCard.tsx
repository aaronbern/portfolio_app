interface ProjectCardProps {
    title: string;
    description: string;
    link: string;
  }
  
  export default function ProjectCard({ title, description, link }: ProjectCardProps) {
    return (
      <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="mb-4">{description}</p>
        <a href={link} className="text-blue-500 underline">
          Learn More
        </a>
      </div>
    );
  }
  