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

        this.speed = 0.045;
    }

    moveForward() {
        let forward = new Vector3();
        forward.set(this.at);
        forward.sub(this.eye);
        forward.normalize();
        forward.mul(this.speed);

        this.eye.add(forward);
        this.at.add(forward);
    }

    moveBackward() {
        let back = new Vector3();
        back.set(this.eye);
        back.sub(this.at);
        back.normalize();
        back.mul(this.speed);

        this.eye.add(back);
        this.at.add(back);
    }

    moveLeft() {
        let left = new Vector3();
        left.set(this.at);
        left.sub(this.eye);

        let s = Vector3.cross(this.up, left);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }
    
    moveRight() {
        let right = new Vector3();
        right.set(this.at);
        right.sub(this.eye);

        let s = Vector3.cross(right, this.up);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
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

    // panUp(alpha) {
    //     if(this.at.elements[1] - this.eye.elements[1] > 0.99 && alpha < 0) return;
        
    //     if(this.at.elements[1] - this.eye.elements[1] < -0.99 && alpha > 0) return;
    //     let pU = new Vector3();
    //     pU.set(this.at);
    //     pU.sub(this.eye);
        
    //     // vector is orthogonal to f and up, aka it points up
    //     let s = Vector3.cross(pU, this.up);
    //     s.normalize();

    //     let rotationMatrix = new Matrix4();
    //     rotationMatrix.setRotate(-alpha, s.elements[0], s.elements[1], s.elements[2]);

    //     let pU_prime = rotationMatrix.multiplyVector3(pU);
    //     pU_prime.normalize();

    //     this.at.set(this.eye);
    //     this.at.add(pU_prime);
    // }

    // panDown() {
    //     let pD = new Vector3();
    //     pD.set(this.at);
    //     pD.sub(this.eye);
        
    //     // vector is orthogonal to f and up, aka it points up
    //     let s = Vector3.cross(pD, this.up);
    //     s.normalize();

    //     let rotationMatrix = new Matrix4();
    //     rotationMatrix.setRotate(alpha, s.elements[0], s.elements[1], s.elements[2]);

    //     let pD_prime = rotationMatrix.multiplyVector3(pD);
    //     pD_prime.normalize();

    //     this.at.set(this.eye);
    //     this.at.add(pD_prime);
    // }

    // mousePan(dX, dY) {
    //     this.panRight(dX);
    // }
}