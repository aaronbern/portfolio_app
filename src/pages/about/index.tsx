import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

export default function About() {
  return (
    <>
      <SEO title="About Me" description="Learn more about me" />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <Navbar />
        <main className="container mx-auto py-16 px-8">
          <h1 className="text-5xl font-extrabold text-center mb-12 tracking-wide">About Me</h1>
          <section className="mb-12 bg-gray-800 p-8 rounded-lg shadow-2xl transition transform hover:scale-105 duration-500 ease-in-out">
            <h2 className="text-4xl font-bold mb-4">Hello!</h2>
            <p className="text-lg leading-relaxed">
              Hello, I&apos;m Aaron Bernard, and this is my professional portfolio showcasing my work,
              experience, and passion for technology. I am currently building projects using modern web
              technologies like React, Next.js, and AI tools to help predict and analyze data in real-time.
            </p>
          </section>
          <section className="mb-12 bg-gray-800 p-8 rounded-lg shadow-2xl transition transform hover:scale-105 duration-500 ease-in-out">
            <h2 className="text-3xl font-semibold mb-4">My Background</h2>
            <p className="text-lg leading-relaxed">
              I have a background in web development, customer service, and AI integration.
              My goal is to create reliable, scalable, and secure software that solves real-world problems.
              I apply DevOps and SRE principles to ensure reliability, automating workflows and using monitoring tools
              to enhance the resilience of my applications.
            </p>
          </section>
          <section className="mb-12 bg-gray-800 p-8 rounded-lg shadow-lg transition transform hover:scale-105 duration-300 ease-in-out">
            <h2 className="text-3xl font-semibold mb-4">My Interests</h2>
            <p className="text-lg leading-relaxed">
              I am particularly interested in building software that merges creativity with functionality.
              I am excited about AI, game development, web technology, and learning about new tools that can help
              me be a better developer. My dream job is to become a Site Reliability Engineer at Nike, where I can
              contribute to building highly available, scalable, and secure systems while implementing best practices
              in monitoring, performance optimization, and automation.
            </p>
          </section>
          <section className="mb-12 bg-gray-800 p-8 rounded-lg shadow-lg transition transform hover:scale-105 duration-300 ease-in-out">
            <h2 className="text-3xl font-semibold mb-4">Generative Security Applications</h2>
            <p className="text-lg leading-relaxed">
              I&apos;m currently taking a class on Generative Security Applications, and I absolutely love the ideas being presented.
              The topics range from language models and LangChain to vulnerabilities, social engineering, and advanced code generation.
              This course is deepening my understanding of how generative AI can be applied to cybersecurity in both defensive and offensive contexts,
              such as using AI for finding vulnerabilities or generating realistic social engineering scenarios for training.
              This knowledge helps me in building resilient software with security as a foundational principle.
            </p>
          </section>
          <section className="mb-12 bg-gray-800 p-8 rounded-lg shadow-lg transition transform hover:scale-105 duration-300 ease-in-out">
            <h2 className="text-3xl font-semibold mb-4">Continuous Improvement</h2>
            <p className="text-lg leading-relaxed">
              As part of my ongoing journey towards becoming an SRE, I am continuously learning about observability, incident management, and automation.
              My recent projects involve setting up CI/CD pipelines, implementing robust monitoring, and conducting chaos engineering experiments to test system resilience.
              These experiences are helping me refine my skills in building scalable infrastructure and ensuring high availability.
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}