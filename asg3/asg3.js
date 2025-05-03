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

let u_textureNum;
let u_texColorWeight;

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

  u_textureNum = gl.getUniformLocation(gl.program, 'u_textureNum');
  if(!u_textureNum) {
    console.log('Failed to create texture option object');
    return false;
  }

  let x = new Matrix4();
  camera = new Camera();
  camera.eye = new Vector3([0, 0, 3]);
  camera.at = new Vector3([0, 0, -100]);
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


function addActionListeners() { 
  
}

function keydown(ev) {
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


function convertMouseToEventCoords(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
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
  sky.textureNum = [2,2,2,2,2,0];
  sky.color = [1, 0, 0, 1];
  sky.matrix.translate(-1, -1, -1);
  sky.matrix.scale(100, 100, 100);
  sky.matrix.translate(-0.5, -0.5, -0.5)
  sky.renderSkyCube();

  let floor = new Cube();
  floor.textureNum = [3,3,3,3,3,3];
  floor.color = [1, 0, 0, 1];
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(10, 0.01, 10);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

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
  
  renderAllShapes();

  requestAnimationFrame(tick);
}
