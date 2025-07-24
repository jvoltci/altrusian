'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';


const ThreeScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position the camera to see the full-screen plane
    camera.position.z = 1; 
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // === Vortex Shader Code ===
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            // Use this simple setup for a full-screen shader
            gl_Position = vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        varying vec2 vUv;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform vec2 u_resolution;

        // 2D Random function
        float random (vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        // 2D Noise function
        float noise (vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f*f*(3.0-2.0*f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        // Fractional Brownian Motion for turbulence
        float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(st);
                st *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }
        
        // Star generation
        float star(vec2 st, float size, float twinkle_speed) {
            vec2 grid = floor(st);
            vec2 f = fract(st);
            float star_val = random(grid);
            
            float t = u_time * twinkle_speed + star_val * 20.0;
            float twinkle = sin(t) * 0.5 + 0.5;

            if (star_val > 0.99) {
                float m = 1.0 - smoothstep(0.0, size, length(f - 0.5));
                return m * twinkle;
            }
            return 0.0;
        }

        void main() {
            vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
            vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / u_resolution.y;
            
            // --- Background Nebula/Vortex Effect ---
            vec2 q = vec2(0.0);
            q.x = fbm(st + 0.00 * u_time);
            q.y = fbm(st + vec2(1.0));

            vec2 r = vec2(0.0);
            r.x = fbm(st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time);
            r.y = fbm(st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);
            float f = fbm(st+r);

            vec3 color = mix(vec3(0.1, 0.0, 0.4), // Deep blue/purple
                             vec3(0.9, 0.2, 0.5), // Magenta/pink
                             clamp((f*f)*3.0,0.0,1.0));

            color = mix(color,
                        vec3(0.0, 0.0, 0.0), // Black
                        clamp(length(q),0.0,1.0));

            color = mix(color,
                        vec3(0.9, 1.0, 1.0), // White highlights
                        clamp(length(r.x),0.0,1.0));
            
            color = (f*f*f+.6*f*f+.5*f)*color;

            // --- Starfield ---
            vec2 star_st = st * 30.0 + r * 2.0; 
            vec3 star_color = vec3(star(star_st, 0.15, 0.5));
            color += star_color;

            // --- Mouse Light ---
            float mouse_dist = distance(st, mouse);
            float mouse_glow = 1.0 - smoothstep(0.0, 0.15, mouse_dist);
            color += mouse_glow * 0.5;

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    // Shader Material and Uniforms
    const uniforms = {
        u_time: { value: 0.0 },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
    });

    // A simple plane that covers the entire screen
    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Event Listeners
    const handleMouseMove = (event: MouseEvent) => {
        uniforms.u_mouse.value.x = event.clientX;
        uniforms.u_mouse.value.y = window.innerHeight - event.clientY; // Invert Y
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        uniforms.u_resolution.value.set(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      uniforms.u_time.value = elapsedTime;
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };
    tick();

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl"></canvas>;
};

export default ThreeScene;