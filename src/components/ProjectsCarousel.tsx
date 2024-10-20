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
                  className="w-[90%] sm:w-[80%] md:w-1/2 lg:w-1/3 pl-4 md:pl-6 lg:pl-8"
                >
                  {/* Set Card as relative to position the overlay correctly */}
                  <Card className="relative overflow-hidden user-select-none" style={{ height: "450px" }}>
                    {/* Display the project image and ensure it fits inside the card */}
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover pointer-events-auto" // Ensure the image fits the card
                    />
                    {/* CardContent as an overlay on top of the image */}
                    <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4">
                      <h3 className="text-3xl font-bold">
                        {project.title}
                      </h3>
                      <p className="text-center text-lg">
                        {project.description}
                      </p>
                      <Button
                        variant="project"
                        onClick={() => handleProjectClick(project)}
                        className="mt-4"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Custom styles for the previous and next buttons */}
            <CarouselPrevious className="hidden sm:block absolute left-0 z-10 m-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75">
                &#8249;
                </CarouselPrevious>
                <CarouselNext className="hidden sm:block absolute right-0 z-10 m-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75">
                &#8250;
                </CarouselNext>
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
              {/* Make title and description non-interactable */}
              <h3 className="text-2xl font-bold text-white user-select-none">
                {selectedProject.title}
              </h3>
              <p className="user-select-none text-white ">
                {selectedProject.description}
              </p>
              <div className="mt-4">
                <h4 className="text-xl font-semibold text-white ">Project Example</h4>
                <p>{selectedProject.example}</p>
              </div>
              {/* Keep the close button interactive */}
              <Button onClick={handleClose} className="mt-4 text-white ">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
