import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { projects, Project } from "@/lib/ProjectsData";

// Note: Carousel removed to use a static centered flex layout (non-draggable)

// Project icon components - clean, minimal SVG icons
const ProjectIcon = ({ type }: { type: string }) => {
  const iconClass = "w-16 h-16 mb-4 opacity-80";

  switch (type) {
    case 'ai':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 21c4-9 11-13 18-9" />
          <circle cx="21" cy="12" r="2" fill="currentColor" />
          <path d="M21 12v.01" />
          <path d="M12 21a9 9 0 0 0 0-18 9 9 0 0 0 0 18z" strokeOpacity="0.3" strokeDasharray="4 4" />
        </svg>
      );
    case 'chat':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="8" cy="12" r="1" fill="currentColor" />
          <circle cx="16" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case 'engine':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <line x1="12" y1="22" x2="12" y2="15.5" />
          <polyline points="22 8.5 12 15.5 2 8.5" />
          <polyline points="2 15.5 12 8.5 22 15.5" />
          <line x1="12" y1="2" x2="12" y2="8.5" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      );
  }
};

// Get project type for icon selection
const getProjectType = (title: string): string => {
  if (title.toLowerCase().includes('oracle') || title.toLowerCase().includes('trajectory')) return 'ai';
  if (title.toLowerCase().includes('chat') || title.toLowerCase().includes('yap')) return 'chat';
  if (title.toLowerCase().includes('engine') || title.toLowerCase().includes('vulkan')) return 'engine';
  return 'default';
};

// Get gradient colors based on project
const getProjectGradient = (index: number): string => {
  // Gradients chosen to match the three glowing stars (blue, teal, red)
  const gradients = [
    'from-[#60A5FA]/20 via-[#3B82F6]/10 to-transparent', // cool blue
    'from-[#34D399]/20 via-[#06B6D4]/10 to-transparent', // teal/cyan
    'from-[#FB7185]/20 via-[#F97316]/10 to-transparent', // warm red/orange
  ];
  return gradients[index % gradients.length];
};

export function ProjectsCarousel() {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleProjectClick = (project: Project, index: number) => {
    setSelectedProject(project);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedProject(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      {!selectedProject && (
        <div className="w-full max-w-4xl mx-auto overflow-visible">
          <div className="-ml-2 md:-ml-4 flex gap-6 justify-center items-stretch">
            {projects.map((project: Project, index: number) => (
              <div
                key={project.id}
                className="pl-2 md:pl-4 basis-full sm:basis-4/5 md:basis-1/2 lg:basis-2/5"
              >
                <Card
                  className={`
                    relative overflow-hidden cursor-pointer group
                    bg-gradient-to-br ${getProjectGradient(index)}
                    border border-white/10 hover:border-white/30
                    transform-gpu transition-all duration-300 hover:scale-[1.05] hover:z-10
                    backdrop-blur-sm
                  `}
                  style={{ height: "320px" }}
                  onClick={() => handleProjectClick(project, index)}
                >
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full" />
                    <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full" />
                  </div>

                  <CardContent className="relative h-full flex flex-col items-center justify-center text-white p-6">
                    <div className="text-white/90 group-hover:text-white transition-colors">
                      <ProjectIcon type={getProjectType(project.title)} />
                    </div>

                    <h3
                      className="text-2xl font-bold text-center mb-2 group-hover:text-white transition-colors"
                      style={{ fontFamily: 'KIMM_Bold, sans-serif' }}
                    >
                      {project.title}
                    </h3>

                    <p
                      className="text-center text-sm text-white/70 group-hover:text-white/90 transition-colors max-w-xs"
                      style={{ fontFamily: 'KIMM_Bold, sans-serif' }}
                    >
                      {project.description}
                    </p>

                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span
                        className="text-xs uppercase tracking-wider text-white/60"
                        style={{ fontFamily: 'KIMM_Bold, sans-serif' }}
                      >
                        Click to view →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedProject && (
        <div className="project-detail-container">
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="flex flex-col items-center justify-start p-4 md:p-6">
              {/* Header with back button */}
              <div className="w-full flex items-center justify-between mb-4">
                <button
                  onClick={handleClose}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  style={{ fontFamily: 'KIMM_Bold, sans-serif' }}
                >
                  ← Back
                </button>
                <div className="text-white/40 text-sm" style={{ fontFamily: 'KIMM_Bold, sans-serif' }}>
                  {selectedIndex + 1} / {projects.length}
                </div>
              </div>

              {/* Project Icon & Title */}
              <div className="text-white/80 mb-2">
                <ProjectIcon type={getProjectType(selectedProject.title)} />
              </div>

              <h3
                className="text-2xl md:text-3xl font-bold text-white text-center mb-2"
                style={{ fontFamily: 'KIMM_Bold, sans-serif' }}
              >
                {selectedProject.title}
              </h3>

              <p
                className="text-white/70 text-center max-w-md mb-4"
                style={{ fontFamily: 'KIMM_Bold, sans-serif' }}
              >
                {selectedProject.description}
              </p>

              {/* Action Links */}
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {selectedProject.githubLink && (
                  <a
                    href={selectedProject.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                    style={{ fontFamily: 'KIMM_Bold, sans-serif' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
              </div>

              {/* Media Section */}
              {selectedProject.detailedImage && (
                <div className="w-full max-w-2xl mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedProject.detailedImage}
                    alt={`${selectedProject.title} Preview`}
                    className="w-full rounded-lg border border-white/10"
                  />
                </div>
              )}

              {selectedProject.videoPath && (
                <div className="w-full max-w-2xl">
                  <h4
                    className="text-lg text-white/60 mb-3 text-center"
                    style={{ fontFamily: 'KIMM_Bold, sans-serif' }}
                  >
                    Demo Video
                  </h4>
                  <video
                    className="w-full rounded-lg border border-white/10"
                    controls
                    playsInline
                  >
                    <source src={selectedProject.videoPath} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
