class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.fov = 60.0;
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);

        this.speed = 0.05;
    }

    isBlocked(worldX, worldZ) {
        const s = this.world.voxel;
        const half = (this.world.grid * s) / 2;
        const vx   = Math.floor((worldX + half) / s);
        const vz   = Math.floor((worldZ + half) / s);
        return this.world.blocks[vx][vz][0] === 1;
    }
    
    moveForward() {
        let forward = new Vector3();
        forward.set(this.at).sub(this.eye).normalize().mul(this.speed);

        let nx = this.eye.elements[0] + forward.elements[0];
        let nz = this.eye.elements[2] + forward.elements[2];

        if (!this.isBlocked(nx, nz)) {
        this.eye.add(forward);
        this.at.add(forward);
        }
    }

    moveBackward() {
        let backward = new Vector3();
        backward.set(this.eye).sub(this.at).normalize().mul(this.speed);

        let nx = this.eye.elements[0] + backward.elements[0];
        let nz = this.eye.elements[2] + backward.elements[2];

        if (!this.isBlocked(nx, nz)) {
        this.eye.add(backward);
        this.at.add(backward);
        }
    }

    moveLeft() {
        // compute left = cross(up, forward)
        let forward = new Vector3().set(this.at).sub(this.eye);
        let left    = Vector3.cross(this.up, forward).normalize().mul(this.speed);

        let nx = this.eye.elements[0] + left.elements[0];
        let nz = this.eye.elements[2] + left.elements[2];

        if (!this.isBlocked(nx, nz)) {
        this.eye.add(left);
        this.at.add(left);
        }
    }
        
    moveRight() {
        let forward = new Vector3().set(this.at).sub(this.eye);
        let right   = Vector3.cross(forward, this.up).normalize().mul(this.speed);

        let nx = this.eye.elements[0] + right.elements[0];
        let nz = this.eye.elements[2] + right.elements[2];

        if (!this.isBlocked(nx, nz)) {
        this.eye.add(right);
        this.at.add(right);
        }
    }

    panLeft(alpha) {
        let pL = new Vector3();
        pL.set(this.at);
        pL.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let pL_prime = rotationMatrix.multiplyVector3(pL);
        pL_prime.normalize();

        this.at.set(this.eye);
        this.at.add(pL_prime);
    }

    panRight(alpha) {
        let pR = new Vector3();
        pR.set(this.at);
        pR.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let pR_prime = rotationMatrix.multiplyVector3(pR);
        pR_prime.normalize();
        
        this.at.set(this.eye);
        this.at.add(pR_prime);
    }

    panUp(alpha) { //also handles the panDown situation 
        if(this.at.elements[1] - this.eye.elements[1] > 1.00 && alpha < 0) return;
        if(this.at.elements[1] - this.eye.elements[1] < -1.00 && alpha > 0) return;

        let pU = new Vector3(); //current look direction which is at - eye
        pU.set(this.at);
        pU.sub(this.eye);
        
        //computing the camera’s local right axis, which is the axis needed to pitch around when looking up or down
        let s = Vector3.cross(pU, this.up);
        s.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, s.elements[0], s.elements[1], s.elements[2]); // rotates the forward vector by –alpha degrees about the side axis s

        let pU_prime = rotationMatrix.multiplyVector3(pU);
        pU_prime.normalize();

        this.at.set(this.eye);
        this.at.add(pU_prime);
    }
}