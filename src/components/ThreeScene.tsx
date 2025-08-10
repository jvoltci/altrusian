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
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // === Starry Night Shader Code ===
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        #define PI 3.14159265359

        varying vec2 vUv;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_rand_offset; // NEW: Uniform for the random offset

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

        // Fractional Brownian Motion for turbulence (Further Optimized for Mobile)
        float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 3; i++) {
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

            float t = u_time * twinkle_speed * random(grid) + star_val * 20.0;
            float twinkle = sin(t) * 0.5 + 0.5;

            if (star_val > 0.98) {
                float m = 1.0 - smoothstep(0.0, size, length(f - 0.5));
                return m * twinkle;
            }
            return 0.0;
        }

        // Mountain Generation
        float mountain(vec2 st) {
            float h = fbm(st * 0.3 + 0.3);
            h = h * fbm(st * 0.8 + h);
            h = pow(h, 2.5);
            return h;
        }

        // REALISTIC Shooting Star
        vec3 shooting_star(vec2 st, float time) {
            float seed = floor(time * 0.3);
            if (random(vec2(seed, seed * 0.5)) < 0.7) {
                return vec3(0.0);
            }
            float time_frac = fract(time * 0.3);
            vec2 start_pos = vec2(random(vec2(seed, seed)) * 2.0 - 1.0, 1.2);
            vec2 dir = normalize(vec2(random(vec2(seed * 0.5, seed * 0.2)) * 0.6 - 0.3, -1.0));
            float speed = random(vec2(seed * 0.1, seed * 0.9)) * 3.5 + 2.5;
            dir.x += sin(time_frac * PI) * 0.2;
            vec2 pos = start_pos + dir * time_frac * speed;
            float star_dist = distance(st, pos);
            float star_brightness = smoothstep(0.01, 0.0, star_dist);
            float tail_length = 0.2;
            float proj = dot(st - pos, -dir);
            vec2 proj_pos = pos - dir * proj;
            float tail_dist = distance(st, proj_pos);
            float tail_brightness = 0.0;
            if (proj > 0.0 && proj < tail_length) {
                tail_brightness = smoothstep(0.03, 0.0, tail_dist) * (1.0 - proj / tail_length);
            }
            float total_brightness = star_brightness + tail_brightness * 0.8;
            float life = sin(time_frac * PI);
            vec3 star_color = vec3(0.8, 0.9, 1.0);
            return vec3(total_brightness * life) * star_color;
        }

        void main() {
            vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
            vec3 color = vec3(0.0, 0.0, 0.05);

            // Starfield (Density reduced for mobile)
            vec2 star_st = st * 60.0;
            vec3 star_color = vec3(star(star_st, 0.1, 0.2));
            star_color += vec3(star(star_st * 0.5, 0.15, 0.1));
            color += star_color;

            // Aurora Borealis
            vec2 aurora_st = vUv;
            aurora_st += u_rand_offset; // NEW: Apply the random offset
            aurora_st.x *= 2.0;
            aurora_st.y -= u_time * 0.03;
            float n = fbm(aurora_st * 1.5);
            float n2 = fbm(aurora_st * 2.5 + 10.0);
            float aurora = smoothstep(0.4, 0.6, n) * (1.0 - smoothstep(0.5, 0.7, n));
            float aurora2 = smoothstep(0.3, 0.8, n2) * (1.0 - smoothstep(0.6, 0.7, n2));
            vec3 aurora_color = vec3(0.1, 0.9, 0.5);
            vec3 aurora_color2 = vec3(0.2, 0.5, 0.9);
            color += aurora * aurora_color * (1.0 - vUv.y);
            color += aurora2 * aurora_color2 * (1.0 - vUv.y) * 0.5;

            // Shooting Star
            color += shooting_star(st, u_time);
            
            // Mountain Silhouette
            vec2 mountain_st = vUv * vec2(1.5, 1.0);
            float mountain_shape = mountain(mountain_st);
            float mountain_mask = smoothstep(0.1, 0.15 + (vUv.x * (1.0-vUv.x) * 0.4) , vUv.y - mountain_shape * 0.4);
            vec3 mountain_color = vec3(0.02, 0.03, 0.04);
            color = mix(mountain_color, color, mountain_mask);

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    // Shader Material and Uniforms
    const uniforms = {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        // NEW: Define the random offset uniform and give it a random value on load
        u_rand_offset: { value: new THREE.Vector2(Math.random() * 100.0, Math.random() * 100.0) }
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

    // Event Listener for screen resizing
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
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl"></canvas>;
};

export default ThreeScene;