class Circle {
   constructor() {
      this.type = "circle";
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 5.0;
      this.segments = 10;
      this.rotation = 0;    
   }

   render() {
      const [cx, cy] = this.position;
      const rgba = this.color;
      const size = this.size;
      const seg = this.segments;
      const rot = this.rotation;
  
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
      const radius = size/200.0/2;
      const step = 360.0 / seg;
  
      for (let a = 0; a < 360; a += step) {
        const a1 = a * Math.PI/180, a2 = (a + step) * Math.PI/180;
        const p1 = [cx + Math.cos(a1)*radius, cy + Math.sin(a1)*radius];
        const p2 = [cx + Math.cos(a2)*radius, cy + Math.sin(a2)*radius];
  
        // rotate both points around the center by rotation value
        const rp1 = rotatePoint(p1, [cx,cy], rot);
        const rp2 = rotatePoint(p2, [cx,cy], rot);
  
        drawTriangle([cx, cy, rp1[0], rp1[1], rp2[0], rp2[1]]);
      }
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