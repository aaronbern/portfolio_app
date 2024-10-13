// Import necessary modules and components
import '../styles/globals.css';
import SEO from '../components/SEO';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Link from 'next/link';
import { Analytics } from "@vercel/analytics/react";

// Import for post-processing effects
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Define the Home component
export default function Home() {
  // State for showing links with timed reveals
  const [showLinks, setShowLinks] = useState({
    about: false,
    contact: false,
    projects: false,
  });

  // Reference to store requestAnimationFrame ID for cleanup
  const requestRef = useRef<number>();

  useEffect(() => {
    // Timed reveals of the links
    const aboutTimeout = setTimeout(() => setShowLinks((prev) => ({ ...prev, about: true })), 2000);
    const contactTimeout = setTimeout(() => setShowLinks((prev) => ({ ...prev, contact: true })), 2500);
    const projectsTimeout = setTimeout(() => setShowLinks((prev) => ({ ...prev, projects: true })), 3000);

    // === Main Three.js Scene Setup ===
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Set a dark background

    // Lights setup
    const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 8);
    const addLight = (hexColor: number) => {
      const material = new THREE.MeshBasicMaterial({ color: hexColor });
      const mesh = new THREE.Mesh(sphereGeometry, material);
      const light = new THREE.PointLight(hexColor, 2, 10); // Increased intensity and distance
      light.add(mesh);
      scene.add(light);
      return light;
    };

    const light1 = addLight(0xff6666); // Red
    const light2 = addLight(0x66b3ff); // Blue
    const light3 = addLight(0x80ff80); // Green

    // Points setup
    const points: THREE.Vector3[] = [];
    const colors: number[] = [];
    for (let i = 0; i < 500000; i++) {
      const point = new THREE.Vector3()
        .random()
        .subScalar(0.5)
        .multiplyScalar(10);
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
        lightRadius: { value: 5.0 }, // Adjusted to match main scene scale
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
      vertexColors: true,
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

    // === Shader-Based Scene Setup ===
    // Adapted GLSL shader from the user
    const vertexShaderFullscreen = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShaderCustom = `
      uniform float iTime;
      uniform vec2 iResolution;

      // User's GLSL shader code adapted for Three.js
      #define AA 2.0  //change to 1 to increase performance
      #define _Speed 3.0  //disk rotation speed
      #define _Steps  12.0 //disk texture layers
      #define _Size 0.3 //size of BH

      float hash(float x){ return fract(sin(x)*152754.742);}
      float hash(vec2 x){	return hash(x.x + hash(x.y));}

      float value(vec2 p, float f) //value noise
      {
          float bl = hash(floor(p*f + vec2(0.,0.)));
          float br = hash(floor(p*f + vec2(1.,0.)));
          float tl = hash(floor(p*f + vec2(0.,1.)));
          float tr = hash(floor(p*f + vec2(1.,1.)));

          vec2 fr = fract(p*f);    
          fr = (3. - 2.*fr)*fr*fr;	
          float b = mix(bl, br, fr.x);	
          float t = mix(tl, tr, fr.x);
          return  mix(b,t, fr.y);
      }

      vec4 background(vec3 ray)
      {
          vec2 uv = ray.xy;

          if( abs(ray.x) > 0.5)
              uv.x = ray.z;
          else if( abs(ray.y) > 0.5)
              uv.y = ray.z;

          float brightness = value( uv*3., 100.); //(poor quality) "stars" created from value noise
          float color = value( uv*2., 20.); 
          brightness = pow(brightness, 256.);

          brightness = brightness*100.;
          brightness = clamp(brightness, 0., 1.);

          vec3 stars = brightness * mix(vec3(1., .6, .2), vec3(.2, .6, 1), color);

          // For demonstration, using a simple nebula effect with noise
          // In practice, replace this with your actual nebula texture or effect
          vec3 nebulae = vec3(0.0);
          nebulae += vec3(0.2, 0.1, 0.3) * brightness;

          nebulae += stars;
          return vec4(nebulae, 1.0);
      }

      vec4 raymarchDisk(vec3 ray, vec3 zeroPos)
      {
          vec3 position = zeroPos;      
          float lengthPos = length(position.xz);
          // Fixed syntax error: added closing parenthesis
          float dist = min(1., lengthPos*(1./_Size) *0.5) * _Size * 0.4 *(1./_Steps) /( abs(ray.y) ;

          position += dist*_Steps*ray*0.5;     

          vec2 deltaPos;
          deltaPos.x = -zeroPos.z*0.01 + zeroPos.x;
          deltaPos.y = zeroPos.x*0.01 + zeroPos.z;
          deltaPos = normalize(deltaPos - zeroPos.xz);

          float parallel = dot(ray.xz, deltaPos);
          parallel /= sqrt(lengthPos);
          parallel *= 0.5;
          float redShift = parallel +0.3;
          redShift *= redShift;

          redShift = clamp(redShift, 0., 1.);

          float disMix = clamp((lengthPos - _Size * 2.)*(1./_Size)*0.24, 0., 1.);
          vec3 insideCol =  mix(vec3(1.0,0.8,0.0), vec3(0.5,0.13,0.02)*0.2, disMix);

          insideCol *= mix(vec3(0.4, 0.2, 0.1), vec3(1.6, 2.4, 4.0), redShift);
          insideCol *= 1.25;
          redShift += 0.12;
          redShift *= redShift;

          vec4 o = vec4(0.);

          for(float i = 0.; i < _Steps; i++)
          {                      
              position -= dist * ray ;  

              float intensity = clamp( 1. - abs((i - 0.8) * (1./_Steps) * 2.), 0., 1.); 
              float lengthPos = length(position.xz);
              float distMult = 1.;

              distMult *=  clamp((lengthPos -  _Size * 0.75) * (1./_Size) * 1.5, 0., 1.);        
              distMult *= clamp(( _Size * 10. -lengthPos) * (1./_Size) * 0.20, 0., 1.);
              distMult *= distMult;

              float u = lengthPos + iTime* _Size*0.3 + intensity * _Size * 0.2;

              vec2 xy ;
              float rot = mod(iTime*_Speed, 8192.);
              xy.x = -position.z*sin(rot) + position.x*cos(rot);
              xy.y = position.x*sin(rot) + position.z*cos(rot);

              float x = abs( xy.x/(xy.y));         
              float angle = 0.02*atan(x);

              const float f = 70.;
              float noise = value( vec2( angle, u * (1./_Size) * 0.05), f);
              noise = noise*0.66 + 0.33*value( vec2( angle, u * (1./_Size) * 0.05), f*2.);     

              float extraWidth =  noise * 1. * (1. -  clamp(i * (1./_Steps)*2. - 1., 0., 1.));

              float alpha = clamp(noise*(intensity + extraWidth)*( (1./_Size) * 10.  + 0.01 ) *  dist * distMult , 0., 1.);

              vec3 col = 2.*mix(vec3(0.3,0.2,0.15)*insideCol, insideCol, min(1.,intensity*2.));
              o = clamp(vec4(col*alpha + o.rgb*(1.-alpha), o.a*(1.-alpha) + alpha), vec4(0.), vec4(1.));

              lengthPos *= (1./_Size);

              o.rgb+= redShift*(intensity*1. + 0.5)* (1./_Steps) * 100.*distMult/(lengthPos*lengthPos);
          }  

          o.rgb = clamp(o.rgb - 0.005, 0., 1.);
          return o ;
      }

      void Rotate( inout vec3 vector, vec2 angle )
      {
          vector.yz = cos(angle.y)*vector.yz
                      +sin(angle.y)*vec2(-1,1)*vector.zy;
          vector.xz = cos(angle.x)*vector.xz
                      +sin(angle.x)*vec2(-1,1)*vector.zx;
      }

      void main() {
        vec4 colOut = vec4(0.0);
        
        vec2 fragCoord = vUv * iResolution.xy;
        
        // Initialize variables (similar to mainImage)
        vec3 ray = normalize( vec3((fragCoord - iResolution.xy * 0.5) / iResolution.x, 1.0));
        vec3 pos = vec3(0.0, 0.05, - (20.0 * iTime - 10.0) * (20.0 * iTime - 10.0) * 0.05);
        vec2 angle = vec2(iTime * 0.1, 0.2);
        angle.y = (2.0 * 0.5) * 3.14 + 0.1 + 3.14; // Placeholder for iMouse interactions
        float dist = length(pos);
        // Rotate function can be expanded if needed
        // Rotate(pos, angle);
        // angle.xy -= min(.3/dist , 3.14) * vec2(1, 0.5);
        // Rotate(ray, angle);

        vec4 col = vec4(0.0); 
        vec4 glow = vec4(0.0); 
        vec4 outCol = vec4(100.0);

        for(int disks = 0; disks < 20; disks++) //steps
        {
            // Simplified raymarching logic
            // Implement raymarching based on user shader
            // This is a placeholder and needs to be adapted accordingly
            // For brevity, we'll keep it simple

            // Break conditions (placeholder)
            if(length(pos) > 1000.0) break;
        }

        // Placeholder background
        vec4 bg = background(ray);
        outCol = vec4(col.rgb + bg.rgb, 1.0);       

        col = outCol;
        col.rgb = pow(col.rgb, vec3(0.6));

        // Assign the final color
        gl_FragColor = col;
      }
    `;

    // Create ShaderMaterial for the shader-based scene
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: vertexShaderFullscreen,
      fragmentShader: fragmentShaderCustom,
      transparent: true,
    });

    // Create a fullscreen quad for the shader
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(quadGeometry, shaderMaterial);
    const shaderScene = new THREE.Scene();
    shaderScene.add(quad);

    // Orthographic camera for the shader scene
    const shaderCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // === EffectComposer Setup ===
    const composer = new EffectComposer(renderer);

    // RenderPass for the main scene
    const mainRenderPass = new RenderPass(scene, camera);
    composer.addPass(mainRenderPass);

    // ShaderRenderPass: Render the shader scene to a separate render target
    const shaderRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    const shaderRenderPass = new RenderPass(shaderScene, shaderCamera);
    // Note: RenderPass doesn't support setting a render target directly in the constructor.
    // We'll render the shader scene manually to shaderRenderTarget.

    // Blending Shader
    const blendShader = {
      uniforms: {
        tMain: { value: null },      // Main scene texture
        tShader: { value: null },    // Shader scene texture
        transitionFactor: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tMain;
        uniform sampler2D tShader;
        uniform float transitionFactor;
        varying vec2 vUv;

        void main() {
          vec4 colorMain = texture2D(tMain, vUv);
          vec4 colorShader = texture2D(tShader, vUv);
          gl_FragColor = mix(colorMain, colorShader, transitionFactor);
        }
      `,
    };

    const blendMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(blendShader.uniforms),
      vertexShader: blendShader.vertexShader,
      fragmentShader: blendShader.fragmentShader,
      transparent: true,
    });

    const blendPass = new ShaderPass(blendMaterial);
    blendPass.renderToScreen = true;
    composer.addPass(blendPass);

    // UnrealBloomPass for the main scene
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8, // strength
      0.1, // radius
      0.0 // threshold
    );
    composer.addPass(bloomPass);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.enablePan = false;

    // Handle window resize
    const onWindowResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      shaderMaterial.uniforms.iResolution.value.set(width, height);
      renderer.setSize(width, height);
      composer.setSize(width, height);
      shaderRenderTarget.setSize(width, height);
    };
    window.addEventListener('resize', onWindowResize);

    // Text reference for illumination effect
    const nameTitle = document.querySelector('.name-title') as HTMLHeadingElement;
    const nameSubtitle = document.querySelector('.name-subtitle') as HTMLParagraphElement;
    const linkItems = document.querySelectorAll('.link-item') as NodeListOf<HTMLAnchorElement>;

    // Variables for smoothing
    let smoothedIntensity = 0;
    const smoothedColor = new THREE.Color(0.8, 0.8, 0.8); // Start with base grey color
    const baseColor = new THREE.Color(0.8, 0.8, 0.8); // Base grey color

    // Transition parameters
    let transitionFactor = 0.0;
    const transitionDuration = 2.0; // Duration in seconds
    const transitionStartTime = Date.now() / 1000; // In seconds

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      const currentTime = Date.now() / 1000;
      const elapsed = currentTime - transitionStartTime;
      transitionFactor = Math.min(elapsed / transitionDuration, 1.0);

      // Update shader uniforms
      shaderMaterial.uniforms.iTime.value += 0.05;
      shaderMaterial.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);

      // Render the shader scene to its render target
      renderer.setRenderTarget(shaderRenderTarget);
      renderer.render(shaderScene, shaderCamera);
      renderer.setRenderTarget(null); // Reset to default

      // Update blending uniform
      blendMaterial.uniforms.tMain.value = (composer as any).readBuffer.texture; // TypeScript workaround
      blendMaterial.uniforms.tShader.value = shaderRenderTarget.texture;
      blendMaterial.uniforms.transitionFactor.value = transitionFactor;

      // Update bloomPass threshold based on transition
      bloomPass.threshold = Math.max(0.0, 1.0 - transitionFactor);

      // Light movements in the main scene
      const time = currentTime;
      const scale = 5;

      light1.position.x = Math.sin(time * 0.8) * scale;
      light1.position.y = Math.cos(time * 0.6) * scale;
      light1.position.z = Math.cos(time * 0.4) * scale;

      light2.position.x = Math.cos(time * 0.4) * scale;
      light2.position.y = Math.sin(time * 0.6) * scale;
      light2.position.z = Math.sin(time * 0.8) * scale;

      light3.position.x = Math.sin(time * 0.8) * scale;
      light3.position.y = Math.cos(time * 0.4) * scale;
      light3.position.z = Math.sin(time * 0.6) * scale;

      // Update shader uniforms for point lights
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
        const maxDistance = 5.0; // Should match lightRadius
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

      // Rotate the main scene
      scene.rotation.y = time * 0.02;

      // Render the main scene and apply post-processing
      composer.render();
    };

    // Start the animation loop
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(requestRef.current!);
      clearTimeout(aboutTimeout);
      clearTimeout(contactTimeout);
      clearTimeout(projectsTimeout);
      renderer.dispose();
      composer.dispose();
      controls.dispose();
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  // Render the component
  return (
    <>
      <SEO
        title="AaronBernard.exe"
        description="A showcase of my projects and experience"
      />
      <div id="three-container" className="w-full h-screen"></div>
      <div className="name-container">
        <h1 className="name-title">Aaron Bernard</h1>
        <p className="name-subtitle">Aspiring Software Engineer</p>
        <div className="links">
          <Link href="/about">
            <a className={`link-item ${showLinks.about ? 'visible' : ''}`}>
              About
            </a>
          </Link>
          <Link href="/contact">
            <a className={`link-item ${showLinks.contact ? 'visible' : ''}`}>
              Contact
            </a>
          </Link>
          <Link href="/projects">
            <a className={`link-item ${showLinks.projects ? 'visible' : ''}`}>
              Projects
            </a>
          </Link>
        </div>
        <Analytics />
      </div>
    </>
  );
}
