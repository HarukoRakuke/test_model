import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { RGBELoader } from 'RGBELoader';
import { ObjectControls } from './ObjectControls.js';

let model;
let model2;
let status = 0;
let scaleFactor;
let controls;

let modelContainer = document.querySelector('.box-3d');
const initialWidth = modelContainer.clientWidth;
const initialHeight = modelContainer.clientHeight;

let renderer, camera;

const cameraPositions = [
  { x: -10, y: 10, z: 30 },
  { x: 10, y: -5, z: 35 },
  { x: 15, y: 0, z: 30 },
  { x: 0, y: 17, z: 30 },
];

const initialDegree = [
  { x: 15, y: 0, z: 0 },
  { x: 10, y: -5, z: 35 },
  { x: 45, y: 0, z: 0 },
  { x: 0, y: 14, z: 22 },
];

const popupTexts = [
  'Возможность работы откуда угодно',
  'Надежное качество и производительность HP',
  'Повышенная безопасность, стабильные подключения',
  'Автоматизация задач сканирования и экономия времени',
];

const descriptionText = [
  'Экономьте время с помощью ярлыков Smart Task, выполняйте работу в любом месте и в любое время, используя HP Smart — лучшее в своем классе приложение мобильной печати 4 5.',
  'Это универсальное МФУ с возможностью автоматической двусторонней печати позволяет добиться максимальной производительности и получать цветные отпечатки высочайшего качества',
  'Эффективные средства безопасности предназначены для своевременного обнаружения и блокировки атак, а двухдиапазонный модуль Wi-Fi™ обеспечивает быстрое и стабильное подключениеПовышенная безопасность, стабильные подключения',
  'Автоматизируйте повторяющиеся задачи с помощью настраиваемых ярлыков Smart Task в приложении HP Smart 9',
];

let currentCameraPositionIndex = -1;

let initialCameraPosition = { x: 30, y: 0, z: 100 };
const initialFOV = 75; // Set the initial FOV value

document.addEventListener('DOMContentLoaded', () => {
  initThree();
  resize();

  document
    .querySelector('.scrollButtonForward')
    .addEventListener('click', () => {
      changeCameraPosition(1);
      controls.disableVerticalRotation();
    });

  document.querySelector('.scrollButtonBack').addEventListener('click', () => {
    console.log(currentCameraPositionIndex);
    if (currentCameraPositionIndex > 0) {
      changeCameraPosition(-1);
      controls.disableVerticalRotation();
    } else if (currentCameraPositionIndex == 0) {
      changeCameraPosition(-1);
      controls.enableVerticalRotation();
    }
  });
});

function initThree() {
  const width = modelContainer.clientWidth;
  const height = modelContainer.clientHeight;

  const scene = new THREE.Scene();
  scene.position.set(0, 0, 0);
  scene.background = new THREE.Color('#D6D6D6');

  camera = new THREE.PerspectiveCamera(initialFOV, width / height, 0.1, 1000);
  // Initialize camera to the initial position
  camera.position.set(
    initialCameraPosition.x,
    initialCameraPosition.y,
    initialCameraPosition.z
  );
  camera.lookAt(30, 0, 0);
  camera.fov = 45;
  camera.updateProjectionMatrix();

  renderer = new THREE.WebGLRenderer({
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
    loader.load('hdr2.hdr', (hdr) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = hdr;
    });
  }

  {
    const loader = new GLTFLoader();
    loader.load(
      './models/display.gltf',
      (gltf) => {
        model2 = gltf.scene;
        model2.position.set(12, 0, 0);
        model2.scale.set(0.8, 0.8, 0.8);
        model2.castShadow = true;
        scene.add(model2);
      },
      function (error) {
        console.log(error);
      }
    );
  }

  {
    const loader = new GLTFLoader();
    loader.load(
      './models/printer.glb',
      (gltf) => {
        model = gltf.scene;
        model.position.set(12, 0, 0);
        model.scale.set(0.8, 0.8, 0.8);
        model.castShadow = true;
        scene.add(model);

        controls = new ObjectControls(camera, renderer.domElement, [
          model,
          model2,
        ]);
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
  }

  function animate(controls) {
    requestAnimationFrame(() => animate(controls));

    // Rotate the models only when at initial position index (-1)
    if (currentCameraPositionIndex === -1) {
      model.rotation.y += 0.01; // Adjust the rotation speed as needed
      model2.rotation.y += 0.01; // Adjust the rotation speed as needed
    }

    renderer.render(scene, camera);
  }
}

function resetObjectRotation() {
  model.rotation.set(0, 0, 0);
  model2.rotation.set(0, 0, 0);
}

function updatePopupInfo(positionIndex) {
  const popupInfo = document.querySelector('.popup-info');
  popupInfo.innerHTML = `
    <h2>${popupTexts[positionIndex]}</h2>
    <p>${descriptionText[positionIndex]}</p>
  `;
}

function changeCameraPosition(direction) {
  resetObjectRotation();
  currentCameraPositionIndex += direction;

  // Check bounds
  if (currentCameraPositionIndex < -1) {
    currentCameraPositionIndex = -1;
  }
  if (currentCameraPositionIndex >= cameraPositions.length) {
    currentCameraPositionIndex = cameraPositions.length - 1;
  }

  console.log(currentCameraPositionIndex);

  if (currentCameraPositionIndex === -1) {
    // Reset to initial camera position
    camera.position.set(
      initialCameraPosition.x,
      initialCameraPosition.y,
      initialCameraPosition.z
    );
    camera.fov = 45; // Set FOV to 35
    camera.updateProjectionMatrix(); // Update projection matrix
    camera.lookAt(30, 0, 0);
    model.position.set(8, 0, 0);
    model2.position.set(8, 0, 0);
  } else {
    const newPosition = cameraPositions[currentCameraPositionIndex];
    const newDegree = initialDegree[currentCameraPositionIndex];
    camera.position.set(newPosition.x, newPosition.y, newPosition.z);
    camera.fov = 75; // Set FOV to 75 for other positions
    camera.updateProjectionMatrix(); // Update projection matrix
    camera.lookAt(newDegree.x, newDegree.y, newDegree.z);
  }

  // Update the popup information
  updatePopupInfo(currentCameraPositionIndex);

  // Toggle button visibility
  toggleBackButtonVisibility();
}

function toggleBackButtonVisibility() {
  const backButton = document.querySelector('.scrollButtonBack');
  if (currentCameraPositionIndex >= 0) {
    backButton.style.display = 'block';
  } else {
    backButton.style.display = 'none';
    const popupInfo = document.querySelector('.popup-info');
    popupInfo.innerHTML = `
      <h1>HP</h1>
      <h2>M283fdw (7KW75AR)</h2>
      <p>Цветной принтер</p>
    `;
  }
}

function resize() {
  let button = document.querySelector('.button');
  button.addEventListener('click', () => {
    if (status === 0) {
      status = 1;

      modelContainer.classList.add('fullScreenMode');
      modelContainer.style.height = '100vh';

      const width = modelContainer.clientWidth;
      const height = modelContainer.clientHeight;

      camera.aspect = width / height;

      camera.updateProjectionMatrix();

      if (window.innerWidth > 2000) {
        scaleFactor = 1.5;
      }
      if (window.innerWidth > 1800) {
        scaleFactor = 1.4;
      }
      if (window.innerWidth > 1500) {
        scaleFactor = 1.3;
      }
      if (window.innerWidth > 1400) {
        scaleFactor = 1.1;
      }
      if (window.innerWidth > 1240) {
        scaleFactor = 1;
      }

      renderer.setSize(width, height);
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);
      model2.scale.set(scaleFactor, scaleFactor, scaleFactor);
      model.position.set(0, 0, 0);
      model2.position.set(0, 0, 0);
      button.innerHTML = 'Вернуться в окно';
    } else if (status === 1) {
      status = 0;
      modelContainer.classList.remove('fullScreenMode');
      modelContainer.style.height = 'auto';
      model.scale.set(0.8, 0.8, 0.8);
      model.position.set(12, 0, 0);
      model2.scale.set(0.8, 0.8, 0.8);
      model2.position.set(12, 0, 0);

      camera.aspect = initialWidth / initialHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(initialWidth, initialHeight);

      button.innerHTML = 'На весь экран';
    }
  });
}
