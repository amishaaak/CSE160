class Circle {
   constructor() {
      this.type = "circle";
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 5.0;
      this.segments = 10;
   }

   render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
   
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
   
      // Draw
      var delta = this.size/200.0;

      let angle_iteration = 360.0/this.segments;

      for(var angle = 0; angle < 360; angle+=angle_iteration ) {
         let centerPT = [xy[0], xy[1]];
         let angle1 = angle;
         let angle2 = angle + angle_iteration;
         let vector1 = [delta * Math.cos(angle1*Math.PI/180)/2, delta * Math.sin(angle1*Math.PI/180)/2];
         let vector2 = [delta * Math.cos(angle2*Math.PI/180)/2, delta * Math.sin(angle2*Math.PI/180)/2];
         let pt1 = [centerPT[0] + vector1[0], centerPT[1] + vector1[1]];
         let pt2 = [centerPT[0] + vector2[0], centerPT[1] + vector2[1]];

         drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
      }
   }
}