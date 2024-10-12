import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showText, setShowText] = useState(false); // Control when to show About text

  useEffect(() => {
    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // 2. Lights and Particles Setup (similar to main page)
    const orbLight = new THREE.PointLight(0x66b3ff, 2, 10);
    orbLight.position.set(0, 0, 0);
    scene.add(orbLight);

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x66b3ff });
    const orb = new THREE.Mesh(geometry, material);
    orbLight.add(orb);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // 3. Smooth Camera Animation
    const targetPosition = new THREE.Vector3(0, 2, 3); // Target position for camera
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Move the orb in a circular path
      orb.position.x = Math.sin(elapsedTime) * 5;
      orb.position.y = Math.cos(elapsedTime) * 5;

      // Smoothly move the camera towards the target position
      camera.position.lerp(targetPosition, 0.02);
      camera.lookAt(orb.position);

      // Check if the camera is close enough to the target to reveal the text
      if (camera.position.distanceTo(targetPosition) < 0.1) {
        setShowText(true); // Show the About text
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Clean up on unmount
    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <SEO title="About Me" description="Learn more about me" />
      <div className="min-h-screen bg-black text-white relative">
        <div ref={containerRef} className="absolute inset-0 z-0"></div>
        <div className="relative z-10">
          <Navbar />
          {showText && (
            <main className="container mx-auto py-16 px-8 fadeIn">
              <h1 className="text-5xl font-extrabold text-center mb-12 tracking-wide">
                About Me
              </h1>
              <Section
                title="Hello!"
                content="Hello, I’m Aaron Bernard, and this is my professional portfolio..."
              />
              <Section
                title="My Background"
                content="I have a background in web development, customer service..."
              />
              <Section
                title="My Interests"
                content="I am particularly interested in building software that merges..."
              />
              <Section
                title="Generative Security Applications"
                content="I’m currently taking a class on Generative Security..."
              />
              <Section
                title="Continuous Improvement"
                content="As part of my journey towards becoming an SRE, I am continuously..."
              />
            </main>
          )}
          <Footer />
        </div>
      </div>
    </>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <section className="mb-12 bg-gray-800 p-8 rounded-lg shadow-lg transition transform hover:scale-105 duration-300 ease-in-out fadeIn">
      <h2 className="text-3xl font-semibold mb-4">{title}</h2>
      <p className="text-lg leading-relaxed">{content}</p>
    </section>
  );
}
