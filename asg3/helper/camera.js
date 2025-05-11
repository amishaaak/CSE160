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
        this.radius = 0.20;  
    }
    //checks whether a spherical camera at position pos = [x,y,z] would intersect any solid voxels.
    isBlocked(pos) {
        const s    = this.world.voxel;
        const half = (this.world.grid * s) / 2;
      
        const x = pos[0], y = pos[1], z = pos[2];
        const jEye = Math.floor((y + 0.25) / s);
      
        const iMin = Math.floor((x - this.radius + half) / s);
        const iMax = Math.floor((x + this.radius + half) / s);
        const kMin = Math.floor((z - this.radius + half) / s);
        const kMax = Math.floor((z + this.radius + half) / s);
      
        for (let i = iMin; i <= iMax; i++)
          for (let k = kMin; k <= kMax; k++)
            for (let j = 0; j <= jEye && j < this.world.height; j++)
              if (this.isSolid(i, j, k)) return true;
        return false;
      }
      
    // check if the block is solid
    isSolid(i, j, k) {
        return (
          i < 0 || i >= this.world.width  ||
          k < 0 || k >= this.world.depth ||
          j < 0 || j >= this.world.height||
          this.world.blocks[i][k][j] !== 0 
        );
    }
    
    moveForward() {
        const dir  = new Vector3().set(this.at).sub(this.eye).normalize().mul(this.speed);
        const next = new Vector3().set(this.eye).add(dir);
        if (!this.isBlocked(next.elements)) {
          this.eye = next;
          this.at.add(dir);
        }
    }
      
    moveBackward() {
        const dir  = new Vector3().set(this.eye).sub(this.at).normalize().mul(this.speed);
        const next = new Vector3().set(this.eye).add(dir);
        if (!this.isBlocked(next.elements)) {
          this.eye = next;
          this.at.add(dir);
        }
    }
      
    moveLeft() {
        const fwd  = new Vector3().set(this.at).sub(this.eye);
        const left = Vector3.cross(this.up, fwd).normalize().mul(this.speed);
        const next = new Vector3().set(this.eye).add(left);
        if (!this.isBlocked(next.elements)) {
          this.eye = next;
          this.at.add(left);
        }
    }
      
    moveRight() {
        const fwd   = new Vector3().set(this.at).sub(this.eye);
        const right = Vector3.cross(fwd, this.up).normalize().mul(this.speed);
        const next  = new Vector3().set(this.eye).add(right);
        if (!this.isBlocked(next.elements)) {
          this.eye = next;
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