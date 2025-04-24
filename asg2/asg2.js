//Vertex shader program (describes the traits of the vertex)
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
   void main() {
    gl_Position = u_GlobalRotateMatrix *
                  u_ModelMatrix *
                  a_Position;
  }`;

// Fragment shader program (deals with per-fragment processing)
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
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
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    
    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

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

    //Set an initial value for the model matrix
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// ---- Globals related UI elements ----

//Related to rotation
var g_cameraAngleY = 30.0; 
var g_cameraAngleX = 0.0; 

//Body parts
let g_headYaw = 0;
let g_flUpper = 0; 
let g_flLower = 0;  
let g_frUpper = 0;
let g_frLower = 0;
let g_blUpper = 0;
let g_blLower = 0;
let g_brUpper = 0;
let g_brLower = 0;
let g_tailBase = 0;
let g_earTilt = 0;

//Buttons
let g_animationActive = true;
let g_shiftMode = false;

//Mouse drag
var g_deltaX = 0, g_deltaY = 0;

function addActionsForHtmlUI() {

    //Buttons 
    document.getElementById('toggle-animation').onclick = function() {g_animationActive = !g_animationActive;};
    document.getElementById('toggle-shift').onclick = function () {
        g_shiftMode = !g_shiftMode;
        if (!g_shiftMode) {
          g_cameraAngleX = 0;
        }
    };
    //Slider controls
    document.getElementById('angleSlide').addEventListener('mousemove', function() {g_cameraAngleY = this.value; renderAllShapes();});
    document.getElementById('headYaw').addEventListener('mousemove', function() {g_headYaw = this.value; renderAllShapes();});
    document.getElementById('earTilt').addEventListener('mousemove', function() {g_earTilt = this.value; renderAllShapes();});

    //Body slider controls 
    document.getElementById('flUpper').addEventListener('mousemove', function() {g_flUpper = this.value; renderAllShapes();});
    document.getElementById('flLower').addEventListener('mousemove', function() {g_flLower = this.value; renderAllShapes();});

    document.getElementById('frUpper').addEventListener('mousemove', function() {g_frUpper = this.value; renderAllShapes();});
    document.getElementById('frLower').addEventListener('mousemove', function() {g_frLower = this.value; renderAllShapes();});

    document.getElementById('blUpper').addEventListener('mousemove', function() {g_blUpper = this.value; renderAllShapes();});
    document.getElementById('blLower').addEventListener('mousemove', function() {g_blLower = this.value; renderAllShapes();});

    document.getElementById('brUpper').addEventListener('mousemove', function() {g_brUpper = this.value; renderAllShapes();});
    document.getElementById('brLower').addEventListener('mousemove', function() {g_brLower = this.value; renderAllShapes();});


    document.getElementById('canvas-container').addEventListener('click', ev => {
        if (ev.shiftKey) {
          g_shiftMode = !g_shiftMode;
          if (!g_shiftMode) g_cameraAngleX = 0;
        }
    });

    canvas.onmousemove = function(ev) {
        let [x, y] = convertMouseToEventCoords(ev);
        if(ev.buttons == 1) {
            g_cameraAngleY -= (x - g_deltaX) * 120;
            g_cameraAngleX -= (y - g_deltaY) * 120;
            g_deltaX = x;
            g_deltaY = y;
        } else {
            g_deltaX = x;
            g_deltaY = y;
        }
    }

}

function convertMouseToEventCoords(ev) {
    var x = ev.clientX; 
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
    return([x, y]);
}

function updateAnimationAngles() {
    if (!g_animationActive) return;
    const w = g_seconds * 3.3;
  
    /* idle walk */
    g_flUpper =  15 * Math.sin(w);  g_flLower = 25 * Math.sin(w);
    g_frUpper = -15 * Math.sin(w);  g_frLower = -25 * Math.sin(w);
    g_blUpper = -10 * Math.sin(w);  g_blLower = 20 * Math.sin(w);
    g_brUpper =  10 * Math.sin(w);  g_brLower = -20 * Math.sin(w);
    g_tailBase = 15 * Math.sin(w);      
    g_earTilt  =  8 * Math.sin(w * 1.7);
  
    //--- roll onto back & wiggle ---
    if (g_shiftMode) {
      const wig = 20 * Math.sin(w * 5); //paw wiggle
      g_cameraAngleX = 90;
  
      g_flUpper = 60 + wig;   g_flLower = -wig;
      g_frUpper = 60 - wig;   g_frLower =  wig;
      g_blUpper = 60 - wig;   g_blLower = -wig;
      g_brUpper = 60 + wig;   g_brLower =  wig;
  
      g_tailBase = 0;
      g_earTilt  = 0;
    } 
  }
  
  

//Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
    var start_time = performance.now();

    var globalRotMat = new Matrix4()
    globalRotMat.rotate(g_cameraAngleX, 1, 0, 0);  
    globalRotMat.rotate(g_cameraAngleY, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements); //Every vertex gets multiplied by that combined rotation

    //Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
    /* ---------- torso ---------- */
    var torso = new Cube();
    torso.color = [0.431, 0.247, 0.122, 1];           
    torso.matrix.translate(-0.55,-0.15, 0);
    torso.matrix.scale(0.75, 0.3, 0.50);
    torso.render();

    /* ---------- head area ---------- */
    var neck = new Cube();
    neck.color = [0.431, 0.247, 0.122, 1]; 
    neck.matrix.translate(-0.058, -0.05, 0.15);
    neck.matrix.rotate(-10,0,0,1);
    neck.matrix.rotate(g_headYaw, 0,1,0);
    neck.matrix.scale(0.25, 0.39, 0.20);
    neck.render();

    var head = new Cube();
    head.color = [0.49, 0.302, 0.173, 1];
    head.matrix.translate(-0.008, 0.332, 0.115);
    head.matrix.rotate(-11,0,0,1);
    head.matrix.rotate(g_headYaw, 0,1,0);
    var head_mat = new Matrix4(head.matrix);
    head.matrix.scale(0.38, 0.23, 0.26);
    head.render();

    var e1 = new Pyramid();
    e1.color = [0.361, 0.224, 0.031,1];
    e1.matrix = new Matrix4(head_mat);
    e1.matrix.translate(0.004,0.24,0.15);
    e1.matrix.rotate(-10,0,0,1);
    e1.matrix.rotate(g_earTilt, 1,0,0);
    e1.matrix.scale(0.11, 0.11, 0.13);
    e1.render();

    var e2 = new Pyramid();
    e2.color = [0.361, 0.224, 0.031, 1];
    e2.matrix = new Matrix4(head_mat);
    e2.matrix.translate(0.003, 0.24, 0.10);
    e2.matrix.rotate(-10, 0, 0, 1);       
    e2.matrix.rotate(-g_earTilt, 1, 0, 0);  
    e2.matrix.scale(0.11, 0.11, -0.13);
    e2.render();

    /* ---------- tail ---------- */

    var t = new Cube();
    t.color = [0.361, 0.224, 0.031, 1];
    t.matrix.translate(-0.66, -0.05, 0.21); 
    t.matrix.rotate(g_tailBase, 0, 1, 0);
    t.matrix.rotate(5, 0, 0, 1);
    t.matrix.scale(0.11, 0.11, 0.11);
    t.render();


    /* ---------- legs ---------- */
    leg(0.01,-0.07,0.08, g_flUpper, g_flLower, [0.49, 0.302, 0.173, 1], [0.361, 0.224, 0.031, 1]);
    leg(0.01, -0.07, 0.35, g_frUpper, g_frLower, [0.49, 0.302, 0.173, 1],[0.361, 0.224, 0.031, 1]);
    leg(-0.5, -0.08,  0.08, g_blUpper, g_blLower, [0.49, 0.302, 0.173, 1],[0.361, 0.224, 0.031, 1]);
    leg(-0.50, -0.08,  0.35, g_brUpper, g_brLower, [0.49, 0.302, 0.173, 1],[0.361, 0.224, 0.031, 1]);


    var duration = performance.now() - start_time;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), 'performanceDisplay');

}

function tailSegment(x,y,z,angle,sx,sz,color){
    var t = new Cube();
    t.color = color;
    t.matrix.translate(x,y,z);
    t.matrix.rotate(angle,0,1,0);
    t.matrix.scale(sx,0.08,sz);
    t.render();
}
  
  
function leg(offsetX, offsetY, offsetZ, upperAng, lowerAng, legColor, pawColor){
    /* upper */
    var upper = new Cube();
    upper.color = legColor;
    upper.matrix.setTranslate(offsetX, offsetY, offsetZ);
    upper.matrix.rotate(upperAng, 0,0,1);
    var saveUpper = new Matrix4(upper.matrix);
    upper.matrix.rotate(180,1,0,0);
    upper.matrix.scale(0.12,0.21,-0.12);
    upper.render();
  
    /* lower */
    var lower = new Cube();
    lower.color = legColor;
    lower.matrix = saveUpper;
    lower.matrix.translate(0.015,-0.19,0);
    lower.matrix.rotate(180,1,0,0);
    lower.matrix.rotate(lowerAng,0,0,1);
    var saveLower = new Matrix4(lower.matrix);
    lower.matrix.scale(0.09,0.15,-0.09);
    lower.render();
  
    /* paw */
    var paw = new Cube();
    paw.color = pawColor;
    paw.matrix = saveLower;
    paw.matrix.translate(-0.01,0.14,-0.09);
    paw.matrix.scale(0.11,0.11,0.11);
    paw.render();
}

function sendTextToHTML(txt, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if(!htmlID) {
      console.log("Failed to get " + htmlID + " from HTML.");
      return;
    }
    htmlElm.innerHTML = txt;
}

function main() {
    //Set up canvas and gl variables
    setupWebGL();

    //Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();
    
    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
    //Get the current time
    g_seconds = performance.now()/1000.0 - g_startTime;

    updateAnimationAngles();

    renderAllShapes();

    //It requests the browser to call a user-supplied callback function before the next repaint
    requestAnimationFrame(tick);
}
