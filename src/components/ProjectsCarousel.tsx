import * as React from "react";
import { Card, CardContent} from "./ui/card"; // Ensure Button is correctly imported
import { Button } from "./ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { projects, Project } from "C:/Users/aaron/OneDrive/Desktop/Code/portfolio_app/src/pages/projects/ProjectsData";

export function ProjectsCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null); // Define the selected project type

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Handle project click to expand details
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project); // Set the clicked project as selected
  };

  // Close the expanded project view
  const handleClose = () => {
    setSelectedProject(null); // Reset the selected project to close the detailed view
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Render the carousel only if no project is selected */}
      {!selectedProject && (
        <>
          <Carousel setApi={setApi} className="w-full max-w-lg">
            <CarouselContent>
              {projects.map((project : Project) => (
                <CarouselItem key={project.id}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <h3 className="text-2xl font-bold">{project.title}</h3>
                      <p className="text-center">{project.description}</p>
                      <Button onClick={() => handleProjectClick(project)}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <div className="py-2 text-center text-sm text-muted-foreground">
            Slide {current} of {count}
          </div>
        </>
      )}

      {/* Render the expanded project view if a project is selected */}
      {selectedProject && (
        <div className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <h3 className="text-2xl font-bold">{selectedProject.title}</h3>
              <p>{selectedProject.description}</p>
              <div className="mt-4">
                <h4 className="text-xl font-semibold">Project Example</h4>
                <p>{selectedProject.example}</p>
              </div>
              <Button onClick={handleClose} className="mt-4">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
