"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function createTaperedTubeGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radiusFunc: (u: number) => number,
  radialSegments: number,
  closed: boolean
) {
  const frames = curve.computeFrenetFrames(tubularSegments, closed);
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    const p = curve.getPointAt(u);
    const r = radiusFunc(u);

    const N = frames.normals[i];
    const B = frames.binormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);

      const vx = p.x + r * (cosV * N.x + sinV * B.x);
      const vy = p.y + r * (cosV * N.y + sinV * B.y);
      const vz = p.z + r * (cosV * N.z + sinV * B.z);

      vertices.push(vx, vy, vz);

      const nx = cosV * N.x + sinV * B.x;
      const ny = cosV * N.y + sinV * B.y;
      const nz = cosV * N.z + sinV * B.z;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      
      if (len > 0.0001) {
        normals.push(nx / len, ny / len, nz / len);
      } else {
        normals.push(0, 0, 1);
      }

      uvs.push(u, j / radialSegments);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = i * (radialSegments + 1) + j + 1;
      const c = (i + 1) * (radialSegments + 1) + j;
      const d = (i + 1) * (radialSegments + 1) + j + 1;

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}

export default function ThreeLogo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.8);

    // Renderer with high quality settings for realism
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Create Pooler 3D Logo Group
    const logoGroup = new THREE.Group();
    logoGroup.position.y = 0.35;
    scene.add(logoGroup);

    // Materials
    // 1. Semi-translucent Glassy Map Pin Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.65, // Transparent glass refraction
      thickness: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    });

    // 2. Metallic Emerald Green Lane Material (Primary theme)
    const greenMaterial = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.85,
      roughness: 0.15,
    });

    // 3. Metallic Electric Blue Lane Material (Secondary theme)
    const blueMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.85,
      roughness: 0.15,
    });

    // 4. Glowing Cyan Destination Target Material
    const targetMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });

    // --- Geometries ---
    // 1. Classy Extruded Map Pin
    const pinShape = new THREE.Shape();
    // Start at bottom tip
    pinShape.moveTo(0, -1.6);
    // Right side curve
    pinShape.bezierCurveTo(0.85, -0.7, 1.25, 0.15, 1.25, 0.95);
    // Top dome circle
    pinShape.absarc(0, 0.95, 1.25, 0, Math.PI, false);
    // Left side curve back to tip
    pinShape.bezierCurveTo(-1.25, 0.15, -0.85, -0.7, 0, -1.6);

    // Inner circular cutout hole
    const holePath = new THREE.Path();
    holePath.absarc(0, 0.95, 0.42, 0, Math.PI * 2, true);
    pinShape.holes.push(holePath);

    // Extrude options
    const extrudeSettings = {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };

    const pinGeometry = new THREE.ExtrudeGeometry(pinShape, extrudeSettings);
    const pinMesh = new THREE.Mesh(pinGeometry, glassMaterial);
    pinMesh.position.set(0, -0.3, -0.14); // Centering along Z
    logoGroup.add(pinMesh);

    // 2. Merging road lanes inside the map pin
    // Lane A (Green path entering from right base, looping inside the hole)
    const greenCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, -1.4, 0.15),
      new THREE.Vector3(0.38, -0.6, 0.22),
      new THREE.Vector3(0.12, 0.2, 0.22),
      new THREE.Vector3(0.0, 0.75, 0.22),
    ]);

    const R = 0.075;
    const radiusFunc = (u: number) => {
      // Start of the road (u = 0) tapers from 0 to R over the first 25% of the curve
      if (u < 0.25) {
        const t = u / 0.25;
        return R * Math.sin(t * Math.PI / 2);
      }
      return R;
    };

    const greenTubeGeom = createTaperedTubeGeometry(greenCurve, 64, radiusFunc, 12, false);
    const greenLane = new THREE.Mesh(greenTubeGeom, greenMaterial);
    logoGroup.add(greenLane);

    // Lane B (Blue path entering from left base, merging into the green lane)
    const blueCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, -1.4, 0.15),
      new THREE.Vector3(-0.38, -0.6, 0.22),
      new THREE.Vector3(-0.12, 0.2, 0.22),
      new THREE.Vector3(0.0, 0.75, 0.22), // Loop merges here
    ]);
    const blueTubeGeom = createTaperedTubeGeometry(blueCurve, 64, radiusFunc, 12, false);
    const blueLane = new THREE.Mesh(blueTubeGeom, blueMaterial);
    logoGroup.add(blueLane);

    // 3. Destination Target Pin Dot (cyan glowing target indicator at merge junction)
    const targetGeom = new THREE.SphereGeometry(0.12, 32, 32);
    const targetSphere = new THREE.Mesh(targetGeom, targetMat);
    targetSphere.position.set(0, 0.75, 0.22);
    logoGroup.add(targetSphere);

    // Lighting (Realistic Studio Setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Direct lighting with color reflections
    const greenDirLight = new THREE.DirectionalLight(0x22c55e, 3.0); // Intense green highlight
    greenDirLight.position.set(-4, 3, 5);
    scene.add(greenDirLight);

    const blueDirLight = new THREE.DirectionalLight(0x06b6d4, 3.0); // Intense cyan/blue highlight
    blueDirLight.position.set(4, -3, 5);
    scene.add(blueDirLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0); // Bright white key light
    keyLight.position.set(0, 4, 6);
    scene.add(keyLight);

    // Interactive Drag rotation variables
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.007;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Mobile Swipe support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.007;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    // Bind event listeners
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const startTime = Date.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (Date.now() - startTime) / 1000;

      // Inertia interpolation
      currentRotationX += (targetRotationX - currentRotationX) * 0.1;
      currentRotationY += (targetRotationY - currentRotationY) * 0.1;

      logoGroup.rotation.x = currentRotationX;
      logoGroup.rotation.y = currentRotationY;

      // Automatic floating & soft spin when NOT dragging
      if (!isDragging) {
        targetRotationY += 0.0055; // Auto rotation spin
        logoGroup.position.y = 0.35 + Math.sin(elapsedTime * 1.5) * 0.14; // Auto float
      } else {
        logoGroup.position.y = 0.35;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      window.removeEventListener("resize", handleResize);

      glassMaterial.dispose();
      greenMaterial.dispose();
      blueMaterial.dispose();
      targetMat.dispose();
      pinGeometry.dispose();
      greenTubeGeom.dispose();
      blueTubeGeom.dispose();
      targetGeom.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="w-full h-full min-h-[350px] lg:min-h-[450px]" />
    </div>
  );
}
