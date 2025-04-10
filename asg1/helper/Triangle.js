class Triangle {
    constructor() {
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.rotation = 0;    
    }

    render() {
        const [cx, cy] = this.position;
        const rgba = this.color;
        const size = this.size;
        const rot= this.rotation;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);

        // build the three corners of an equilateral triangle around (cx,cy)
        const delta = size / 200.0;
        const pts = [[cx,cy],[cx - delta/2,cy - delta*Math.sqrt(3)/2],[cx + delta/2, cy - delta*Math.sqrt(3)/2]];

        // rotate each corner around the center by this.rotation degrees
        const rPts = pts.map(p => rotatePoint(p, [cx, cy], rot));

        drawTriangle([rPts[0][0], rPts[0][1], rPts[1][0], rPts[1][1],rPts[2][0], rPts[2][1]]);
    }
}

function rotatePoint([x,y], [cx,cy], deg) {
    const rad = deg * Math.PI/180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const dx  = x - cx, dy = y - cy;
    return [
      cx + dx*cos - dy*sin,
      cy + dx*sin + dy*cos
    ];
}

function drawTriangle(vertices) {
    var n = 3; // Number of vertices
  
    //Create a buffer object that lives on the GPU
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object (sending the vertices to the GPU/ GLSL)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangleColor(vertices, rgba){
    gl.uniform4f(u_FragColor, rgba[0]/255, rgba[1]/255, rgba[2]/255, rgba[3]);

    var n = 3; 

    //Create a buffer object that lives on the GPU
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
