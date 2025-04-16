import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { projects, Project } from "@/lib/ProjectsData";

export function ProjectsCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0); // Track the selected index

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    // Ensure it scrolls to the last selected project after re-mounting
    if (selectedIndex && api) {
      api.scrollTo(selectedIndex);
    }
  }, [api, selectedIndex]);

  const handleProjectClick = (project: Project, index: number) => {
    setSelectedProject(project);
    setSelectedIndex(index); // Store the selected index
  };

  const handleClose = () => {
    setSelectedProject(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {!selectedProject && (
        <>
          <Carousel setApi={setApi} className="w-full max-w-4xl">
            <CarouselContent className="-ml-4 md:-ml-6 lg:-ml-8">
              {projects.map((project: Project, index: number) => (
                <CarouselItem
                  key={project.id}
                  className="w-[90%] sm:w-[80%] md:w-1/2 lg:w-1/3 pl-4 md:pl-6 lg:pl-8"
                >
                  <Card className="relative overflow-hidden user-select-none" style={{ height: "450px" }}>
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover pointer-events-auto"
                    />
                    <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4" style={{ fontFamily: 'KIMM_Bold, sans-serif' }}>
                      <h3 className="text-3xl font-bold"> 
                        {project.title} 
                      </h3>
                      <p className="text-center text-lg">
                        {project.description}
                      </p>
                      <Button
                        variant="project"
                        onClick={() => handleProjectClick(project, index)}
                        className="mt-4"
                        style={{ fontFamily: 'KIMM_Bold, sans-serif' }} /* Ensures button also uses KIMM_Bold */
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:block absolute left-0 z-10 m-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75">
              &#8249;
            </CarouselPrevious>
            <CarouselNext className="hidden sm:block absolute right-0 z-10 m-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75">
              &#8250;
            </CarouselNext>
          </Carousel>
          <div className="py-2 text-center text-sm text-muted-foreground user-select-none text-white">
            {current} of {count}
          </div>
        </>
      )}
      {selectedProject && (
        <div className="mt-4 project-detail-container">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <h3 className="text-2xl font-bold text-white user-select-none">
                {selectedProject.title}
              </h3>
              <p className="user-select-none text-white ">
                {selectedProject.description}
              </p>

              {/* Conditionally Render GitHub and Live Links */}
              <div className="mt-4">
                {selectedProject.githubLink && (
                  <a
                    href={selectedProject.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
                  >
                    GitHub Repo
                  </a>
                )}
                {selectedProject.link && (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md"
                  >
                    Visit Project
                  </a>
                )}
              </div>

              {selectedProject.detailedImage && (
                <div className="image-container mt-4">
                  <img 
                    src={selectedProject.detailedImage} 
                    alt={`${selectedProject.title} Detailed`} 
                    className="detailed-image"
                  />
                </div>
              )}

              {selectedProject.videoPath && (
                <div className="video-container mt-4">
                  {/* Move this heading above the video */}
                  <h4 className="text-xl font-semibold text-white mb-2 text-center">
                    Here is {selectedProject.title} in Action
                  </h4>
                  <video className="project-video" controls>
                    <source src={selectedProject.videoPath} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              <Button onClick={handleClose} className="mt-4 text-white">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
