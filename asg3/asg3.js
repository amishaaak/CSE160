// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;

  varying vec2 v_UV;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;
  uniform vec4 u_FragColor;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;

  uniform int u_textureNum;

  void main() {
    if(u_textureNum == 0) {  
      gl_FragColor = u_FragColor;             //use color
    } else if(u_textureNum == 1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);    //use UV debug color
    } else if(u_textureNum == 2) {        
      gl_FragColor = texture2D(u_Sampler0, v_UV);    //use texture 0 
    } else if(u_textureNum == 3) {        
      gl_FragColor = texture2D(u_Sampler1, v_UV);     //use texture 1
    }
    else if (u_textureNum == 4) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);    //use texture 2
    }  
    else if (u_textureNum == 5) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);    //use texture 3
    }  
  }`

// global vars
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let camera;
let world;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;

let u_textureNum;
let exitPos = { x: 0, y: 0, z: 0 };

//animation constants 
let g_headYaw   = 0;
let g_neckYaw   = 0;
let g_flUpper   = 0;
let g_flLower   = 0;
let g_frUpper   = 0;
let g_frLower   = 0;
let g_blUpper   = 0;
let g_blLower   = 0;
let g_brUpper   = 0;
let g_brLower   = 0;
let g_tailBase  = 0;
let g_earTilt   = 0;

let g_cameraAngleX = 0;
let g_cameraAngleY = 0;
let g_cameraAngleZ = 0;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(!a_UV) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('Failed to create sampler object');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('Failed to create sampler object');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2) {
    console.log('Failed to create sampler object');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3) {
    console.log('Failed to create sampler object');
    return false;
  }

  u_textureNum = gl.getUniformLocation(gl.program, 'u_textureNum');
  if(!u_textureNum) {
    console.log('Failed to create texture option object');
    return false;
  }

  let x = new Matrix4();
  camera = new Camera();
  world = new World();
  camera.world = world;

 // calculate camera position
 // converting the maze’s start‐cell indices into real‐world meters, centering it, then placing the camera a bit above the floor at that spot
 // and pointing it straight down the corridor, with “up” as +Y so the view isn’t tilted
 
  const s    = world.voxel;
  const half = (world.grid * s) / 2;
  const { x: vx, z: vz } = world.startVoxel;
  const wx = (vx + 0.5) * s - half;
  const wz = (vz + 0.5) * s - half;

  camera.eye = new Vector3([wx, 0.3, wz]);
  camera.at  = new Vector3([wx, 0.3, wz - 1]);
  camera.up = new Vector3([0, 1, 0]);

  
  gl.uniformMatrix4fv(u_ModelMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, x.elements);
}

function initTextures() {
  let image0 = new Image();
  if(!image0) {
    console.log('Failed to create image object');
    return false;
  }

  image0.onload = function() { loadTexture0(image0); };
  image0.src = 'images/sky.jpg';

  let image1 = new Image();
  if(!image1) {
    console.log('Failed to create image object');
    return false;
  }

  image1.onload = function() { loadTexture1(image1); };
  image1.src = 'images/grass.jpg';

  //add more textures here

  let image2 = new Image();
  if(!image2) {
    console.log('Failed to create image object');
    return false;
  }

  image2.onload = function() { loadTexture2(image2); };
  image2.src = 'images/lava.jpg';

  let image3 = new Image();
  if(!image3) {
    console.log('Failed to create image object');
    return false;
  }

  image3.onload = function() { loadTexture3(image3); };
  image3.src = 'images/dogfood.jpg';


  return true;
}

function loadTexture0(image) {
  let texture = gl.createTexture();

  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler0, 0);

  console.log("Texture0 loaded");
}

function loadTexture1(image) {
  let texture = gl.createTexture();

  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler1, 1);

  console.log("Texture1 loaded");
}

function loadTexture2(image) {
  let texture = gl.createTexture();

  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler2, 2);

  console.log("Texture2 loaded");
}


function loadTexture3(image) {
  let texture = gl.createTexture();

  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler3, 3);

  console.log("Texture3 loaded");
}

function rotateCam(ev) {
  camera.panRight(ev.movementX*0.1);
  camera.panUp(ev.movementY*0.1);
}

function addActionListeners() {

  canvas.addEventListener('mousedown', () => {
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  });

  /* Enable / disable mouse-look when lock changes */
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      document.addEventListener('mousemove', rotateCam);
    } else {
      document.removeEventListener('mousemove', rotateCam);
    }
  });
}


function keydown(ev) {
  if (ev.key === 'p' || ev.key === 'P') {
    world.placeBlock(camera);
    renderAllShapes();
    return;
  }
  if (ev.key === 'r' || ev.key === 'R') {
    world.removeBlock(camera);
    renderAllShapes();
    return;
  }
  if(ev.keyCode == 39 || ev.keyCode == 68) {
    camera.moveRight();
  }
  if(ev.keyCode == 37 || ev.keyCode == 65) {
    camera.moveLeft();
  }
  if(ev.keyCode == 38 || ev.keyCode == 87) {
    camera.moveForward();
  }
  if(ev.keyCode == 40 || ev.keyCode == 83) {
    camera.moveBackward();
  }
  if(ev.keyCode == 81) {
    camera.panLeft(5);
  }
  if(ev.keyCode == 69) {
    camera.panRight(5);
  }
  renderAllShapes();
}

function updateAnimationAngles() {
  const w = g_seconds * 3.3;

  /* idle walk */
  g_flUpper=  15 * Math.sin(w);
  g_flLower=  25 * Math.sin(w);
  g_frUpper = -15 * Math.sin(w);
  g_frLower= -25 * Math.sin(w);
  g_blUpper = -10 * Math.sin(w);
  g_blLower =  20 * Math.sin(w);
  g_brUpper =  10 * Math.sin(w);
  g_brLower = -20 * Math.sin(w);
  g_tailBase=  15 * Math.sin(w);
  g_earTilt =  8 * Math.sin(w * 1.7);
}

function leg(root, offX, offY, offZ, upperAng, lowerAng){
  const LEG  = [0.49,0.302,0.173,1], PAW=[0.361,0.224,0.031,1];

  // Upper segment
  const up = new Cube();
  up.color = LEG;
  up.textureNum = 0;                 // fast path: solid color
  up.matrix = new Matrix4(root);
  up.matrix.translate(offX, offY, offZ);
  up.matrix.rotate(upperAng, 0,0,1);
  const saveUp = new Matrix4(up.matrix);
  up.matrix.rotate(180, 1,0,0);
  up.matrix.scale(0.12, 0.21, -0.12);
  up.renderFast();

  // Lower segment
  const low = new Cube();
  low.color = LEG;
  low.textureNum = 0;
  low.matrix = saveUp;
  low.matrix.translate(0.015, -0.19, 0);
  low.matrix.rotate(180, 1,0,0);
  low.matrix.rotate(lowerAng, 0,0,1);
  const saveLow = new Matrix4(low.matrix);
  low.matrix.scale(0.09, 0.15, -0.09);
  low.renderFast();

  // Paw
  const paw = new Cube();
  paw.color = PAW;
  paw.textureNum = 0;
  paw.matrix = saveLow;
  paw.matrix.translate(-0.01, 0.14, -0.09);
  paw.matrix.scale(0.11, 0.11, 0.11);
  paw.renderFast();
}


function drawAnimal(root){
  /* torso */
  const torso = new Cube();
  torso.color = [0.431,0.247,0.122,1];
  torso.textureNum = 0;
  torso.matrix = new Matrix4(root);
  torso.matrix.translate(-0.55, -0.15, 0);
  torso.matrix.scale(0.75, 0.3, 0.5);
  torso.renderFast();

  /* neck & head */
  const neckBase = new Matrix4(root);
  neckBase.translate(-0.058, -0.05, 0.15);
  neckBase.rotate(-10, 0,0,1);
  neckBase.rotate(g_neckYaw, 0,1,0);

  const neck = new Cube();
  neck.color = [0.431,0.247,0.122,1];
  neck.textureNum = 0;
  neck.matrix = new Matrix4(neckBase);
  neck.matrix.scale(0.25, 0.39, 0.2);
  neck.renderFast();

  const head = new Cube();
  head.color = [0.49,0.302,0.173,1];
  head.textureNum = 0;
  head.matrix = new Matrix4(neckBase);
  head.matrix.translate(-0.03, 0.32, -0.038);
  head.matrix.rotate(-11, 0,0,1);
  head.matrix.rotate(g_headYaw, 0,1,0);
  head.matrix.scale(0.38, 0.23, 0.26);
  head.renderFast();
  const headRef = new Matrix4(head.matrix);

  /* ears */
  const earL = new Pyramid();
  earL.color = [0.361,0.224,0.031,1];
  earL.matrix = new Matrix4(headRef);
  earL.matrix.translate(0.01, 1.05, 0.9);
  earL.matrix.rotate(-10, 0,0,1);
  earL.matrix.rotate(g_earTilt, 1,0,0);
  earL.matrix.scale(0.38, 0.38, 0.42);
  earL.renderFast();

  const earR = new Pyramid();
  earR.color = [0.361,0.224,0.031,1];
  earR.matrix = new Matrix4(headRef);
  earR.matrix.translate(0.01, 1.05, 0.10);
  earR.matrix.rotate(-10, 0,0,1);
  earR.matrix.rotate(-g_earTilt, 1,0,0);
  earR.matrix.scale(0.38, 0.38, -0.42);
  earR.renderFast();

  /* tail */
  const tail = new Cube();
  tail.color = [0.361,0.224,0.031,1];
  tail.textureNum = 0;
  tail.matrix = new Matrix4(root);
  tail.matrix.translate(-0.66, -0.05, 0.21);
  tail.matrix.rotate(g_tailBase, 0,1,0);
  tail.matrix.rotate(5, 0,0,1);
  tail.matrix.scale(0.11, 0.11, 0.11);
  tail.renderFast();

  /* legs */
  leg(root,  0.01,-0.07, 0.08, g_flUpper, g_flLower);
  leg(root,  0.01,-0.07, 0.35, g_frUpper, g_frLower);
  leg(root, -0.50,-0.08, 0.08, g_blUpper, g_blLower);
  leg(root, -0.50,-0.08, 0.35, g_brUpper, g_brLower);
}

function renderAllShapes() {
  var start_time = performance.now();

  var viewMat = camera.viewMatrix;
  viewMat.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var projMat = camera.projectionMatrix;
  projMat.setPerspective(90, canvas.width/canvas.height, .05, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var globalRotMat = new Matrix4();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  let sky = new Cube();
  sky.textureNum = 2;
  sky.color = [1, 0, 0, 1];
  sky.matrix.translate(-1, -1, -1);
  sky.matrix.scale(100, 100, 100);
  sky.matrix.translate(-0.5, -0.5, -0.5)
  sky.renderFast();
  

  let floor = new Cube();
  floor.textureNum = 3;
  floor.color = [1, 0, 0, 1];
  floor.matrix.translate(0, -0.76, 0.0);
  floor.matrix.scale(world.grid * world.voxel, 0.01, world.grid * world.voxel);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.renderFast();

  world.drawMap();
  world.drawDynamicBlocks();

  const s = world.voxel;    
  const root=new Matrix4();
  root.translate(world.dogX, -0.6 * s, world.dogZ);
  root.scale(0.75, 0.75, 0.75);
  drawAnimal(root);

  var duration = performance.now() - start_time;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), 'performanceDisplay');
}

function sendTextToHTML(txt, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlID) {
    console.log("Failed to get " + htmlID + " from HTML.");
    return;
  }
  htmlElm.innerHTML = txt;
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;

  updateAnimationAngles();
  
  renderAllShapes();

  requestAnimationFrame(tick);
}

function main() {
  // set up canvas and gl
  setUpWebGL();
  // set up 
  connectVariablesToGLSL();

  addActionListeners();

  document.onkeydown = keydown;

  initTextures();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  requestAnimationFrame(tick);
}