class Pyramid {
    constructor() {
      this.type   = 'pyramid';
      this.color  = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.buffer = null;
    }
    
    render() {
      if (!this.buffer) {
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }
  
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      const rgba = this.color;
  
      // base (darker)
      gl.uniform4f(u_FragColor, 0.5*rgba[0], 0.5*rgba[1], 0.5*rgba[2], rgba[3]);
      drawTriangle3D([ 0.0, 0.0, 0.0,    0.28, 0.0, 0.95,   0.95, 0.0, 0.05],this.buffer);
  
      // left face (full color)
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      drawTriangle3D([ 0.0, 0.0, 0.0,    0.28, 0.0, 0.95,  0.28, 0.9, 0.90],this.buffer);
  
      // right face (mid‑tone)
      gl.uniform4f(u_FragColor,0.7*rgba[0], 0.7*rgba[1], 0.7*rgba[2], rgba[3]);
      drawTriangle3D([ 0.95, 0.0, 0.05,  0.28, 0.0, 0.95,  0.28, 0.9, 0.90],this.buffer);
  
      // front face (slightly lighter)
      gl.uniform4f(u_FragColor,0.6*rgba[0], 0.6*rgba[1], 0.6*rgba[2], rgba[3]);
      drawTriangle3D([ 0.0, 0.0, 0.0,  0.28, 0.9,0.90,    0.95, 0.05, 0.0],this.buffer);
    }
}
  