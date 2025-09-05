// AARON BERNARD
// MAIN COMMIT FOR LIVE WEBSITE c6c7939aedebecd772374f5f074a8e5a80ce7d20

import '../styles/globals.css';
import SEO from '../components/SEO';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Analytics } from "@vercel/analytics/react";
import * as React from "react";
import { ProjectsCarousel } from "../components/ProjectsCarousel"
import Image from 'next/image';
import { ContactForm } from './contact';

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
  const [showContactForm, setShowContactForm] = useState(false);

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

    // Enhanced shader material for star-like lights
    const createStarMaterial = (color: number) => {
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(color) },
          intensity: { value: 2.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            vPosition = position;
            
            // Make the geometry slightly larger and add some vertex displacement
            vec3 pos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          uniform float intensity;
          
          varying vec2 vUv;
          varying vec3 vPosition;
          
          // Noise function for flame-like effects
          float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }
          
          float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for(int i = 0; i < 6; i++) {
              value += amplitude * noise(p);
              p *= 2.0;
              amplitude *= 0.5;
            }
            return value;
          }
          
          void main() {
            vec2 center = vec2(0.5, 0.5);
            vec2 uv = vUv - center;
            float dist = length(uv);
            
            // Smooth circular falloff instead of hard edges
            float circle = 1.0 - smoothstep(0.0, 0.5, dist);
            
            // Create radial gradient for star core
            float core = 1.0 - smoothstep(0.0, 0.2, dist);
            
            // Add pulsing effect
            float pulse = 0.8 + 0.2 * sin(time * 3.0);
            
            // Create flame-like turbulence
            vec2 turbulence = uv * 12.0 + time * 0.5;
            float flames = fbm(turbulence + fbm(turbulence * 1.5));
            
            // Create corona effect with smoother falloff
            float corona = 1.0 - smoothstep(0.05, 0.4, dist);
            corona *= flames * 0.3 + 0.7;
            
            // Add stellar spikes (6-pointed star) but make them more subtle
            float angle = atan(uv.y, uv.x);
            float spikes = 0.0;
            for(int i = 0; i < 6; i++) {
              float spikeAngle = float(i) * 3.14159 / 3.0;
              float angleDiff = abs(angle - spikeAngle);
              angleDiff = min(angleDiff, 6.28318 - angleDiff);
              spikes += (1.0 - smoothstep(0.0, 0.05, angleDiff)) * (1.0 - smoothstep(0.0, 0.3, dist));
            }
            
            // Combine all effects with circular mask
            float brightness = (core * pulse + corona * 0.6 + spikes * 0.3) * circle;
            brightness = clamp(brightness, 0.0, 1.0);
            
            // Color variations based on brightness
            vec3 hotColor = color * 1.3;
            vec3 coolColor = color * 0.7;
            vec3 finalColor = mix(coolColor, hotColor, brightness);
            
            // Add some color temperature variation
            if(color.r > color.g && color.r > color.b) {
              // Red star - add orange/yellow highlights
              finalColor += vec3(0.4, 0.2, 0.0) * brightness * flames;
            } else if(color.b > color.r && color.b > color.g) {
              // Blue star - add white highlights
              finalColor += vec3(0.3, 0.3, 0.4) * brightness * flames;
            } else {
              // Green star - add yellow-green highlights
              finalColor += vec3(0.2, 0.4, 0.1) * brightness * flames;
            }
            
            // Create smooth outer glow
            float glow = 1.0 - smoothstep(0.2, 0.5, dist);
            glow *= 0.4 * circle;
            
            float alpha = (brightness + glow) * circle;
            alpha = clamp(alpha, 0.0, 1.0);
            
            gl_FragColor = vec4(finalColor * intensity, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    };

    // Enhanced lights setup
    const addEnhancedLight = (hexColor: number) => {
      // Create a circular geometry for the visual effect
      const starGeometry = new THREE.CircleGeometry(0.04, 32);
      const starMaterial = createStarMaterial(hexColor);
      const starMesh = new THREE.Mesh(starGeometry, starMaterial);
      
      // Make the star always face the camera
      starMesh.lookAt(camera.position);
      
      // Create the actual point light
      const light = new THREE.PointLight(hexColor, 3, 4);
      light.add(starMesh);
      
      scene.add(light);
      return { light, starMaterial };
    };

    // Create the enhanced lights
    const light1Data = addEnhancedLight(0xff6666); // Red
    const light2Data = addEnhancedLight(0x66b3ff); // Blue  
    const light3Data = addEnhancedLight(0x80ff80); // Green

    const light1 = light1Data.light;
    const light2 = light2Data.light;
    const light3 = light3Data.light;

    // Points setup
    const points = [];
    const colors = [];
    for (let i = 0; i < 100000; i++) {
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
      
      // Update time uniform for all star materials
      light1Data.starMaterial.uniforms.time.value = time;
      light2Data.starMaterial.uniforms.time.value = time;
      light3Data.starMaterial.uniforms.time.value = time;

      // Make stars always face the camera
      light1.children[0].lookAt(camera.position);
      light2.children[0].lookAt(camera.position);
      light3.children[0].lookAt(camera.position);

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
        nameTitle.style.textShadow = `0 0 ${30 * smoothedIntensity
          }px rgba(${r}, ${g}, ${b}, ${0.8 * smoothedIntensity})`;
        nameSubtitle.style.color = rgbColor;
        nameSubtitle.style.opacity = '1'; // Keep opacity constant
        nameSubtitle.style.textShadow = `0 0 ${15 * smoothedIntensity
          }px rgba(${r}, ${g}, ${b}, ${0.6 * smoothedIntensity})`;
      }

      // Update link styles
      linkItems.forEach((link) => {
        link.style.color = rgbColor;
        link.style.textShadow = `0 0 ${15 * smoothedIntensity
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
        description="CS student focused on AI and full-stack development"
      />
      <div id="three-container" className="w-full h-screen"></div>
      <div className="name-container">
        {/* Conditional Rendering Based on activeContent */}
        {activeContent === 'home' && (
          <>
            <h1 className="name-title">Aaron Bernard</h1>
            <p className="name-subtitle">Site Reliability Engineering Intern</p>
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
                layout="fixed"
                width={100}
                height={100}
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
                  Hello, I&apos;m Aaron Bernard — a software engineer passionate about building systems that are both innovative and reliable. I currently work as a Site Reliability Engineering Intern at Trimble, where I help improve system stability, automation, and observability across internal platforms.
                </p>
              </section>

              {/* Section 2: Background */}
              <section className="about-subsection">
                <h2 className="about-heading">
                  <span className="section-number">2.</span> Background
                </h2>
                <p className="about-text">
                  Previously, I worked at Act-On Software, contributing to projects that integrated AI into production systems and supported internal infrastructure initiatives. I&apos;ve worked with cloud-based monitoring tools, infrastructure-as-code platforms like Terraform, and performance reporting systems to help teams gain visibility into system health and reliability.
                </p>
              </section>

              {/* Section 3: Interests & Goals */}
              <section className="about-subsection">
                <h2 className="about-heading">
                  <span className="section-number">3.</span> Interests & Goals
                </h2>
                <p className="about-text">
                  I&apos;m especially interested in Site Reliability Engineering — combining software and systems thinking to build fault-tolerant, scalable platforms. I also enjoy AI development, game design, and exploring new ways to create efficient developer experiences. Long-term, I want to continue working on production infrastructure that supports large-scale, real-time applications with a focus on reliability, automation, and thoughtful monitoring.
                </p>
              </section>
            </div>
          </div>
        )}
        {activeContent === 'contact' && (
          <div id="contact-form" className="about-text">
            <ul className="contact-list">
              <li>
                <a href="#" onClick={() => setShowContactForm(true)}>
                  Email: Aaronber@pdx.edu
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/aaron-bernard-92a511162/" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://github.com/aaronbern" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        )}
        {/* Modal for Contact Form */}
        {showContactForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-button" onClick={() => setShowContactForm(false)}>
                X
              </button>
              <ContactForm />
            </div>
          </div>
        )}
        {activeContent === 'projects' && (
          <div className="content">
            <ProjectsCarousel />
          </div>
        )}
      </div>
      {/* Static Links Container */}
      <div className="links">
        <button
          className={`link-item ${showLinks.about ? 'visible' : ''} ${activeContent === 'about' ? 'active' : ''
            }`}
          onClick={() => handleLinkClick('about')}
        >
          About
        </button>
        <button
          className={`link-item ${showLinks.contact ? 'visible' : ''} ${activeContent === 'contact' ? 'active' : ''
            }`}
          onClick={() => handleLinkClick('contact')}
        >
          Contact
        </button>
        <button
          className={`link-item ${showLinks.projects ? 'visible' : ''} ${activeContent === 'projects' ? 'active' : ''
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