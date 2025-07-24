"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface Props {
  active: boolean;
}

export default function BlackHoleScene({ active }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0.0 },
      uProgress: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(width, height) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uTime;
        uniform float uProgress;
        uniform vec2 uResolution;

        // Psuedo-random number generator
        float rand(vec2 co){
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / uResolution.xy;
          vec2 center = vec2(0.5);
          vec2 delta = uv - center;
          
          float dist = length(delta);
          float angle = atan(delta.y, delta.x);

          // 1. Orbital Velocity & Gravitational Pull
          // Base velocity: inner matter moves faster
          angle -= (uTime * 0.3) / dist;
          // The "pull" on hover: an intense, exponential swirl
          angle += uProgress * 20.0 * exp(-dist * 5.0);

          // Apply the calculated swirl to the coordinates
          vec2 swirl_uv = center + dist * vec2(cos(angle), sin(angle));

          // 2. Create the Accretion Disk (glowing matter)
          // Generate a field of random "stars" or "gas"
          float stars = rand(floor(swirl_uv * 300.0));
          
          // Shape the disk into a bright band and add a soft edge
          float disk_shape = smoothstep(0.1, 0.12, dist) * smoothstep(0.4, 0.2, dist);
          stars *= disk_shape;
          stars = pow(stars, 25.0); // Make only the brightest points shine through

          // 3. Define the Color and Event Horizon (black center)
          vec3 color = vec3(1.0, 0.7, 0.3) * stars; // Fiery orange color
          
          // Fade in the entire effect with uProgress
          color *= uProgress;

          // Carve out the black hole at the center
          color *= smoothstep(0.09, 0.1, dist);

          // 4. Final Output
          float alpha = pow(length(color), 0.5); // Use color intensity for alpha
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uProgress.value += activeRef.current ? 0.02 : -0.03;
      uniforms.uProgress.value = THREE.MathUtils.clamp(uniforms.uProgress.value, 0, 1);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return; // Add a safety check
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      if (container) {
          container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    />
  );
}