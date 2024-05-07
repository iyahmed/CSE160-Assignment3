class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
    }

    forward() { // Using the forward direction formula
        var f = new Vector3(); 
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
    }

    back() { // Using the back direction formula
        var f = new Vector3(); 
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        this.eye = this.eye.sub(f);
        this.at = this.at.sub(f);
    }

    left() { // Using the left direction formula
        var f = new Vector3();
        var s = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        s.set(Vector3.cross(f, this.up));
        s.normalize();
        this.at = this.at.sub(s);
        this.eye = this.eye.sub(s);
    }

    right() { // Using the right direction formula
        var f = new Vector3();
        var s = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        s.set(Vector3.cross(f, this.up));
        s.normalize();
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
    }
}