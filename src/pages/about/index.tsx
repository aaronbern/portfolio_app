import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
// @ts-ignore
import * as THREE from 'three';
// @ts-ignore
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
// @ts-ignore
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
// @ts-ignore
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Lights for shading the orb
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x66b3ff, 1.5);
    pointLight.position.set(2, 3, 5);
    scene.add(pointLight);

    // Orb with standard material for shading
    const orbGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const orbMaterial = new THREE.MeshStandardMaterial({
      color: 0x66b3ff,
      roughness: 0.5,
      metalness: 0.1,
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(0, 0, 0);
    scene.add(orb);

    // Custom ShaderMaterial for the particles
    const particleShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x66b3ff) },
      },
      vertexShader: `
        uniform float uTime;
        void main() {
          vec3 pos = position;
          pos.x += sin(uTime + position.y) * 0.1; // Swaying effect
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 2.0; // Particle size
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5)); // Circular shape
          if (dist > 0.5) discard; // Remove non-circular parts
          gl_FragColor = vec4(uColor, 1.0);
        }
      `,
      transparent: true,
    });

    // Particle system using ShaderMaterial
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particleSystem = new THREE.Points(
      particlesGeometry,
      particleShaderMaterial
    );
    scene.add(particleSystem);

    // Bloom effect setup
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // Intensity
      0.4, // Radius
      0.85 // Threshold
    );
    composer.addPass(bloomPass);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update uniforms for particles
      particleShaderMaterial.uniforms.uTime.value = elapsedTime;

      // Orb rotation for subtle animation
      orb.rotation.y = elapsedTime * 0.5;

      // Render with bloom effect
      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <SEO title="About Me | Aaron Bernard" description="Learn more about Aaron Bernard." />
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
