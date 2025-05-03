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
        if(this.vbuffer === null) {
            this.vbuffer = gl.createBuffer();
            if (!this.vbuffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }
        
        if(this.uvbuffer === null) {
            this.uvbuffer = gl.createBuffer();
            if (!this.uvbuffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }

        var rgba = this.color;

        // pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //pass the texture number
        gl.uniform1i(u_textureNum, this.textureNum);

        // front face
        gl.uniform1i(u_textureNum, this.textureNum[0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);
        
        // back of the cube
        gl.uniform1i(u_textureNum, this.textureNum[1]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // face to the right
        gl.uniform1i(u_textureNum, this.textureNum[2]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // face to the left
        gl.uniform1i(u_textureNum, this.textureNum[3]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 1.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

        // top face
        gl.uniform1i(u_textureNum, this.textureNum[4]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // bottom face
        gl.uniform1i(u_textureNum, this.textureNum[5]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 1.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0], [0,0, 0,1, 1,1]);
    }


    renderSkyCube() {

        //gl.disable(gl.CULL_FACE);
        //gl.depthMask(false);

        if(this.vbuffer === null) {
            this.vbuffer = gl.createBuffer();
            if (!this.vbuffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }

        if(this.uvbuffer === null) {
            this.uvbuffer = gl.createBuffer();
            if (!this.uvbuffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }

        var rgba = this.color;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // front of the cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        gl.uniform1i(u_textureNum, this.textureNum);
        
        // front face
        gl.uniform1i(u_textureNum, this.textureNum[0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  0.0, 1.0, 0.0], [0,0, 0,1, 1,1]);
        
        // back face
        gl.uniform1i(u_textureNum, this.textureNum[1]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // right face
        gl.uniform1i(u_textureNum, this.textureNum[2]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 0.0, 1.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

        // left face
        gl.uniform1i(u_textureNum, this.textureNum[3]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0], [0,0, 0,1, 1,1]);


        // top face
        gl.uniform1i(u_textureNum, this.textureNum[4]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 1.0, 0.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [1.0, 1.0, 0.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // bottom face
        gl.uniform1i(u_textureNum, this.textureNum[5]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vbuffer, this.uvbuffer, [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0], [0,0, 0,1, 1,1]);

        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);

    }

    renderFast() {
        let rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
        var allVerts = []

        // front + back faces
        gl.uniform1i(u_textureOption, 0);
        allVerts = allVerts.concat([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
        allVerts = allVerts.concat([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);
  
        allVerts = allVerts.concat([1.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0]);
        allVerts = allVerts.concat([1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0]);
  
        // right + left faces
        allVerts = allVerts.concat([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0]);
        allVerts = allVerts.concat([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0]);
  
        allVerts = allVerts.concat([0.0, 0.0, 1.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0]);
        allVerts = allVerts.concat([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0]);
  
        // top + bottom faces
        allVerts = allVerts.concat([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
        allVerts = allVerts.concat([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);
  
        allVerts = allVerts.concat([0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0]);
        allVerts = allVerts.concat([0.0, 0.0, 1.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0]);
  
        drawTriangle3D(allVerts);
    }

}