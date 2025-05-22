class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [0.5, 0.5, 0.5, 0.5];
        this.matrix = new Matrix4();
        this.textureNum = [0,0,0,0,0,0]; // front, back, right, left, top, bottom
        this.vbuffer = null;
        this.uvbuffer = null;
        this.nbuffer = null;
    }

    render() {
        if (this.vbuffer === null) {
          this.vbuffer = gl.createBuffer();
          if (!this.vbuffer) {
            console.log("Failed to create the buffer object");
            return -1;
          }
        }

        if (this.uvbuffer === null) {
            this.uvbuffer = gl.createBuffer();
            if (!this.uvbuffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }

        if (this.nbuffer === null) {
            this.nbuffer = gl.createBuffer();
            if (!this.nbuffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }

        var rgba = this.color;

        // pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // front face
        gl.uniform1i(u_textureNum, this.textureNum[0]);
        drawTriangle3DUVNormal(
        this.vbuffer,
        this.uvbuffer,
        this.nbuffer,
        [0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
        [0, 0, 1, 1, 1, 0],
        [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]
        );
        drawTriangle3DUVNormal(
          this.vbuffer,
          this.uvbuffer,
          this.nbuffer,
          [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0],
          [0, 0, 0, 1, 1, 1],
          [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]
        );
        
        //back of the cube
        gl.uniform1i(u_textureNum, this.textureNum[1]);
        drawTriangle3DUVNormal(
        this.vbuffer,
        this.uvbuffer,
        this.nbuffer,
        [1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0],
        [0, 0, 1, 1, 1, 0],
        [0,0,-1,0,0,-1,0,0,-1]
        );
        drawTriangle3DUVNormal(
          this.vbuffer,
          this.uvbuffer,
          this.nbuffer,
          [1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0],
          [0, 0, 0, 1, 1, 1],
          [0,0,-1,0,0,-1,0,0,-1]
        );


        // face to the right
        gl.uniform1i(u_textureNum, this.textureNum[2]);
        drawTriangle3DUVNormal(
        this.vbuffer,
        this.uvbuffer,
        this.nbuffer,
        [1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0],
        [0, 0, 1, 1, 1, 0],
        [-1, 0, 0, -1, 0, 0, -1, 0, 0]
        );
        drawTriangle3DUVNormal(
          this.vbuffer,
          this.uvbuffer,
          this.nbuffer,
          [1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0],
          [0, 0, 0, 1, 1, 1],
          [-1, 0, 0, -1, 0, 0, -1, 0, 0]
        );

        // face to the left
        gl.uniform1i(u_textureNum, this.textureNum[3]);
        drawTriangle3DUVNormal(
          this.vbuffer,
          this.uvbuffer,
          this.nbuffer,
          [0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0],
          [0, 0, 1, 1, 1, 0],
          [1, 0, 0, 1, 0, 0, 1, 0, 0]
        );
        drawTriangle3DUVNormal(
          this.vbuffer,
          this.uvbuffer,
          this.nbuffer,
          [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0],
          [0, 0, 0, 1, 1, 1],
          [1, 0, 0, 1, 0, 0, 1, 0, 0]
        );

        //top face
        gl.uniform1i(u_textureNum, this.textureNum[4]);
        drawTriangle3DUVNormal(
        this.vbuffer,
        this.uvbuffer,
        this.nbuffer,
        [0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0],
        [0, 0, 1, 1, 1, 0],
        [0, -1, 0, 0, -1, 0, 0, -1, 0]
        );
        drawTriangle3DUVNormal(
          this.vbuffer,
          this.uvbuffer,
          this.nbuffer,
          [0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          [0, 0, 0, 1, 1, 1],
          [0, -1, 0, 0, -1, 0, 0, -1, 0]
        );

        // bottom face
        gl.uniform1i(u_textureNum, this.textureNum[5]);
        drawTriangle3DUVNormal(
        this.vbuffer,
        this.uvbuffer,
        this.nbuffer,
        [0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0],
        [0, 0, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0]
        );
        drawTriangle3DUVNormal(
          this.vbuffer,
          this.uvbuffer,
          this.nbuffer,
          [0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
          [0, 0, 0, 1, 1, 1],
          [0, 1, 0, 0, 1, 0, 0, 1, 0]
        );
    }

    renderFast() { //using this for the dog --> solid color only 

      if (this.vbuffer === null) {
        this.vbuffer = gl.createBuffer();
        if (!this.vbuffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }

      if (this.nbuffer === null) {
        this.nbuffer = gl.createBuffer();
        if (!this.nbuffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }
      /* --------- local geometry --------- */
      const cubeVerts = [
        // front
        0,0,0,  1,1,0,  1,0,0,
        0,0,0,  0,1,0,  1,1,0,
        // back
        1,0,1,  0,1,1,  0,0,1,
        1,0,1,  1,1,1,  0,1,1,
        // right
        1,0,0,  1,1,1,  1,0,1,
        1,0,0,  1,1,0,  1,1,1,
        // left
        0,0,1,  0,1,0,  0,0,0,
        0,0,1,  0,1,1,  0,1,0,
        // top
        0,1,0,  1,1,1,  1,1,0,
        0,1,0,  0,1,1,  1,1,1,
        // bottom
        0,0,1,  1,0,0,  1,0,1,
        0,0,1,  0,0,0,  1,0,0
      ];

      const cubeNormals = [
      // front +z
      0,0,1, 0,0,1, 0,0,1,  0,0,1, 0,0,1, 0,0,1,
      // back -z
      0,0,-1, 0,0,-1, 0,0,-1,  0,0,-1, 0,0,-1, 0,0,-1,
      // right +x
      1,0,0, 1,0,0, 1,0,0,  1,0,0, 1,0,0, 1,0,0,
      // left -x
      -1,0,0, -1,0,0, -1,0,0,  -1,0,0, -1,0,0, -1,0,0,
      // top +y
      0,1,0, 0,1,0, 0,1,0,  0,1,0, 0,1,0, 0,1,0,
      // bottom -y
      0,-1,0, 0,-1,0, 0,-1,0,  0,-1,0, 0,-1,0, 0,-1,0
    ];
    
       /* --------- uniforms --------- */
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform1i(u_textureNum, 0);                 // always solid color
    gl.uniform4f(u_FragColor, ...this.color);

    drawTriangle3DUVNormal(
      this.vbuffer,
      null,
      this.nbuffer,
      cubeVerts,
      null,
      cubeNormals
    );
  }
}