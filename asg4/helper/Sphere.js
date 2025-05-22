class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.vbuffer = null;
        this.uvbuffer = null;
        this.nbuffer = null;
        this.textureNum = -1;
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

        let rgba = this.color;

        gl.uniform1i(u_textureNum, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let d = Math.PI / 10;
        let dd = Math.PI / 10;

        for (let t = 0; t < Math.PI; t += d) {
            for (let r = 0; r < 2 * Math.PI; r += d) {
                let p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)];

                let p2 = [Math.sin(t + dd) * Math.cos(r), Math.sin(t + dd) * Math.sin(r), Math.cos(t + dd)];
                let p3 = [Math.sin(t) * Math.cos(r + dd), Math.sin(t) * Math.sin(r + dd), Math.cos(t)];
                let p4 = [Math.sin(t + dd) * Math.cos(r + dd), Math.sin(t + dd) * Math.sin(r + dd), Math.cos(t + dd)];

                let n1 = [-Math.sin(t) * Math.cos(r), -Math.sin(t) * Math.sin(r), -Math.cos(t)];
                let n2 = [-Math.sin(t + dd) * Math.cos(r), -Math.sin(t + dd) * Math.sin(r), -Math.cos(t + dd)];
                let n3 = [-Math.sin(t) * Math.cos(r + dd), -Math.sin(t) * Math.sin(r + dd), -Math.cos(t)];
                let n4 = [-Math.sin(t + dd) * Math.cos(r + dd), -Math.sin(t + dd) * Math.sin(r + dd), -Math.cos(t + dd)];

                let uv1 = [t/Math.PI, r/(2*Math.PI)];
                let uv2 = [(t + dd)/Math.PI, r/(2*Math.PI)];
                let uv3 = [t/Math.PI, (r + dd)/(2*Math.PI)];
                let uv4 = [(t + dd)/Math.PI, (r + dd)/(2*Math.PI)];
                
                let v = [];
                let n = [];
                let uv = [];

                v = v.concat(p1); uv = uv.concat(uv1); n = n.concat(n1);
                v = v.concat(p2); uv = uv.concat(uv2); n = n.concat(n2);
                v = v.concat(p4); uv = uv.concat(uv4); n = n.concat(n4);

                gl.uniform4f(u_FragColor, 0.6, 0.8, 1.0, 1.0);
                drawTriangle3DUVNormal(this.vbuffer, this.uvbuffer, this.nbuffer, v, uv, n);

                v=[]; uv=[]; n = [];
                v = v.concat(p1); uv = uv.concat(uv1); n = n.concat(n1);
                v = v.concat(p4); uv = uv.concat(uv4); n = n.concat(n4);
                v = v.concat(p3); uv = uv.concat(uv3); n = n.concat(n3);
                
                gl.uniform4f(u_FragColor, 0.1, 0.2, 0.8, 1.0);
                drawTriangle3DUVNormal(this.vbuffer, this.uvbuffer, this.nbuffer, v, uv, n);                
            }
        }
    }
}