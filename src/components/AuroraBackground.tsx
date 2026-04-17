import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface AuroraBackgroundProps {
  className?: string;
  color1?: string;
  color2?: string;
}

function hexToVec3(hex: string): [number, number, number] {
  let hexStr = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (hexStr.length === 6) {
    r = parseInt(hexStr.slice(0, 2), 16) / 255;
    g = parseInt(hexStr.slice(2, 4), 16) / 255;
    b = parseInt(hexStr.slice(4, 6), 16) / 255;
  }
  return [r, g, b];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec2 uMouse;

varying vec2 vUv;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = vUv;
    vec2 mouse = uMouse;
    
    // Adjust UV for aspect ratio
    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv;
    p.x *= aspect;
    
    // Slow down time for smoothness
    float time = iTime * 0.15;
    
    // Mouse movement interaction
    vec2 mOffset = (mouse - 0.5) * 0.2;
    p += mOffset;
    
    // Organic wave movement using noise
    float n1 = fbm(p * 1.5 + vec2(time * 0.2, time * 0.1));
    float n2 = fbm(p * 2.0 - vec2(time * 0.15, n1 * 0.5));
    
    // Create aurora bands
    float band = sin(p.x * 3.0 + n2 * 4.0 + time) * 0.5 + 0.5;
    band *= pow(fbm(p * 2.5 + time * 0.3), 1.5);
    
    // Use second layer for depth
    float band2 = sin(p.x * 2.5 - n1 * 3.0 - time * 0.8) * 0.5 + 0.5;
    band2 *= fbm(p * 3.5 - time * 0.2);
    
    float intensity = (band + band2 * 0.6) * 0.8;
    intensity = smoothstep(0.1, 0.9, intensity);
    
    // Colors: uColor1 (#f7f7f7), uColor2 (#e100ff)
    // Dark deep base for premium look
    vec3 baseCol = vec3(0.02, 0.015, 0.04);
    
    // Mix the two colors based on the intensity and vertical gradient
    vec3 auroraCol = mix(uColor2, uColor1, p.y + n2 * 0.2);
    
    // Final composite
    vec3 finalColor = mix(baseCol, auroraCol, intensity * 0.5);
    
    // Add glowing highlights
    finalColor += uColor2 * (pow(intensity, 4.0) * 0.15);
    finalColor += uColor1 * (pow(intensity, 8.0) * 0.1);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  className = '',
  color1 = '#f7f7f7',
  color2 = '#e100ff'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    
    function resize() {
      if (!container) return;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setSize(width, height);
      if (program) {
        program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
      }
    }

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height]
        },
        uColor1: { value: hexToVec3(color1) },
        uColor2: { value: hexToVec3(color2) },
        uMouse: { value: [0.5, 0.5] }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    
    let animationFrameId: number;
    function update(time: number) {
      animationFrameId = requestAnimationFrame(update);
      program.uniforms.iTime.value = time * 0.001;
      renderer.render({ scene: mesh });
    }

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    window.addEventListener('resize', resize);
    resize();

    animationFrameId = requestAnimationFrame(update);
    container.appendChild(gl.canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      program.uniforms.uMouse.value = [x, y];
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color1, color2]);

  return <div ref={containerRef} className={`fixed inset-0 -z-10 pointer-events-none w-full h-full ${className}`} />;
};

export default AuroraBackground;
