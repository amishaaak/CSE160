
//Vertex shader program (describes the traits of the vertex)
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 30.0;
    gl_PointSize = u_Size; 
  }`

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

function showReference() {
    document.getElementById('referenceImage').style.display = 'block';
}
function hideReference() {
    document.getElementById('referenceImage').style.display = 'none';
}

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
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
    
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    //Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if(!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // Default color is white
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegCount = 10.0;
let g_selectedRotation = 0;
let g_prevPoint = null; 

function addActionsForHtmlUI() {
    document.getElementById('clearButton').onclick = function() {g_shapesList = []; renderAllShapes(); hideReference();};
    document.getElementById('generateDrawing').onclick = function() {generatePic(); showReference();};
    
    document.getElementById('pointButton').onclick = function() {g_selectedType = POINT; hideReference();};
    document.getElementById('triButton').onclick = function() {g_selectedType = TRIANGLE; hideReference();};
    document.getElementById('circButton').onclick = function() {g_selectedType = CIRCLE; hideReference();};

    // slider events
    document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/255; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/255; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/255; });

    document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value; });
    document.getElementById('segmentCount').addEventListener('mouseup', function() {g_selectedSegCount = this.value; });

    const rotSlide = document.getElementById('rotationSlide');
    const rotValue = document.getElementById('rotationValue');
    rotSlide.addEventListener('input', function() {g_selectedRotation = Number(this.value); rotValue.textContent = this.value;});
}

function main() {
    //Set up canvas and gl variables
    setupWebGL();

    //Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};
    canvas.onmouseup = function(ev) {g_prevPoint = null;};

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
    hideReference(); 
    
    // Extract the event click and return it in WebGL coordinates
    let [x,y] = convertCoordinateEventsToGL(ev);

    if (g_prevPoint) { //checks if the previous point is not null
        const seg = new LineSegment(); //renders a straight line between two points
        seg.start = g_prevPoint; //sets start to the last mouse coordinate recorded
        seg.end = [x,y]; //ending coordinates
        seg.color = g_selectedColor.slice();
        g_shapesList.push(seg);
    }

    let shape;

    if(g_selectedType == POINT) {
        shape = new Point();
    } else if (g_selectedType == TRIANGLE) {
        shape = new Triangle();
    } else if (g_selectedType == CIRCLE) {
        shape = new Circle();
        shape.segments = g_selectedSegCount;
    }
    shape.position = [x,y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;
    shape.rotation = g_selectedRotation;
    g_shapesList.push(shape);

    g_prevPoint = [x,y];
    
    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();

}

function convertCoordinateEventsToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x, y]);
}

//Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
    var start_time = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();    
    }

    var duration = performance.now() - start_time;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), 'performanceDisplay');

}

function sendTextToHTML(txt, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if(!htmlID) {
      console.log("Failed to get " + htmlID + " from HTML.");
      return;
    }
    htmlElm.innerHTML = txt;
}

function generatePic(){
    g_shapesList = [];
    renderAllShapes();

    // drew on a 0->10 paper grid and converting to WebGL space of -1 to 1
    const toGL = (x,y) => [ (x/10)*2 - 1, (y/10)*2 - 1 ];

    const body   = [ 255, 255, 255, 1.0 ]; //white body
    const wingTop = [ 49, 138, 228, 1.0 ]; //darker blue
    const wingBot = [ 53, 171, 230, 1.0 ]; //lighter blue
    const ant    = [ 255, 255, 255, 1.0 ]; //white antennae
  
    // Body
    const bbL = toGL(4.7,4), 
          bbR = toGL(5.3,4),
          btL = toGL(4.7,6), 
          btR = toGL(5.3,6);
    drawTriangleColor([...bbL,...bbR,...btL], body);
    drawTriangleColor([...bbR,...btR,...btL], body);
  
    // Upper-left
    const ulWC  = toGL(3,7),    
          ulWE1  = toGL(5,6.5),
          ulWT  = toGL(1.5,9),  
          ulWE2 = toGL(1.2,6),
          ulWB  = toGL(3,5.2);
    drawTriangleColor([...ulWC,...ulWE1,...ulWT ], wingTop);
    drawTriangleColor([...ulWC,...ulWT,...ulWE2], wingTop);
    drawTriangleColor([...ulWC,...ulWE2,...ulWB ], wingTop);
    drawTriangleColor([...ulWC,...ulWB,...ulWE1 ], wingTop);
  
    // Upper-right
    const urWC  = toGL(7,7),
          urWE1  = toGL(5,6.5),
          urWT  = toGL(8.5,9),
          urWE2 = toGL(8.8,6),
          urWB  = toGL(7,5.2);
    drawTriangleColor([...urWC,...urWE1,...urWT ], wingTop);
    drawTriangleColor([...urWC,...urWT,...urWE2], wingTop);
    drawTriangleColor([...urWC,...urWE2,...urWB ], wingTop);
    drawTriangleColor([...urWC,...urWB,...urWE1 ], wingTop);
  
    // Lower-left
    const llWC  = toGL(3,3.3),
          llWE1  = toGL(5,4),
          llWT  = toGL(1.5,6),
          llWE2 = toGL(1.2,3.8),
          llWB  = toGL(3,3);
    drawTriangleColor([...llWC,...llWE1,...llWT ], wingBot);
    drawTriangleColor([...llWC,...llWT,...llWE2], wingBot);
    drawTriangleColor([...llWC,...llWE2,...llWB ], wingBot);
    drawTriangleColor([...llWC,...llWB,...llWE1 ], wingBot);
  
    // Lower-right
    const lrWC  = toGL(7,3.3),
          lrWE1  = toGL(5,4),
          lrWT  = toGL(8.5,6),
          lrWE2= toGL(8.8,3.8),
          lrWB  = toGL(7,3);
    drawTriangleColor([...lrWC,...lrWE1,...lrWT ], wingBot);
    drawTriangleColor([...lrWC,...lrWT,...lrWE2], wingBot);
    drawTriangleColor([...lrWC,...lrWE2,...lrWB ], wingBot);
    drawTriangleColor([...lrWC,...lrWB,...lrWE1 ], wingBot);
  
    // Antennae
    const aB = toGL(5,6),
          aM = toGL(5,7),
          aL = toGL(4.5,7.3), 
          aR = toGL(5.5,7.3);
    drawTriangleColor([...aB,...aM,...aL], ant);
    drawTriangleColor([...aB,...aM,...aR], ant);
}