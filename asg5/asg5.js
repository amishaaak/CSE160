import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {
  const canvas = document.querySelector('#c');

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  //camera: PerspectiveCamera
  const fov = 75;
  const aspect = canvas.clientWidth / canvas.clientHeight; 
  const near = 0.1; // objects closer than 0.1 units won't be seen
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 60, 120);
  camera.lookAt(0, 0, 0);

  // OrbitControls for mouse camera movement that lets you rotate, zoom, and pan the camera
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  // ========== SCENE BOUNDARIES ==========
  // used to make sure all objects stay within a defined area
  const SCENE_BOUNDS = {
    minX: -90,
    maxX: 90,
    minY: 10,
    maxY: 70,
    minZ: -90,
    maxZ: 90
  };

  // ========== SPONGEBOB SKYBOX SETUP ==========
  const skyboxGeometry = new THREE.BoxGeometry(200, 150, 200);
  
  // general helper function to create solid color textures -> used for errors or when needing a solid color
  function createColorTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }
  
  const textureLoader = new THREE.TextureLoader();
  
  // create materials for each face of the skybox cube
  const skyboxMaterials = [
    // right face
    new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
    // left face
    new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
    // top face
    new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
    // bottom face - underwater blue tint to match the blue-white lighting theme
    new THREE.MeshBasicMaterial({ 
      map: createColorTexture('#7BB3D9'),
      side: THREE.BackSide 
    }),
    // front face
    new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
    // back face
    new THREE.MeshBasicMaterial({ side: THREE.BackSide })
  ];
  
  // load the background image and apply to sky and wall faces
  textureLoader.load(
    'textures/background.jpg',
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      skyboxMaterials[0].map = texture.clone(); 
      skyboxMaterials[1].map = texture.clone();  
      skyboxMaterials[2].map = texture.clone();
      skyboxMaterials[4].map = texture.clone();
      skyboxMaterials[5].map = texture.clone();
      
      // update materials for the textures to show
      skyboxMaterials.forEach((material, index) => {
        if (index !== 3) {
          material.needsUpdate = true;
        }
      });
    }
  );
  
  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
  skybox.position.y = 75; //shifting skybox up
  scene.add(skybox);

  scene.fog = new THREE.Fog(0x4A9EFF, 100, 400); // makes distant things look misty 

  // ========== LIGHTING ==========
  // AMBIENT LIGHT
  const ambientLight = new THREE.AmbientLight(0x4A7C9A, 4);
  scene.add(ambientLight);

  // DIRECTIONAL LIGHT
  const directionalLight = new THREE.DirectionalLight(0xB3E5FF, 7.0);
  directionalLight.position.set(-30, 50, 30);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 200;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  scene.add(directionalLight);

  // SPOT LIGHT
  const spotLight1 = new THREE.SpotLight(0xFFF1A8, 300.0); 
  spotLight1.position.set(40, 60, 40);
  spotLight1.target.position.set(0, 0, 0);
  spotLight1.angle = Math.PI / 3;
  spotLight1.penumbra = 0.7;
  spotLight1.decay = 0;
  spotLight1.distance = 0;
  spotLight1.castShadow = true;
  scene.add(spotLight1);
  scene.add(spotLight1.target);


  // Arrays to store loaded models for animation
  const jellyfish = [];
  const corals = [];
  const characters = [];

  const gltfLoader = new GLTFLoader();
  
  // laod main environment
  gltfLoader.load(
    'models/spongebob_environment.glb',
    (gltf) => {
      const house = gltf.scene;
      house.position.set(0, 0, 0);
      house.scale.setScalar(25);
      
      house.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material && child.material.type === 'MeshBasicMaterial') {
            const oldMaterial = child.material;
            child.material = new THREE.MeshLambertMaterial({
              map: oldMaterial.map,
              color: oldMaterial.color
            });
          }
        }
      });
      
      scene.add(house);
    }
  );

  // load SpongeBob
  gltfLoader.load(
    'models/spongebob_squarepants.glb',
    (gltf) => {
      const spongebob = gltf.scene;
      spongebob.position.set(50, 3, 25); 
      spongebob.scale.setScalar(13);
      
      spongebob.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      characters.push({ model: spongebob, type: 'spongebob', baseY: 3 });
      scene.add(spongebob);
    }
  );

  // load Patrick
  gltfLoader.load(
    'models/patrick_star_spongebob.glb',
    (gltf) => {
      const patrick = gltf.scene;
      patrick.position.set(-50, 10, 25);
      patrick.scale.setScalar(0.08);
      
      patrick.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      characters.push({ model: patrick, type: 'patrick', baseY: 10 }); 
      scene.add(patrick);
    }
  );

  // load Squidward
  gltfLoader.load(
    'models/squidward_spongebob.glb',
    (gltf) => {
      const squidward = gltf.scene;
      squidward.position.set(-25, 16, -25);
      squidward.scale.setScalar(0.04); 
      
      squidward.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      characters.push({ model: squidward, type: 'squidward', baseY: 16 }); 
      scene.add(squidward);
    }
  );

  // load jellyfish using the scene bounds
  for (let i = 0; i < 12; i++) {
    gltfLoader.load(
      'models/jelly_fish_spongebob.glb',
      (gltf) => {
        const jellyfishModel = gltf.scene.clone();
        
        const startX = SCENE_BOUNDS.minX + Math.random() * (SCENE_BOUNDS.maxX - SCENE_BOUNDS.minX);
        const startY = SCENE_BOUNDS.minY + Math.random() * (SCENE_BOUNDS.maxY - SCENE_BOUNDS.minY);
        const startZ = SCENE_BOUNDS.minZ + Math.random() * (SCENE_BOUNDS.maxZ - SCENE_BOUNDS.minZ);
        
        jellyfishModel.position.set(startX, startY, startZ);
        jellyfishModel.scale.setScalar(0.02 + Math.random() * 0.03);
        
        jellyfishModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        jellyfish.push({
          model: jellyfishModel,
          baseX: startX,
          baseY: startY,
          baseZ: startZ,
          radiusX: 15 + Math.random() * 20,
          radiusY: 8 + Math.random() * 12, 
          radiusZ: 15 + Math.random() * 20, 
          speedX: 0.3 + Math.random() * 0.8,
          speedY: 0.2 + Math.random() * 0.6,
          speedZ: 0.3 + Math.random() * 0.8,
          rotationSpeed: (Math.random() - 0.5) * 0.04,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          phaseZ: Math.random() * Math.PI * 2
        });
        
        scene.add(jellyfishModel);
      },
      (xhr) => console.log(`Jellyfish ${i + 1}: ${(xhr.loaded / xhr.total * 100).toFixed(1)}% loaded`),
      (err) => console.error(`Error loading Jellyfish ${i + 1}:`, err)
    );
  }

  // ==========  CORAL PLACEMENT  ==========
  const coralArrangements = [
    // central house area
    {
      center: { x: 0, z: 0 },
      radius: 35,
      count: 8,
      minSize: 0.3,
      maxSize: 0.6,
      pattern: 'scattered'
    },
    
    // corner gardens
    {
      center: { x: -65, z: -65 },
      radius: 20,
      count: 12,
      minSize: 0.4,
      maxSize: 1.0,
      pattern: 'cluster'
    },
    {
      center: { x: 65, z: -65 },
      radius: 20,
      count: 12,
      minSize: 0.4,
      maxSize: 1.0,
      pattern: 'cluster'
    },
    {
      center: { x: -65, z: 65 },
      radius: 20,
      count: 12,
      minSize: 0.4,
      maxSize: 1.0,
      pattern: 'cluster'
    },
    {
      center: { x: 65, z: 65 },
      radius: 20,
      count: 12,
      minSize: 0.4,
      maxSize: 1.0,
      pattern: 'cluster'
    },
    
    // edge borders
    {
      center: { x: -80, z: 0 },
      radius: 15,
      count: 8,
      minSize: 0.2,
      maxSize: 0.7,
      pattern: 'line',
      direction: 'vertical'
    },
    {
      center: { x: 80, z: 0 },
      radius: 15,
      count: 8,
      minSize: 0.2,
      maxSize: 0.7,
      pattern: 'line',
      direction: 'vertical'
    },
    {
      center: { x: 0, z: -80 },
      radius: 15,
      count: 8,
      minSize: 0.2,
      maxSize: 0.7,
      pattern: 'line',
      direction: 'horizontal'
    },
    {
      center: { x: 0, z: 80 },
      radius: 15,
      count: 8,
      minSize: 0.2,
      maxSize: 0.7,
      pattern: 'line',
      direction: 'horizontal'
    }
  ];

  //generate coral positions based on pattern
  function generateCoralPositions(arrangement) {
    const positions = [];
    const { center, radius, count, pattern, direction } = arrangement;
    
    switch (pattern) {
      case 'cluster':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const distance = Math.random() * radius;
          positions.push({
            x: center.x + Math.cos(angle) * distance,
            z: center.z + Math.sin(angle) * distance
          });
        }
        break;
        
      case 'line':
        for (let i = 0; i < count; i++) {
          const offset = ((i / (count - 1)) - 0.5) * radius * 2;
          if (direction === 'vertical') {
            positions.push({
              x: center.x + (Math.random() - 0.5) * 8,
              z: center.z + offset
            });
          } else {
            positions.push({
              x: center.x + offset,
              z: center.z + (Math.random() - 0.5) * 8
            });
          }
        }
        break;
        
      case 'scattered':
      default:
        for (let i = 0; i < count; i++) {
          let x, z, distance;
          do {
            const angle = Math.random() * Math.PI * 2;
            distance = 20 + Math.random() * (radius - 20);
            x = center.x + Math.cos(angle) * distance;
            z = center.z + Math.sin(angle) * distance;
          } while (distance < 20);
          
          positions.push({ x, z });
        }
        break;
    }
    
    return positions;
  }

  // load coral with purposeful placement
  let coralIndex = 0;
  coralArrangements.forEach((arrangement) => {
  const positions = generateCoralPositions(arrangement);
    
    positions.forEach((position) => {
      gltfLoader.load(
        'models/coral.glb',
        (gltf) => {
          const coralModel = gltf.scene.clone();
          
          //makes sure coral is within scene bounds
          const coralX = Math.max(SCENE_BOUNDS.minX, Math.min(SCENE_BOUNDS.maxX, position.x));
          const coralZ = Math.max(SCENE_BOUNDS.minZ, Math.min(SCENE_BOUNDS.maxZ, position.z));
          
          coralModel.position.set(coralX, 0, coralZ);
          
          // size based on arrangement
          const sizeVariation = arrangement.minSize + Math.random() * (arrangement.maxSize - arrangement.minSize);
          coralModel.scale.setScalar(sizeVariation);
          
          // rotation for variety
          coralModel.rotation.y = Math.random() * Math.PI * 2;
          
          coralModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          // varied swaying motion
          corals.push({
            model: coralModel,
            swaySpeed: 0.3 + Math.random() * 0.4,
            swayAmount: 0.03 + Math.random() * 0.07,
            swayPhase: Math.random() * Math.PI * 2
          });
          
          scene.add(coralModel);
        }
      );
      coralIndex++;
    });
  });

// ========== SEAWEED PLACEMENT ==========
const seaweedPositions = [];
const rimOffset = -2; // distance from the edge
const spacing = 10; // distance between seaweed pieces

// top edge
for (let x = SCENE_BOUNDS.minX + rimOffset; x <= SCENE_BOUNDS.maxX - rimOffset; x += spacing) {
  seaweedPositions.push({ x: x, z: SCENE_BOUNDS.maxZ - rimOffset });
}

// bottom edge
for (let x = SCENE_BOUNDS.minX + rimOffset; x <= SCENE_BOUNDS.maxX - rimOffset; x += spacing) {
  seaweedPositions.push({ x: x, z: SCENE_BOUNDS.minZ + rimOffset });
}

// left edge
for (let z = SCENE_BOUNDS.minZ + rimOffset; z <= SCENE_BOUNDS.maxZ - rimOffset; z += spacing) {
  seaweedPositions.push({ x: SCENE_BOUNDS.minX + rimOffset, z: z });
}

// right edge
for (let z = SCENE_BOUNDS.minZ + rimOffset; z <= SCENE_BOUNDS.maxZ - rimOffset; z += spacing) {
  seaweedPositions.push({ x: SCENE_BOUNDS.maxX - rimOffset, z: z });
}

// load seaweed model
const seaweeds = [];
seaweedPositions.forEach((position, index) => {
  gltfLoader.load(
    'models/seaweed.glb',
    (gltf) => {
      const seaweedModel = gltf.scene.clone();
      
      seaweedModel.position.set(position.x, 0, position.z);
      seaweedModel.scale.setScalar(10 + Math.random() * 0.5);
      seaweedModel.rotation.y = Math.random() * Math.PI * 2;
      
      seaweedModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      seaweeds.push({
        model: seaweedModel,
        swaySpeed: 0.8 + Math.random() * 0.6,
        swayAmount: 0.1 + Math.random() * 0.1,
        swayPhase: Math.random() * Math.PI * 2
      });
      
      scene.add(seaweedModel);
    },
    (xhr) => console.log(`Seaweed ${index + 1}: ${(xhr.loaded / xhr.total * 100).toFixed(1)}% loaded`),
    (err) => console.error(`Error loading Seaweed ${index + 1}:`, err)
  );
});

// function to keep objects within bounds
function clampToBounds(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// handle canvas resizing
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function render(time) {
  time *= 0.001; // ms → seconds

  // Handle window resize
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  
  controls.update();

  // animate jellyfish with BOUNDED circular/elliptical motion
  jellyfish.forEach((jelly, index) => {
    if (jelly.model) {
        
      const newX = jelly.baseX + Math.sin(time * jelly.speedX + jelly.phaseX) * jelly.radiusX;
      const newY = jelly.baseY + Math.sin(time * jelly.speedY + jelly.phaseY) * jelly.radiusY;
      const newZ = jelly.baseZ + Math.cos(time * jelly.speedZ + jelly.phaseZ) * jelly.radiusZ;
        
      jelly.model.position.x = clampToBounds(newX, SCENE_BOUNDS.minX, SCENE_BOUNDS.maxX);
      jelly.model.position.y = clampToBounds(newY, SCENE_BOUNDS.minY, SCENE_BOUNDS.maxY);
      jelly.model.position.z = clampToBounds(newZ, SCENE_BOUNDS.minZ, SCENE_BOUNDS.maxZ);
        
      // if jellyfish hits bounds, adjust base position to keep it moving smoothly
      if (newX < SCENE_BOUNDS.minX || newX > SCENE_BOUNDS.maxX) {
        jelly.baseX = clampToBounds(jelly.baseX, SCENE_BOUNDS.minX + jelly.radiusX, SCENE_BOUNDS.maxX - jelly.radiusX);
      }
      if (newY < SCENE_BOUNDS.minY || newY > SCENE_BOUNDS.maxY) {
        jelly.baseY = clampToBounds(jelly.baseY, SCENE_BOUNDS.minY + jelly.radiusY, SCENE_BOUNDS.maxY - jelly.radiusY);
      }
      if (newZ < SCENE_BOUNDS.minZ || newZ > SCENE_BOUNDS.maxZ) {
        jelly.baseZ = clampToBounds(jelly.baseZ, SCENE_BOUNDS.minZ + jelly.radiusZ, SCENE_BOUNDS.maxZ - jelly.radiusZ);
      }
        
      jelly.model.rotation.y += jelly.rotationSpeed;
      jelly.model.rotation.x += jelly.rotationSpeed * 0.3;
    }
  });

    // Enhanced coral swaying with individual phases
  corals.forEach((coral) => {
    if (coral.model) {
      coral.model.rotation.z = Math.sin(time * coral.swaySpeed + coral.swayPhase) * coral.swayAmount;
      coral.model.rotation.x = Math.cos(time * coral.swaySpeed * 0.7 + coral.swayPhase) * coral.swayAmount * 0.5;
    }
  });

  seaweeds.forEach((seaweed) => {
    if (seaweed.model) {
      seaweed.model.rotation.z = Math.sin(time * seaweed.swaySpeed + seaweed.swayPhase) * seaweed.swayAmount;
      seaweed.model.rotation.x = Math.cos(time * seaweed.swaySpeed * 0.5 + seaweed.swayPhase) * seaweed.swayAmount * 0.3;
    }
  });

  // animate characters with subtle movements 
  characters.forEach((char, index) => {
    if (char.model) {
      char.model.position.y = char.baseY + Math.sin(time * 0.5 + index) * 1;
        
      // Slight rotation
      if (char.type === 'spongebob') {
        char.model.rotation.y = Math.sin(time * 0.3) * 0.2;
      } else if (char.type === 'patrick') {
        char.model.rotation.y = Math.sin(time * 0.2) * 0.15;
      } else if (char.type === 'squidward') {
        char.model.rotation.y = Math.sin(time * 0.4) * 0.1;
      }
    }
  });
    
    
  // animate spot light
  spotLight1.intensity = 20.0 + Math.sin(time * 1.3) * 10;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();