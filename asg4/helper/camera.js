class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.fov = 90.0;
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);

        this.speed = 0.05;
        this.y = 0;
        this.xAngle = 0;
    }

    moveForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);

        this.eye.add(f);
        this.at.add(f);
    }

    moveBackward() {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(this.speed);

        this.eye.add(b);
        this.at.add(b);
    }

    moveLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }
    
    moveRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }

    panLeft(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.normalize();

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panRight(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.normalize();
        
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panUp(alpha) {
        if(this.at.elements[1] - this.eye.elements[1] > 0.99 && alpha < 0) return;
        
        if(this.at.elements[1] - this.eye.elements[1] < -0.99 && alpha > 0) return;
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let s = Vector3.cross(f, this.up);
        s.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, s.elements[0], s.elements[1], s.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.normalize();

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panDown() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let s = Vector3.cross(f, this.up);
        s.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, s.elements[0], s.elements[1], s.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.normalize();

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

}