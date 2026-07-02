import { useEffect, useMemo, useRef, useState } from 'react';
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
  allowRotate: boolean;
  allowStack: boolean;
  remark?: string;
  color: string;
};

type BoxSize = {
  lengthM: number;
  widthM: number;
  heightM: number;
  rotated: boolean;
};

type FloorPlacement = BoxSize & {
  box: CargoBox;
  x: number;
  z: number;
};

type PlacedBox = CargoBox & BoxSize & {
  x: number;
  y: number;
  z: number;
  overflow: boolean;
  pending: boolean;
  supportLabel?: string;
  badges: string[];
};

type Props = {
  vehicleResult: VehicleResult;
  vehicleIndex: number;
};

const palette = ['#1677ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#fa8c16', '#2f54eb', '#08979c'];
const perAssignmentPreviewLimit = 30;

function vehicleDimensionMm(value?: number | null, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed <= 80 ? parsed * 1000 : parsed;
}

function createTextSprite(text: string, color = '#0f172a') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 150;
  if (context) {
    context.fillStyle = 'rgba(255,255,255,0.92)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(15,23,42,0.18)';
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    context.font = '40px sans-serif';
    context.fillStyle = color;
    context.textBaseline = 'middle';
    context.fillText(text.slice(0, 22), 24, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.8, 0.68, 1);
  return sprite;
}

function createBadge(text: string, color = '#dc2626') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 96;
  if (context) {
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 34px sans-serif';
    context.fillStyle = '#ffffff';
    context.textBaseline = 'middle';
    context.fillText(text, 20, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.9, 0.34, 1);
  return sprite;
}

function boxesFromVehicle(vehicleResult: VehicleResult) {
  const boxes: CargoBox[] = [];
  vehicleResult.assignments.forEach((assignment, assignmentIndex) => {
    const quantity = Math.max(1, Number(assignment.quantity) || 1);
    const count = Math.min(quantity, perAssignmentPreviewLimit);
    const length = Number(assignment.lengthCm ?? assignment.usedLengthCm ?? 0) || 800;
    const width = Number(assignment.widthCm ?? 0) || 600;
    const height = Number(assignment.heightCm ?? 0) || 600;
    const weight = Number(assignment.weightKg ?? 0) / quantity;
    for (let i = 0; i < count; i += 1) {
      boxes.push({
        id: `${assignment.id}-${i}`,
        label: quantity > 1 ? `${assignment.boxNo}-${i + 1}` : assignment.boxNo,
        name: assignment.cargoName,
        length,
        width,
        height,
        weight,
        allowRotate: assignment.allowRotate ?? true,
        allowStack: assignment.allowStack ?? false,
        remark: assignment.remark,
        color: palette[assignmentIndex % palette.length],
      });
    }
  });
  return boxes;
}

function textAllowsStack(box: CargoBox) {
  return /可以上高|可上高|可叠放|可叠|上面可以压轻货|stack/i.test(`${box.remark ?? ''} ${box.name}`);
}

function textForbidsStack(box: CargoBox) {
  return /不可堆叠|不能堆叠|不可叠放|不能叠放|不能压|不可摆放|不能摆放|不能上高/i.test(`${box.remark ?? ''} ${box.name}`);
}

function canPlaceAsUpper(box: CargoBox) {
  return !textForbidsStack(box) && box.weight <= 2_500;
}

function canSupportUpper(box: CargoBox) {
  return !textForbidsStack(box) && (box.allowStack || textAllowsStack(box)) && box.weight >= 800;
}

function boxBadges(box: CargoBox) {
  const badges: string[] = [];
  if (!box.allowRotate) badges.push('不可旋转');
  if (!box.allowStack || textForbidsStack(box)) badges.push('不可叠放');
  return badges;
}
function boxDims(box: CargoBox, deckW: number): BoxSize {
  const rawLength = Math.max(box.length / 1000, 0.25);
  const rawWidth = Math.max(box.width / 1000, 0.18);
  const heightM = Math.max(box.height / 1000, 0.18);
  if (!box.allowRotate) return { lengthM: rawLength, widthM: rawWidth, heightM, rotated: false };
  if (rawWidth > deckW && rawLength <= deckW) return { lengthM: rawWidth, widthM: rawLength, heightM, rotated: true };
  return { lengthM: rawLength, widthM: rawWidth, heightM, rotated: false };
}

function createGroundPlan(boxes: CargoBox[], deckL: number, deckW: number) {
  const ground: FloorPlacement[] = [];
  const overflow: CargoBox[] = [];
  let x = -deckL / 2 + 0.2;
  let z = -deckW / 2 + 0.2;
  let rowWidth = 0;

  boxes.forEach((box) => {
    const size = boxDims(box, deckW);
    if (x + size.lengthM > deckL / 2) {
      x = -deckL / 2 + 0.2;
      z += rowWidth + 0.18;
      rowWidth = 0;
    }
    if (z + size.widthM > deckW / 2) {
      overflow.push(box);
      return;
    }
    ground.push({ box, x, z, ...size });
    x += size.lengthM + 0.12;
    rowWidth = Math.max(rowWidth, size.widthM);
  });

  return { ground, overflow };
}

function createPreviewLayout(boxes: CargoBox[], deckL: number, deckW: number, deckHeightLimit: number) {
  const sortedBoxes = [...boxes].sort((a, b) => {
    const aFixed = Number(!a.allowRotate) + Number(!canPlaceAsUpper(a));
    const bFixed = Number(!b.allowRotate) + Number(!canPlaceAsUpper(b));
    return bFixed - aFixed || b.weight - a.weight || b.length * b.width - a.length * a.width;
  });
  const { ground, overflow } = createGroundPlan(sortedBoxes, deckL, deckW);
  const placed: PlacedBox[] = ground.map((item) => ({
    ...item.box,
    x: item.x + item.lengthM / 2,
    y: item.heightM / 2,
    z: item.z + item.widthM / 2,
    lengthM: item.lengthM,
    widthM: item.widthM,
    heightM: item.heightM,
    rotated: item.rotated,
    overflow: deckHeightLimit > 0 && item.heightM * 1000 > deckHeightLimit,
    pending: false,
    badges: boxBadges(item.box),
  }));

  const warnings: string[] = [];
  const supportCandidates = ground.filter((item) => canSupportUpper(item.box)).sort((a, b) => b.lengthM * b.widthM - a.lengthM * a.widthM);
  const supportStackHeights = new Map<string, number>();
  const notStacked: CargoBox[] = [];
  let stackedCount = 0;

  overflow.forEach((box) => {
    if (!canPlaceAsUpper(box)) {
      notStacked.push(box);
      return;
    }
    const support = supportCandidates
      .map((candidate) => ({ candidate, height: supportStackHeights.get(candidate.box.id) ?? 0 }))
      .sort((a, b) => a.height - b.height || b.candidate.lengthM * b.candidate.widthM - a.candidate.lengthM * a.candidate.widthM)[0]?.candidate;
    if (!support) {
      notStacked.push(box);
      return;
    }

    const size = boxDims(box, deckW);
    const stackedHeight = supportStackHeights.get(support.box.id) ?? 0;
    const topBaseY = support.heightM + stackedHeight + 0.04;
    const footprintOverflow = size.lengthM > support.lengthM || size.widthM > support.widthM;
    const totalHeightM = topBaseY + size.heightM;
    placed.push({
      ...box,
      x: support.x + support.lengthM / 2,
      y: topBaseY + size.heightM / 2,
      z: support.z + support.widthM / 2,
      lengthM: size.lengthM,
      widthM: size.widthM,
      heightM: size.heightM,
      rotated: size.rotated,
      overflow: footprintOverflow || (deckHeightLimit > 0 && totalHeightM * 1000 > deckHeightLimit),
      pending: false,
      supportLabel: support.box.label,
      badges: boxBadges(box),
    });
    supportStackHeights.set(support.box.id, stackedHeight + size.heightM + 0.04);
    stackedCount += 1;
  });

  if (stackedCount) {
    warnings.push(`${stackedCount} 件轻货按尺寸、重量和支撑面模拟放到上层；同一底货多件上高时已逐层累计高度。`);
  }

  if (notStacked.length) {
    warnings.push(`${notStacked.length} 件因不可叠放、过重或缺少合适承压面，已放入“待人工摆放区”；这些货仍属于本车方案，需要现场调整摆放方式。`);
    const fallbackZ = deckW / 2 + 1.8;
    let fallbackX = -deckL / 2 + 0.2;
    let fallbackRow = 0;
    notStacked.forEach((box, index) => {
      const size = boxDims(box, deckW);
      const previewLength = Math.max(0.55, Math.min(size.lengthM, 1.2));
      const previewWidth = Math.max(0.32, Math.min(size.widthM, 0.7));
      const previewHeight = Math.max(0.12, Math.min(size.heightM, 0.35));
      if (fallbackX + previewLength > deckL / 2) {
        fallbackX = -deckL / 2 + 0.2;
        fallbackRow += 1;
      }
      placed.push({
        ...box,
        x: fallbackX + previewLength / 2,
        y: previewHeight / 2 + 0.02,
        z: fallbackZ + fallbackRow * 0.42 + previewWidth / 2,
        lengthM: previewLength,
        widthM: previewWidth,
        heightM: previewHeight,
        rotated: false,
        overflow: true,
        pending: true,
        badges: index < 8 ? boxBadges(box) : [],
      });
      fallbackX += previewLength + 0.12;
    });
  }

  return {
    placed,
    warnings,
    loadedCount: placed.filter((box) => !box.pending).length,
    pendingCount: placed.filter((box) => box.pending).length,
  };
}

export function LoadingPlan3DPreview({ vehicleResult, vehicleIndex }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxes = useMemo(() => boxesFromVehicle(vehicleResult), [vehicleResult]);
  const [layoutWarnings, setLayoutWarnings] = useState<string[]>([]);
  const [layoutStats, setLayoutStats] = useState({ loadedCount: 0, pendingCount: 0 });
  const previewLimitHiddenQuantity = useMemo(
    () => vehicleResult.assignments.reduce((sum, assignment) => sum + Math.max(0, Number(assignment.quantity || 0) - perAssignmentPreviewLimit), 0),
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
    const deckL = deckLength / 1000;
    const deckW = deckWidth / 1000;

    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(deckL, 0.16, deckW),
      new THREE.MeshStandardMaterial({ color: '#dbeafe', roughness: 0.65, transparent: true, opacity: 0.72 }),
    );
    deck.position.y = -0.08;
    scene.add(deck);
    deck.add(new THREE.LineSegments(new THREE.EdgesGeometry(deck.geometry), new THREE.LineBasicMaterial({ color: '#2563eb' })));

    const grid = new THREE.GridHelper(Math.max(deckL, deckW) + 2, 12, '#cbd5e1', '#e2e8f0');
    grid.position.y = -0.14;
    scene.add(grid);

    const { placed, warnings, loadedCount, pendingCount } = createPreviewLayout(boxes, deckL, deckW, deckHeightLimit);
    setLayoutWarnings(warnings);
    setLayoutStats({ loadedCount, pendingCount });

    if (pendingCount) {
      const zone = new THREE.Mesh(
        new THREE.BoxGeometry(deckL, 0.04, Math.max(1.8, Math.ceil(pendingCount / Math.max(1, Math.floor(deckL / 0.65))) * 0.42 + 0.5)),
        new THREE.MeshStandardMaterial({ color: '#fee2e2', roughness: 0.7, transparent: true, opacity: 0.5 }),
      );
      zone.position.set(0, -0.05, deckW / 2 + 1.8 + Math.max(1.8, Math.ceil(pendingCount / Math.max(1, Math.floor(deckL / 0.65))) * 0.42 + 0.5) / 2);
      scene.add(zone);
      zone.add(new THREE.LineSegments(new THREE.EdgesGeometry(zone.geometry), new THREE.LineBasicMaterial({ color: '#dc2626' })));
      const zoneLabel = createTextSprite('待人工摆放区', '#b91c1c');
      zoneLabel.position.set(0, 0.38, deckW / 2 + 1.2);
      scene.add(zoneLabel);
    }

    placed.forEach((box) => {
      const material = new THREE.MeshStandardMaterial({
        color: box.pending ? '#ef4444' : box.overflow ? '#f97316' : box.color,
        roughness: 0.5,
        transparent: true,
        opacity: box.pending ? 0.65 : box.overflow ? 0.86 : 0.94,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(box.lengthM, box.heightM, box.widthM), material);
      mesh.position.set(box.x, box.y, box.z);
      scene.add(mesh);
      const edgeColor = box.pending ? '#991b1b' : box.overflow ? '#ea580c' : box.badges.length ? '#f97316' : '#0f172a';
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: edgeColor }));
      edges.position.copy(mesh.position);
      scene.add(edges);

      const labelText = box.pending ? `${box.label} 待人工摆放` : box.supportLabel ? `${box.label} / 垫 ${box.supportLabel}` : box.label;
      const label = createTextSprite(labelText, box.pending ? '#b91c1c' : box.overflow ? '#c2410c' : '#0f172a');
      label.position.set(mesh.position.x, mesh.position.y + box.heightM / 2 + (box.pending ? 0.18 : 0.32), mesh.position.z);
      scene.add(label);

      if (!box.pending) box.badges.forEach((badge, index) => {
        const badgeSprite = createBadge(badge, badge === '不可叠放' ? '#dc2626' : '#ea580c');
        badgeSprite.position.set(mesh.position.x, mesh.position.y + box.heightM / 2 + 0.72 + index * 0.34, mesh.position.z);
        scene.add(badgeSprite);
      });
    });

    const deckLabel = createTextSprite(`第 ${vehicleIndex + 1} 车 ${vehicleResult.vehicle.name}`, '#1d4ed8');
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
          if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
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
  const restrictedCount = boxes.filter((box) => !box.allowRotate || !box.allowStack || textForbidsStack(box)).length;

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
          <Text type="secondary">显示件数</Text>
          <div>{boxes.length} 件</div>
        </Col>
        <Col xs={24} md={6}>
          <Text type="secondary">已模拟/待人工</Text>
          <div>{layoutStats.loadedCount} / {layoutStats.pendingCount}</div>
        </Col>
        <Col xs={24} md={6}>
          <Text type="secondary">限制件数</Text>
          <div>{restrictedCount} 件不可旋转/不可叠放</div>
        </Col>
      </Row>
      <div ref={containerRef} style={{ width: '100%', height: 520, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }} />
      <Space size={[8, 8]} wrap>
        {vehicleResult.assignments.map((assignment, index) => (
          <Tag key={assignment.id} color={palette[index % palette.length]}>
            {assignment.boxNo} x {assignment.quantity}
            {assignment.allowRotate === false ? ' / 不可旋转' : ''}
            {assignment.allowStack === false ? ' / 不可叠放' : ''}
          </Tag>
        ))}
      </Space>
      {previewLimitHiddenQuantity ? (
        <Alert type="info" showIcon message={`本车还有 ${previewLimitHiddenQuantity} 件同类货物未逐件展开显示，避免大量重复件导致浏览器卡顿。`} />
      ) : null}
      {layoutWarnings.length ? <Alert type="warning" showIcon message={layoutWarnings.join('；')} /> : null}
      {vehicleResult.warnings.length ? <Alert type="warning" showIcon message={vehicleResult.warnings.join('；')} /> : null}
      <Alert
        type="info"
        showIcon
        message="当前 3D 预览会根据货物尺寸、重量、不可旋转和不可叠放要求做保守模拟；上层货物逐层累计高度，不会嵌入底层货物。最终方案仍需现场复核受力面、绑扎和装卸顺序。"
      />
    </Space>
  );
}

