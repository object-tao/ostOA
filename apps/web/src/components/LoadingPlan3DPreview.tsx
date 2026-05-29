import { useEffect, useMemo, useRef } from 'react';
import { Alert, Col, Row, Space, Tag, Typography } from 'antd';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { LoadingPlan } from '../services/loadingPlan';

const { Text } = Typography;

type VehicleResult = LoadingPlan['vehicles'][number];

type CargoBox = {
  id: string;
  label: string;
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  color: string;
};

type Props = {
  vehicleResult: VehicleResult;
  vehicleIndex: number;
};

const palette = ['#1677ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#fa8c16', '#2f54eb', '#08979c'];

function vehicleDimensionMm(value?: number | null, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed <= 80 ? parsed * 1000 : parsed;
}

function createTextSprite(text: string, color = '#0f172a') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;
  if (context) {
    context.fillStyle = 'rgba(255,255,255,0.88)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(15,23,42,0.18)';
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    context.font = '42px sans-serif';
    context.fillStyle = color;
    context.textBaseline = 'middle';
    context.fillText(text.slice(0, 18), 24, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.4, 0.6, 1);
  return sprite;
}

function boxesFromVehicle(vehicleResult: VehicleResult) {
  const boxes: CargoBox[] = [];
  vehicleResult.assignments.forEach((assignment, assignmentIndex) => {
    const count = Math.min(Number(assignment.quantity) || 1, 12);
    const length = Number(assignment.lengthCm ?? assignment.usedLengthCm ?? 0) || 800;
    const width = Number(assignment.widthCm ?? 0) || 600;
    const height = Number(assignment.heightCm ?? 0) || 600;
    const weight = Number(assignment.weightKg ?? 0) / Math.max(Number(assignment.quantity) || 1, 1);
    for (let i = 0; i < count; i += 1) {
      boxes.push({
        id: `${assignment.id}-${i}`,
        label: count > 1 ? `${assignment.boxNo}-${i + 1}` : assignment.boxNo,
        name: assignment.cargoName,
        length,
        width,
        height,
        weight,
        color: palette[assignmentIndex % palette.length],
      });
    }
  });
  return boxes;
}

export function LoadingPlan3DPreview({ vehicleResult, vehicleIndex }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxes = useMemo(() => boxesFromVehicle(vehicleResult), [vehicleResult]);
  const hiddenQuantity = useMemo(
    () => vehicleResult.assignments.reduce((sum, assignment) => sum + Math.max(0, Number(assignment.quantity || 0) - 12), 0),
    [vehicleResult.assignments],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = 520;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(12, 10, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1.2, 0);

    scene.add(new THREE.AmbientLight('#ffffff', 1.7));
    const directional = new THREE.DirectionalLight('#ffffff', 1.2);
    directional.position.set(8, 12, 6);
    scene.add(directional);

    const maxCargoLength = Math.max(vehicleResult.maxLengthCm || 0, ...boxes.map((box) => box.length), 13_600);
    const maxCargoWidth = Math.max(...boxes.map((box) => box.width), 2_500);
    const deckLength = vehicleDimensionMm(vehicleResult.vehicle.effectiveLength, Math.max(maxCargoLength * 1.12, 13_600));
    const deckWidth = vehicleDimensionMm(vehicleResult.vehicle.effectiveWidth, Math.max(maxCargoWidth + 400, 2_500));
    const deckHeightLimit = vehicleDimensionMm(vehicleResult.vehicle.effectiveHeight, 0);
    const scale = 1000;
    const deckL = deckLength / scale;
    const deckW = deckWidth / scale;

    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(deckL, 0.16, deckW),
      new THREE.MeshStandardMaterial({ color: '#dbeafe', roughness: 0.65, transparent: true, opacity: 0.72 }),
    );
    deck.position.y = -0.08;
    scene.add(deck);

    const deckEdges = new THREE.LineSegments(new THREE.EdgesGeometry(deck.geometry), new THREE.LineBasicMaterial({ color: '#2563eb' }));
    deck.add(deckEdges);

    const grid = new THREE.GridHelper(Math.max(deckL, deckW) + 2, 12, '#cbd5e1', '#e2e8f0');
    grid.position.y = -0.14;
    scene.add(grid);

    let x = -deckL / 2 + 0.2;
    let z = -deckW / 2 + 0.2;
    let rowWidth = 0;
    let layerY = 0;
    let layerHeight = 0;
    const overflowLabels: string[] = [];

    boxes
      .sort((a, b) => b.length - a.length || b.width - a.width || b.weight - a.weight)
      .forEach((box) => {
        const length = Math.max(box.length / scale, 0.25);
        const widthM = Math.max(box.width / scale, 0.18);
        const heightM = Math.max(box.height / scale, 0.18);
        if (x + length > deckL / 2) {
          x = -deckL / 2 + 0.2;
          z += rowWidth + 0.18;
          rowWidth = 0;
        }
        if (z + widthM > deckW / 2) {
          z = -deckW / 2 + 0.2;
          x = -deckL / 2 + 0.2;
          layerY += layerHeight + 0.12;
          layerHeight = 0;
        }

        const isOverflow = x + length > deckL / 2 || z + widthM > deckW / 2 || (deckHeightLimit > 0 && (layerY + heightM) * scale > deckHeightLimit);
        if (isOverflow) overflowLabels.push(box.label);
        const material = new THREE.MeshStandardMaterial({
          color: isOverflow ? '#ef4444' : box.color,
          roughness: 0.5,
          transparent: true,
          opacity: isOverflow ? 0.78 : 0.86,
        });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, heightM, widthM), material);
        mesh.position.set(x + length / 2, layerY + heightM / 2, z + widthM / 2);
        scene.add(mesh);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: isOverflow ? '#991b1b' : '#0f172a' }));
        edges.position.copy(mesh.position);
        scene.add(edges);

        const label = createTextSprite(box.label, isOverflow ? '#b91c1c' : '#0f172a');
        label.position.set(mesh.position.x, mesh.position.y + heightM / 2 + 0.32, mesh.position.z);
        scene.add(label);

        x += length + 0.12;
        rowWidth = Math.max(rowWidth, widthM);
        layerHeight = Math.max(layerHeight, heightM);
      });

    const deckLabel = createTextSprite(`第${vehicleIndex + 1}车 ${vehicleResult.vehicle.name}`, '#1d4ed8');
    deckLabel.position.set(0, 0.55, -deckW / 2 - 0.7);
    scene.add(deckLabel);

    let frame = 0;
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nextWidth = container.clientWidth || width;
      camera.aspect = nextWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
        }
      });
      container.innerHTML = '';
    };
  }, [boxes, vehicleIndex, vehicleResult]);

  const maxWidth = Math.max(0, ...vehicleResult.assignments.map((assignment) => Number(assignment.widthCm ?? 0)));
  const maxHeight = Math.max(0, ...vehicleResult.assignments.map((assignment) => Number(assignment.heightCm ?? 0)));

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={6}>
          <Text type="secondary">车辆</Text>
          <div>{vehicleResult.vehicle.category} / {vehicleResult.vehicle.name}</div>
        </Col>
        <Col xs={24} md={6}>
          <Text type="secondary">最大货宽/货高</Text>
          <div>{maxWidth} / {maxHeight} mm</div>
        </Col>
        <Col xs={24} md={6}>
          <Text type="secondary">总重</Text>
          <div>{vehicleResult.usedWeightKg.toFixed(2)} kg</div>
        </Col>
        <Col xs={24} md={6}>
          <Text type="secondary">装载方式</Text>
          <div>{vehicleResult.loadingMethod}</div>
        </Col>
      </Row>
      <div ref={containerRef} style={{ width: '100%', height: 520, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }} />
      <Space size={[8, 8]} wrap>
        {vehicleResult.assignments.map((assignment, index) => (
          <Tag key={assignment.id} color={palette[index % palette.length]}>
            {assignment.boxNo} x {assignment.quantity}
          </Tag>
        ))}
      </Space>
      {hiddenQuantity ? <Alert type="info" showIcon message={`本车有 ${hiddenQuantity} 件同类货物未逐件展开显示，3D 视图仅展示前 12 件作为示意。`} /> : null}
      {vehicleResult.warnings.length ? <Alert type="warning" showIcon message={vehicleResult.warnings.join('；')} /> : null}
      <Alert type="info" showIcon message="当前为装车示意图，用于快速理解长度、宽度、高度和超界风险；最终摆放仍需现场按受力面、绑扎、装卸顺序复核。" />
    </Space>
  );
}
