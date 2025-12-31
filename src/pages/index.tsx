// AARON BERNARD
// MAIN COMMIT FOR LIVE WEBSITE c6c7939aedebecd772374f5f074a8e5a80ce7d20

import '../styles/globals.css';
import SEO from '../components/SEO';
import { useEffect, useState, useRef } from 'react';
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
// Motion blur removed for cleaner particle rendering

// Performance detection for adaptive quality
const getQualitySettings = () => {
  if (typeof window === 'undefined') {
    return { particles: 150000, bloomEnabled: true, pixelRatio: 1 };
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowPower = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return { particles: 50000, bloomEnabled: false, pixelRatio: 1 };
  }
  if (isMobile || isLowPower) {
    return { particles: 80000, bloomEnabled: false, pixelRatio: 1 };
  }
  return {
    particles: 150000,
    bloomEnabled: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
  };
};

export default function Home() {
  const [showLinks, setShowLinks] = useState({
    about: false,
    contact: false,
    projects: false,
  });

  // State variable to manage active content
  const [activeContent, setActiveContent] = useState('home');
  const [showContactForm, setShowContactForm] = useState(false);

  // Create a ref to track active content inside the 3JS loop
  const activeContentRef = useRef(activeContent);

  // Sync the ref whenever state changes
  useEffect(() => {
    activeContentRef.current = activeContent;
  }, [activeContent]);

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

    // Get adaptive quality settings
    const quality = getQualitySettings();

    // Simplified star shader material - cleaner, more performant
    const createStarMaterial = (color: number) => {
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(color) }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          varying vec2 vUv;
          
          void main() {
            vec2 center = vUv - 0.5;
            float dist = length(center);
            
            // 1. Soft outer glow
            float glow = 1.0 - smoothstep(0.0, 0.5, dist);
            
            // 2. Sharp, solid core
            float core = 1.0 - smoothstep(0.0, 0.12, dist);
            
            // 3. Pulse
            float pulse = 0.9 + 0.1 * sin(time * 3.0);
            
            // 4. THERMAL EFFECT: Mix white into the center (0.85 = 85% white at center)
            vec3 hotColor = mix(color, vec3(1.0), core * 0.85);
            
            // Combine: Core is very bright (bloom target), glow is softer
            float brightness = (core * 3.0 + glow * 0.5) * pulse;

            // Make sure edges fade out completely
            float alpha = clamp(glow * 2.0, 0.0, 1.0);

            gl_FragColor = vec4(hotColor * brightness, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    };

    // Enhanced lights setup with comet tails
    const addEnhancedLight = (hexColor: number) => {
      // Create a group to hold star and tail
      const cometGroup = new THREE.Group();

      // Star head
      const starGeometry = new THREE.CircleGeometry(0.04, 32);
      const starMaterial = createStarMaterial(hexColor);
      const starMesh = new THREE.Mesh(starGeometry, starMaterial);
      starMesh.renderOrder = 2;
      cometGroup.add(starMesh);

      // Create the actual point light
      const light = new THREE.PointLight(hexColor, 3, 4);
      light.add(cometGroup);

      scene.add(light);
      return { light, starMaterial, cometGroup };
    };

    // Create the enhanced lights
    // 1. Red (Right Card - Vulkan / Top Right About / Email Contact)
    const light1Data = addEnhancedLight(0xff6666);
    // 2. Blue (Left Card - Trajectory / Top Left About / LinkedIn Contact)
    const light2Data = addEnhancedLight(0x66b3ff);
    // 3. Green (Center Card - YapChat / Bottom About / GitHub Contact)
    const light3Data = addEnhancedLight(0x80ff80);

    const light1 = light1Data.light;
    const light2 = light2Data.light;
    const light3 = light3Data.light;

    // Store previous positions for tail direction
    const prevPositions = {
      light1: new THREE.Vector3(),
      light2: new THREE.Vector3(),
      light3: new THREE.Vector3()
    };

    // Random even distribution of particles around origin (like original)
    const points = [];
    const colors = [];
    const sizes = [];
    const twinkleOffsets = [];
    const particleCount = quality.particles;

    for (let i = 0; i < particleCount; i++) {
      // Even random distribution in a cube around origin
      const point = new THREE.Vector3()
        .random()
        .subScalar(0.5)
        .multiplyScalar(3);
      points.push(point);

      // Random colors like original
      const color = new THREE.Color(Math.random(), Math.random(), Math.random());
      colors.push(color.r, color.g, color.b);

      // Uniform small size
      sizes.push(1.5 + Math.random() * 0.5);

      // Random twinkle offset for each particle
      twinkleOffsets.push(Math.random() * Math.PI * 2);
    }

    const geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
    geometryPoints.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometryPoints.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometryPoints.setAttribute('twinkleOffset', new THREE.Float32BufferAttribute(twinkleOffsets, 1));

    // Enhanced ShaderMaterial - closer to original but with twinkle
    const materialPoints = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        light1Position: { value: new THREE.Vector3() },
        light1Color: { value: new THREE.Color(0xff6666) },
        light2Position: { value: new THREE.Vector3() },
        light2Color: { value: new THREE.Color(0x66b3ff) },
        light3Position: { value: new THREE.Vector3() },
        light3Color: { value: new THREE.Color(0x80ff80) },
        lightRadius: { value: 0.68 },
      },
      vertexShader: `
        attribute float size;
        attribute float twinkleOffset;
        
        uniform float time;
        
        varying vec3 vPosition;
        varying float vTwinkle;
        
        void main() {
          vPosition = position;
          
          // Subtle twinkle effect
          vTwinkle = 0.85 + 0.15 * sin(time * 2.5 + twinkleOffset);
          
          gl_PointSize = size * vTwinkle;
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
        varying float vTwinkle;

        void main() {
          float intensity1 = max(0.0, 1.0 - length(light1Position - vPosition) / lightRadius);
          float intensity2 = max(0.0, 1.0 - length(light2Position - vPosition) / lightRadius);
          float intensity3 = max(0.0, 1.0 - length(light3Position - vPosition) / lightRadius);

          vec3 color = light1Color * intensity1 + light2Color * intensity2 + light3Color * intensity3;
          color = clamp(color, 0.0, 1.0);

          if (intensity1 <= 0.0 && intensity2 <= 0.0 && intensity3 <= 0.0) {
            discard;
          }

          gl_FragColor = vec4(color * vTwinkle, 1.0);
        }
      `,
      transparent: true,
    });

    const pointCloud = new THREE.Points(geometryPoints, materialPoints);
    scene.add(pointCloud);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(quality.pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.0;
    const container = document.getElementById('three-container');
    if (!container) {
      console.error("Couldn't find the container element for Three.js");
      return;
    }
    container.appendChild(renderer.domElement);

    // Post-processing for bloom and motion blur effects
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom effect (conditional based on device capability)
    if (quality.bloomEnabled) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5, // strength - subtle glow
        0.3, // radius
        0.2 // threshold - only bright things bloom
      );
      composer.addPass(bloomPass);
    }

    // No motion blur - keeps particles crisp

    // Controls setup - DISABLED for static camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false; // Disable all interaction

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });

    // Helper function to orient comet tails
    const orientComet = (lightData: typeof light1Data, currentPos: THREE.Vector3, prevPos: THREE.Vector3) => {
      const cometGroup = lightData.cometGroup;
      const velocity = new THREE.Vector3().subVectors(currentPos, prevPos);
      cometGroup.lookAt(camera.position);

      if (velocity.lengthSq() > 0.000001) {
        const velCamera = velocity.clone().applyQuaternion(camera.quaternion.clone().invert());
        const angle = Math.atan2(velCamera.y, velCamera.x);
        cometGroup.rotation.z = angle;
      }
      prevPos.copy(currentPos);
    };

    // Text reference for illumination effect
    const nameTitle = document.querySelector('.name-title') as HTMLElement | null;
    const nameSubtitle = document.querySelector('.name-subtitle') as HTMLElement | null;
    const linkItems = document.querySelectorAll('.link-item') as NodeListOf<HTMLElement>;

    // Variables for smoothing
    let smoothedIntensity = 0;
    const smoothedColor = new THREE.Color(0.8, 0.8, 0.8); // Start with base grey color
    const baseColor = new THREE.Color(0.8, 0.8, 0.8); // Base grey color

    // Animation Mode Transition
    let modeTransition = 0; // 0 = orbit, 1 = fixed layout

    // Track previous target positions for smooth transitions between modes
    // Using 'const' to satisfy linter (objects are mutated, not reassigned)
    const prevTargetPos1 = new THREE.Vector3();
    const prevTargetPos2 = new THREE.Vector3();
    const prevTargetPos3 = new THREE.Vector3();
    const currentTargetPos1 = new THREE.Vector3();
    const currentTargetPos2 = new THREE.Vector3();
    const currentTargetPos3 = new THREE.Vector3();

    let previousContent = 'home';

    // Animation loop
    const animate = () => {
      const time = Date.now() * 0.001;

      // Update time uniform for star materials and particles
      light1Data.starMaterial.uniforms.time.value = time;
      light2Data.starMaterial.uniforms.time.value = time;
      light3Data.starMaterial.uniforms.time.value = time;
      materialPoints.uniforms.time.value = time;

      const scale = 0.5;

      // 1. Calculate Standard Orbit Positions (Home Mode)
      // Light 1 (Red)
      const orbitPos1 = new THREE.Vector3(
        Math.sin(time * 0.8) * scale,
        Math.cos(time * 0.6) * scale,
        Math.cos(time * 0.4) * scale
      );
      // Light 2 (Blue)
      const orbitPos2 = new THREE.Vector3(
        Math.cos(time * 0.4) * scale,
        Math.sin(time * 0.6) * scale,
        Math.sin(time * 0.8) * scale
      );
      // Light 3 (Green)
      const orbitPos3 = new THREE.Vector3(
        Math.sin(time * 0.8) * scale,
        Math.cos(time * 0.4) * scale,
        Math.sin(time * 0.6) * scale
      );

      // Get the scene rotation for counter-rotation
      const rotationAngle = -scene.rotation.y;

      // 2. Calculate target positions based on active content
      let targetPos1: THREE.Vector3;
      let targetPos2: THREE.Vector3;
      let targetPos3: THREE.Vector3;

      const currentContent = activeContentRef.current;

      // Detect content change
      if (currentContent !== previousContent) {
        // Store previous targets
        prevTargetPos1.copy(currentTargetPos1);
        prevTargetPos2.copy(currentTargetPos2);
        prevTargetPos3.copy(currentTargetPos3);
        previousContent = currentContent;
        modeTransition = 0; // Reset transition for smooth interpolation
      }

      if (currentContent === 'projects') {
        // Projects mode - behind the three cards
        const screenSpacePos1 = new THREE.Vector3(0.288, 0.117, -0.4); // Right Card - Red (Lowered/Narrowed)
        const screenSpacePos2 = new THREE.Vector3(-0.288, 0.117, -0.4); // Left Card - Blue (Lowered/Narrowed)
        const screenSpacePos3 = new THREE.Vector3(0, 0.113, -0.4); // Center Card - Green (Lowered)

        targetPos1 = screenSpacePos1.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
        targetPos2 = screenSpacePos2.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
        targetPos3 = screenSpacePos3.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
      } else if (currentContent === 'about') {
        // About mode - stars form a standard triangle around the profile picture
        const screenSpacePos1 = new THREE.Vector3(0.05, 0.18, -0.4); // Right Bottom - Red
        const screenSpacePos2 = new THREE.Vector3(-0.05, 0.18, -0.4); // Left Bottom - Blue
        const screenSpacePos3 = new THREE.Vector3(0, 0.252, -0.4); // Top Center - Green

        targetPos1 = screenSpacePos1.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
        targetPos2 = screenSpacePos2.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
        targetPos3 = screenSpacePos3.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
      } else if (currentContent === 'contact') {
        // Contact mode - stars arranged vertically alongside the contact links
        const screenSpacePos1 = new THREE.Vector3(-0.18, 0.06, -0.35); // Top - Red (Email)
        const screenSpacePos2 = new THREE.Vector3(-0.18, 0.025, -0.35); // Middle - Blue (LinkedIn)
        const screenSpacePos3 = new THREE.Vector3(-0.18, -0.01, -0.35); // Bottom - Green (GitHub)

        targetPos1 = screenSpacePos1.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
        targetPos2 = screenSpacePos2.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
        targetPos3 = screenSpacePos3.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
      } else {
        // Home mode - use orbit positions
        targetPos1 = orbitPos1;
        targetPos2 = orbitPos2;
        targetPos3 = orbitPos3;
      }

      // Store current targets for next frame
      currentTargetPos1.copy(targetPos1);
      currentTargetPos2.copy(targetPos2);
      currentTargetPos3.copy(targetPos3);

      // 3. Smoothly transition between states
      // Increase transition speed (0.08 is faster than 0.05)
      modeTransition += (1 - modeTransition) * 0.08;

      // 4. Apply Final Positions with smooth interpolation
      // When transitioning, blend from previous target to current target
      if (modeTransition < 0.99) {
        light1.position.lerpVectors(prevTargetPos1, currentTargetPos1, modeTransition);
        light2.position.lerpVectors(prevTargetPos2, currentTargetPos2, modeTransition);
        light3.position.lerpVectors(prevTargetPos3, currentTargetPos3, modeTransition);
      } else {
        // Fully transitioned, use current targets directly
        light1.position.copy(currentTargetPos1);
        light2.position.copy(currentTargetPos2);
        light3.position.copy(currentTargetPos3);
      }

      // Apply fixed orientation for tails
      orientComet(light1Data, light1.position, prevPositions.light1);
      orientComet(light2Data, light2.position, prevPositions.light2);
      orientComet(light3Data, light3.position, prevPositions.light3);

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

      // Dim text in non-home modes so it doesn't fight the content
      const activeIntensity = currentContent !== 'home' ? smoothedIntensity * 0.3 : smoothedIntensity;

      // Blend base color with smoothed color based on intensity
      const finalColor = baseColor.clone().lerp(smoothedColor, activeIntensity);

      // Convert finalColor to RGB
      const r = Math.floor(finalColor.r * 255);
      const g = Math.floor(finalColor.g * 255);
      const b = Math.floor(finalColor.b * 255);

      // Update text styles
      const rgbColor = `rgb(${r}, ${g}, ${b})`;

      if (nameTitle && nameSubtitle) {
        nameTitle.style.color = rgbColor;
        nameTitle.style.textShadow = `0 0 ${30 * activeIntensity}px rgba(${r}, ${g}, ${b}, ${0.8 * activeIntensity})`;
        nameSubtitle.style.color = rgbColor;
        nameSubtitle.style.textShadow = `0 0 ${15 * activeIntensity}px rgba(${r}, ${g}, ${b}, ${0.6 * activeIntensity})`;
      }

      // Update link styles
      linkItems.forEach((link) => {
        link.style.color = rgbColor;
        link.style.textShadow = `0 0 ${15 * activeIntensity}px rgba(${r}, ${g}, ${b}, ${0.6 * activeIntensity})`;
      });

      scene.rotation.y = time * 0.02;

      // Render the scene with post-processing
      composer.render();

      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount
    return () => {
      if (container && renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <>
      <SEO
        title="AaronBernard.exe"
        description="Site reliability engineer Aaron Bernard's personal website."
      />
      <div id="three-container" className="w-full h-screen"></div>
      <div className="name-container">
        {/* Conditional Rendering Based on activeContent */}
        {activeContent === 'home' && (
          <>
            <h1 className="name-title">Aaron Bernard</h1>
            <p className="name-subtitle">Site Reliability Engineer</p>
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
                  Hello, I&apos;m Aaron Bernard. I am a Site Reliability Engineer at Trimble, I am focused on improving reliability through automation, observability, and clear operational practices.
                </p>
              </section>

              {/* Section 2: Background */}
              <section className="about-subsection">
                <h2 className="about-heading">
                  <span className="section-number">2.</span> Background
                </h2>
                <p className="about-text">
                  I design and operate production observability and monitoring: New Relic synthetic monitors, Terraform-managed monitoring and alerting, Power BI data gateways for operational reporting, and Kubernetes & Azure operations.
                </p>
              </section>

              {/* Section 3: Interests & Goals */}
              <section className="about-subsection">
                <h2 className="about-heading">
                  <span className="section-number">3.</span> Interests & Goals
                </h2>
                <p className="about-text">
                  I prioritize automating repetitive work, improving incident response and runbooks, and helping teams scale reliably with practical tooling and measurable SLIs.
                </p>
              </section>
            </div>
          </div>
        )}
        {activeContent === 'contact' && (
          <div id="contact-form" className="contact-content">
            <ul className="contact-list">
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowContactForm(true); }}>
                  Email: aaronbernard24@gmail.com
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
        {activeContent === 'projects' && (
          <div className="content">
            <ProjectsCarousel />
          </div>
        )}
      </div>
      {/* Modal for Contact Form - outside name-container for proper z-index */}
      {showContactForm && (
        <div className="modal-overlay" onClick={() => setShowContactForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowContactForm(false)}>
              ✕
            </button>
            <h2 style={{ fontFamily: 'KIMM_Bold, sans-serif', marginBottom: '1rem', textAlign: 'center' }}>Send a Message</h2>
            <ContactForm />
          </div>
        </div>
      )}
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