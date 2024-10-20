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

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleClose = () => {
    setSelectedProject(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Render the carousel only if no project is selected */}
      {!selectedProject && (
        <>
          <Carousel setApi={setApi} className="w-full max-w-4xl">
            <CarouselContent className="-ml-4 md:-ml-6 lg:-ml-8">
              {projects.map((project: Project) => (
                <CarouselItem
                  key={project.id}
                  className="w-full md:w-1/2 lg:w-1/3 pl-4 md:pl-6 lg:pl-8"
                >
                  <Card className="h-80 md:h-96 lg:h-120">
                    <CardContent className="flex flex-col items-center justify-center p-8 md:p-10 lg:p-12">
                      <h3 className="text-3xl font-bold">{project.title}</h3>
                      <p className="text-center text-lg">{project.description}</p>
                      <Button onClick={() => handleProjectClick(project)} className="mt-4">
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
