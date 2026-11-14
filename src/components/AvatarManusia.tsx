import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AvatarModel } from '../game/avatarModel';
import { AvatarConfig, AvatarAnimState } from '../game/types';

export interface AvatarManusiaProps {
  config: AvatarConfig;
  action?: AvatarAnimState;
  viewAngle?: 'depan' | 'samping' | 'belakang';
  size?: number | string;
  width?: string | number;
  height?: string | number;
  interactive?: boolean; // 360° drag rotation
  autoRotate?: boolean;
  showPedestal?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * <AvatarManusia />
 * - 100% 3D Manusia Kartun Mulus (Sphere, Capsule, Cylinder - ZERO BoxGeometry)
 * - Proporsi Manusia Nyata: Kepala 1, Badan 3, Kaki 3 (Tinggi, langsing, kaki panjang)
 * - Muka Kartun Nempel di Depan Kepala & 100% Kelihatan (Rambut DILARANG nutupin mata)
 * - Ayu (Cewe): Cardigan pink + rok plisket biru + mary jane + pita pink + 1 tangan di pinggang
 * - Faiz (Cowo): Hoodie biru muda + jeans + sneakers + two block
 * - Full body keliatan, bisa drag muter 360°, napas halus & kedip
 */
export default function AvatarManusia({
  config,
  action = 'idle',
  viewAngle = 'depan',
  size,
  width,
  height,
  interactive = true,
  autoRotate = false,
  showPedestal = false,
  className = '',
  onClick,
}: AvatarManusiaProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const avatarModelRef = useRef<AvatarModel | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isDragging = useRef<boolean>(false);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const rotationY = useRef<number>(0);
  const rotationX = useRef<number>(0);

  const finalW = width || size || '100%';
  const finalH = height || size || (typeof size === 'number' ? size : 340);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 300;
    const h = container.clientHeight || 340;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera calibrated for tall 1:3:3 full body cartoon human (height ~2.35)
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
    camera.position.set(0, 1.25, 4.3);
    camera.lookAt(0, 1.15, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Environment Lighting (soft reflections on clothing & eyes)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Key, Fill & Rim Lights
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x93c5fd, 1.1);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(2.5, 6, 3.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(512, 512);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xf472b6, 0.5);
    rimLight.position.set(-2.5, 3.5, -3.5);
    scene.add(rimLight);

    // Optional subtle pedestal
    if (showPedestal) {
      const pedGeo = new THREE.CylinderGeometry(0.75, 0.82, 0.05, 32);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
      });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = -0.025;
      pedestal.receiveShadow = true;
      scene.add(pedestal);
    }

    // Instantiate Smooth Cartoon Human Model
    const avatar = new AvatarModel(config);
    avatar.setAnimation(action);
    scene.add(avatar.group);
    avatarModelRef.current = avatar;

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw === 0 || nh === 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 60 FPS Render Loop with natural breathing, blinking, and walking cycle
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (autoRotate && !isDragging.current) {
        rotationY.current += 0.008;
      }

      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.x = rotationX.current;
        avatarModelRef.current.group.rotation.y = rotationY.current;
        avatarModelRef.current.update(elapsedTime, action === 'walk');
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (avatarModelRef.current) {
        avatarModelRef.current.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Config on the fly
  useEffect(() => {
    const avatar = avatarModelRef.current;
    if (!avatar) return;

    avatar.updateWardrobe(config);
    avatar.setAnimation(action);
  }, [config, action]);

  // Snap horizontal preview yaw when user clicks Depan / Samping / Belakang
  useEffect(() => {
    if (viewAngle === 'depan') {
      rotationY.current = 0;
      rotationX.current = 0;
    } else if (viewAngle === 'samping') {
      rotationY.current = Math.PI * 0.5;
      rotationX.current = 0;
    } else if (viewAngle === 'belakang') {
      rotationY.current = Math.PI;
      rotationX.current = 0;
    }
  }, [viewAngle]);

  // Pointer / Touch 360° Drag Rotate Handlers (Up, Down, Left, Right)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDragging.current = true;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !interactive) return;
    const deltaX = e.clientX - lastX.current;
    const deltaY = e.clientY - lastY.current;
    lastX.current = e.clientX;
    lastY.current = e.clientY;

    // Geser Horizontal: Ke kanan -> puter kanan, ke kiri -> puter kiri
    rotationY.current += deltaX * 0.015;

    // Geser Vertikal: Ke atas -> puter ke atas, ke bawah -> puter ke bawah
    rotationX.current = Math.max(-0.45, Math.min(0.45, rotationX.current - deltaY * 0.012));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{
        width: typeof finalW === 'number' ? `${finalW}px` : finalW,
        height: typeof finalH === 'number' ? `${finalH}px` : finalH,
        touchAction: interactive ? 'none' : 'auto',
        cursor: interactive ? 'grab' : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div ref={mountRef} className="w-full h-full flex items-center justify-center" />

      {interactive && (
        <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] text-slate-500 font-bold bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs">
          ↻ Putar 360° (Atas/Bawah/Kiri/Kanan)
        </div>
      )}
    </div>
  );
}
