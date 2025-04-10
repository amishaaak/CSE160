class Point{
    constructor(){
        this.type = 'point';
        this.position = [0.0, 0.0,0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5;
        this.rotation = 0;    
    }

    //render this shape
    render(){
        const [cx, cy] = this.position;
        const [r, g, b, a] = this.color;
        const size = this.size;
        const rot = this.rotation;

        gl.uniform4f(u_FragColor, r, g, b, a);

        const half = (size / 200.0) / 2;

        //four corners of an un‑rotated square
        const corners = [
        [ cx - half, cy - half ],
        [ cx + half, cy - half ],
        [ cx + half, cy + half ],
        [ cx - half, cy + half ],
        ];

        // rotate each corner around (cx,cy)
        const rPts = corners.map(p => rotatePoint(p, [cx, cy], rot));

        // draw two triangles to make a square
        drawTriangle([
        rPts[0][0], rPts[0][1],
        rPts[1][0], rPts[1][1],
        rPts[2][0], rPts[2][1]
        ]);
        drawTriangle([
        rPts[2][0], rPts[2][1],
        rPts[3][0], rPts[3][1],
        rPts[0][0], rPts[0][1]
        ]);
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