import '../styles/globals.css';
import SEO from '../components/SEO';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Analytics } from "@vercel/analytics/react";
import * as React from "react";
import { ProjectsCarousel } from "../components/ProjectsCarousel"
import Image from 'next/image';

// Import for post-processing effects
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


export default function Home() {
  const [showLinks, setShowLinks] = useState({
    about: false,
    contact: false,
    projects: false,
  });

  // State variable to manage active content
  const [activeContent, setActiveContent] = useState('home');

  // Function to handle link clicks
  const handleLinkClick = (content: string) => {
    // If the clicked link is already active, return to home screen
    if (activeContent === content) {
      setActiveContent('home');
    } else {
      setActiveContent(content); // Show the clicked content
    }
  };

  useEffect(() => {
    // Timed reveals of the links
    setTimeout(() => setShowLinks((prev) => ({ ...prev, about: true })), 2000);
    setTimeout(() => setShowLinks((prev) => ({ ...prev, contact: true })), 2500);
    setTimeout(() => setShowLinks((prev) => ({ ...prev, projects: true })), 3000);

    // Scene setup
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      10
    );
    camera.position.z = 0.2;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Set a dark background

    // Lights setup
    const sphereGeometry = new THREE.SphereGeometry(0.009, 16, 8);
    const addLight = (hexColor: number) => {  // Added type annotation here
      const material = new THREE.MeshBasicMaterial({ color: hexColor });
      const mesh = new THREE.Mesh(sphereGeometry, material);
      const light = new THREE.PointLight(hexColor, 2, 3); // Increase intensity for more noticeable effect
      light.add(mesh);
      scene.add(light);
      return light;
    };

    const light1 = addLight(0xff6666); // Red
    const light2 = addLight(0x66b3ff); // Blue
    const light3 = addLight(0x80ff80); // Green

    // Points setup
    const points = [];
    const colors = [];
    for (let i = 0; i < 500000; i++) {
      const point = new THREE.Vector3()
        .random()
        .subScalar(0.5)
        .multiplyScalar(3);
      points.push(point);

      // Use random colors
      const color = new THREE.Color(Math.random(), Math.random(), Math.random());
      colors.push(color.r, color.g, color.b);
    }

    const geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
    geometryPoints.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    // Custom ShaderMaterial to handle point lighting
    const materialPoints = new THREE.ShaderMaterial({
      uniforms: {
        light1Position: { value: new THREE.Vector3() },
        light1Color: { value: new THREE.Color(0xff6666) },
        light2Position: { value: new THREE.Vector3() },
        light2Color: { value: new THREE.Color(0x66b3ff) },
        light3Position: { value: new THREE.Vector3() },
        light3Color: { value: new THREE.Color(0x80ff80) },
        lightRadius: { value: 0.68 }, // Radius within which particles are illuminated
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_PointSize = 1.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 light1Position;
        uniform vec3 light1Color;
        uniform vec3 light2Position;
        uniform vec3 light2Color;
        uniform vec3 light3Position;
        uniform vec3 light3Color;
        uniform float lightRadius;

        varying vec3 vPosition;

        void main() {
          float intensity1 = max(0.0, 1.0 - length(light1Position - vPosition) / lightRadius);
          float intensity2 = max(0.0, 1.0 - length(light2Position - vPosition) / lightRadius);
          float intensity3 = max(0.0, 1.0 - length(light3Position - vPosition) / lightRadius);

          vec3 color = light1Color * intensity1 + light2Color * intensity2 + light3Color * intensity3;
          color = clamp(color, 0.0, 1.0);

          if (intensity1 <= 0.0 && intensity2 <= 0.0 && intensity3 <= 0.0) {
            discard;
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
    });

    const pointCloud = new THREE.Points(geometryPoints, materialPoints);
    scene.add(pointCloud);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.0;
    const container = document.getElementById('three-container');
    if (!container) {
      console.error("Couldn't find the container element for Three.js");
      return;
    }
    container.appendChild(renderer.domElement);

    // Post-processing for bloom effect
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8, // strength
      0.1, // radius
      0.0 // threshold
    );
    composer.addPass(bloomPass);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.2;
    controls.maxDistance = 0.2;
    controls.enablePan = false;

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });

    // Text reference for illumination effect
    const nameTitle = document.querySelector('.name-title') as HTMLElement | null;
    const nameSubtitle = document.querySelector('.name-subtitle') as HTMLElement | null;
    const linkItems = document.querySelectorAll('.link-item') as NodeListOf<HTMLElement>;

    // Variables for smoothing
    let smoothedIntensity = 0;
    const smoothedColor = new THREE.Color(0.8, 0.8, 0.8); // Start with base grey color
    const baseColor = new THREE.Color(0.8, 0.8, 0.8); // Base grey color

    // Animation loop
    const animate = () => {
      const time = Date.now() * 0.001;
      const scale = 0.5;

      // Light movements
      light1.position.x = Math.sin(time * 0.8) * scale;
      light1.position.y = Math.cos(time * 0.6) * scale;
      light1.position.z = Math.cos(time * 0.4) * scale;

      light2.position.x = Math.cos(time * 0.4) * scale;
      light2.position.y = Math.sin(time * 0.6) * scale;
      light2.position.z = Math.sin(time * 0.8) * scale;

      light3.position.x = Math.sin(time * 0.8) * scale;
      light3.position.y = Math.cos(time * 0.4) * scale;
      light3.position.z = Math.sin(time * 0.6) * scale;

      // Update shader uniforms for light positions
      materialPoints.uniforms.light1Position.value.copy(light1.position);
      materialPoints.uniforms.light2Position.value.copy(light2.position);
      materialPoints.uniforms.light3Position.value.copy(light3.position);

      // Calculate the intensity based on distance of lights to the center of the scene
      let totalIntensity = 0;
      const accumulatedColor = new THREE.Color(0, 0, 0);
      const center = new THREE.Vector3(0, 0, 0); // Center of the scene

      const lights = [
        { light: light1, color: light1.color },
        { light: light2, color: light2.color },
        { light: light3, color: light3.color },
      ];

      lights.forEach(({ light, color }) => {
        const distance = light.position.distanceTo(center);
        const maxDistance = 0.75; // Should match lightRadius
        const intensity = Math.max(0, 1 - distance / maxDistance);

        // Accumulate the intensity and color
        totalIntensity += intensity;
        const lightColor = color.clone().multiplyScalar(intensity);
        accumulatedColor.add(lightColor);
      });

      // Average the intensity
      totalIntensity /= lights.length;

      // Manually clamp accumulated color components between 0 and 1
      accumulatedColor.r = Math.min(1, Math.max(0, accumulatedColor.r));
      accumulatedColor.g = Math.min(1, Math.max(0, accumulatedColor.g));
      accumulatedColor.b = Math.min(1, Math.max(0, accumulatedColor.b));

      // Smoothing factor
      const alpha = 0.1; // Adjust this value for more or less smoothing

      // Smooth the intensity and color
      smoothedIntensity =
        smoothedIntensity * (1 - alpha) + totalIntensity * alpha;
      smoothedColor.lerp(accumulatedColor, alpha);

      // Clamp smoothedIntensity between 0 and 1
      smoothedIntensity = Math.min(1, Math.max(0, smoothedIntensity));

      // Manually clamp smoothed color components
      smoothedColor.r = Math.min(1, Math.max(0, smoothedColor.r));
      smoothedColor.g = Math.min(1, Math.max(0, smoothedColor.g));
      smoothedColor.b = Math.min(1, Math.max(0, smoothedColor.b));

      // Blend base color with smoothed color based on intensity
      const finalColor = baseColor.clone().lerp(smoothedColor, smoothedIntensity);

      // Convert finalColor to RGB
      const r = Math.floor(finalColor.r * 255);
      const g = Math.floor(finalColor.g * 255);
      const b = Math.floor(finalColor.b * 255);

      // Update text styles
      const rgbColor = `rgb(${r}, ${g}, ${b})`;

      if (nameTitle && nameSubtitle) {
        nameTitle.style.color = rgbColor;
        nameTitle.style.opacity = '1'; // Keep opacity constant
        nameTitle.style.textShadow = `0 0 ${
          30 * smoothedIntensity
        }px rgba(${r}, ${g}, ${b}, ${0.8 * smoothedIntensity})`;
        nameSubtitle.style.color = rgbColor;
        nameSubtitle.style.opacity = '1'; // Keep opacity constant
        nameSubtitle.style.textShadow = `0 0 ${
          15 * smoothedIntensity
        }px rgba(${r}, ${g}, ${b}, ${0.6 * smoothedIntensity})`;
      }

      // Update link styles
      linkItems.forEach((link) => {
        link.style.color = rgbColor;
        link.style.textShadow = `0 0 ${
          15 * smoothedIntensity
        }px rgba(${r}, ${g}, ${b}, ${0.6 * smoothedIntensity})`;
      });

      scene.rotation.y = time * 0.02;

      // Render the scene with post-processing
      composer.render();

      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount
    return () => {
      renderer.dispose();
      composer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <>
      <SEO
        title="AaronBernard.exe"
        description="A showcase of my projects and experience"
      />
      <div id="three-container" className="w-full h-screen"></div>
      <div className="name-container">
        {/* Conditional Rendering Based on activeContent */}
        {activeContent === 'home' && (
          <>
            <h1 className="name-title">Aaron Bernard</h1>
            <p className="name-subtitle">Aspiring Software Engineer</p>
          </>
        )}
        {activeContent === 'about' && (
          <div className="content about-container">
            {/* Minimalist Profile Picture */}
            <div className="profile-picture-container">
              <Image
                src="/PFP.jpg" // Ensure this image exists in your public folder
                alt="Aaron Bernard"
                className="profile-picture"
              />
            </div>
  
            {/* Simplified About Content */}
            <div className="about-content">
              {/* Section 1: Introduction */}
              <section className="about-subsection">
                <h2 className="about-heading">
                  <span className="section-number">1.</span> Introduction
                </h2>
                <p className="about-text">
                  Hello, I&apos;m Aaron Bernard, a passionate software engineer dedicated to creating innovative solutions. I specialize in modern web technologies like React and Next.js, and I leverage AI tools to predict and analyze data in real-time.
                </p>
              </section>
  
              {/* Section 2: Background */}
              <section className="about-subsection">
                <h2 className="about-heading">
                  <span className="section-number">2.</span> Background
                </h2>
                <p className="about-text">
                  With a foundation in web development, customer service, and AI integration, I aim to build reliable, scalable, and secure software that addresses real-world challenges. I apply DevOps and SRE principles to ensure system reliability, automate workflows, and enhance application resilience through effective monitoring tools.
                </p>
              </section>
  
              {/* Section 3: Interests & Goals */}
              <section className="about-subsection">
                <h2 className="about-heading">
                  <span className="section-number">3.</span> Interests & Goals
                </h2>
                <p className="about-text">
                  I thrive on merging creativity with functionality in software development. My interests include AI, game development, and exploring new web technologies. My aspiration is to become a Site Reliability Engineer at Nike, contributing to the creation of highly available, scalable, and secure systems while implementing best practices in monitoring, performance optimization, and automation.
                </p>
              </section>
            </div>
          </div>
        )}
        {activeContent === 'contact' && (
          <div className="content">
            <h1>Contact</h1>
            <p>
              Feel free to reach out to me via email at
              <a href="mailto:aaron@example.com"> aaron@example.com</a>
            </p>
          </div>
        )}
          {activeContent === 'projects' && (
            <div className = "content">
              <h1 className="about-heading">Projects</h1>
              <ProjectsCarousel />  {}
            </div>
          )}
      </div>
      {/* Static Links Container */}
      <div className="links">
        <button
          className={`link-item ${showLinks.about ? 'visible' : ''} ${
            activeContent === 'about' ? 'active' : ''
          }`}
          onClick={() => handleLinkClick('about')}
        >
          About
        </button>
        <button
          className={`link-item ${showLinks.contact ? 'visible' : ''} ${
            activeContent === 'contact' ? 'active' : ''
          }`}
          onClick={() => handleLinkClick('contact')}
        >
          Contact
        </button>
        <button
          className={`link-item ${showLinks.projects ? 'visible' : ''} ${
            activeContent === 'projects' ? 'active' : ''
          }`}
          onClick={() => handleLinkClick('projects')}
        >
          Projects
        </button>
      </div>
      <Analytics />
    </>
  );  
}
