class LineSegment {
    constructor() {
      this.start = [0,0];
      this.end   = [0,0];
      this.color = [1,1,1,1];
    }
    render() {
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
      // build a 4‑float array [x1,y1,x2,y2]
      const v = [this.start[0], this.start[1], this.end[0], this.end[1]];
      const buf = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);

      // draw the line using suggested gl.LINES
      gl.drawArrays(gl.LINES, 0, 2);
    }
}
