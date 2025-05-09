class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [0.5, 0.5, 0.5, 0.5];
        this.matrix = new Matrix4();
        this.vbuffer = null;
        this.uvbuffer = null;
        this.textureNum = [0,0,0,0,0,0]; //array of texture options for each face
    }

    render() {
        var rgba = this.color;

        // pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // front face
        gl.uniform1i(u_textureNum, this.textureNum[0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);
        
        //back of the cube
        gl.uniform1i(u_textureNum, this.textureNum[1]);
        drawTriangle3DUV([1.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // face to the right
        gl.uniform1i(u_textureNum, this.textureNum[2]);
        drawTriangle3DUV([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // face to the left
        gl.uniform1i(u_textureNum, this.textureNum[3]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

        //top face
        gl.uniform1i(u_textureNum, this.textureNum[4]);
        drawTriangle3DUV([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // bottom face
        gl.uniform1i(u_textureNum, this.textureNum[5]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0], [0,0, 0,1, 1,1]);
    }

    renderFast() {
        const c = this.color;
        gl.uniform4f(u_FragColor, c[0], c[1], c[2], c[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      
        /* one texture index for every face (solid colour) */
        gl.uniform1i(u_textureNum, 0);
      
        const verts = [
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
      
        drawTriangle3D(verts);
      }
      

}