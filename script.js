import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { RGBELoader } from 'RGBELoader';
import { ObjectControls } from './ObjectControls.js';

let model;

document.addEventListener('DOMContentLoaded', () => {
  initThree();
});

function initThree() {
  let modelContainer = document.querySelector('.box-3d');
  const width = modelContainer.clientWidth;
  const height = modelContainer.clientHeight;

  const scene = new THREE.Scene();
  scene.position.set(0, 0, 0);
  scene.background = new THREE.Color('#6C6C6C');

  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 3000);
  camera.position.set(30, 0, 100);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  modelContainer.appendChild(renderer.domElement);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 8;

  {
    const loader = new RGBELoader();
    loader.load('hdr.hdr', (hdr) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = hdr;
    });
  }

  const loader = new GLTFLoader();
  loader.load(
    'models/printer.glb',
    (gltf) => {
      model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);
      model.castShadow = true;
      // Add the scaled model to the scene
      scene.add(model);

      var controls = new ObjectControls(camera, renderer.domElement, model);
      controls.setDistance(50, 100); // set min - max distance for zoom
      controls.setZoomSpeed(0.5); // set zoom speed
      controls.setRotationSpeed(0.06);
      controls.setMaxVerticalRotationAngle(Math.PI / 2, Math.PI / 2);
      controls.enableVerticalRotation();
      animate(controls);
    },
    function (error) {
      console.log(error);
    }
  );

  function animate(controls) {
    requestAnimationFrame(() => animate(controls));
    model.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
}
