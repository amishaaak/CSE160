class Pyramid {
    constructor() {
      this.type   = 'pyramid';
      this.color  = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.buffer = null;
      this.u_textureNum = 0;
    }
    
    renderFast() {
      const verts = [
        // base (two tris)
        0,0,0,   0.28,0,0.95,  0.95,0,0.05,
        0,0,0,   0.95,0,0.05,  0.28,0,0.95,
        // left
        0,0,0,   0.28,0,0.95,  0.28,0.9,0.90,
        // right
        0.95,0,0.05, 0.28,0,0.95, 0.28,0.9,0.90,
        // front
        0,0,0,   0.28,0.9,0.90, 0.95,0,0.05,
      ];
  
      const c = this.color;
      gl.uniformMatrix4fv(u_ModelMatrix,false,this.matrix.elements);
      gl.uniform1i(u_textureNum, 0);
      gl.uniform4f(u_FragColor,c[0],c[1],c[2],c[3]);
  
      drawTriangle3D(verts); 
    }
}
  