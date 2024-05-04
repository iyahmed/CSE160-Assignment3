class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front side of the cube
        drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [1,0,0,1,1,1]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0,0,0,1,1,1]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top side of the cube
        drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [1,0,0,1,1,1]);
        drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0,0,0,1,1,1]);

        // Bottom side of the cube
        drawTriangle3DUV([1, 0, 1, 1, 0, 0, 0, 0, 0], [1,0,0,1,1,1]);
        drawTriangle3DUV([1, 0, 1, 0, 0, 0, 0, 0, 1], [0,0,0,1,1,1]);

        // Back side of the cube
        drawTriangle3DUV([1, 1, 1, 0, 0, 1, 0, 1, 1], [1,0,0,1,1,1]);
        drawTriangle3DUV([1, 1, 1, 1, 0, 1, 0, 0, 1], [0,0,0,1,1,1]);

        // Left side of the cube
        drawTriangle3DUV([0, 1, 1, 0, 0, 1, 0, 0, 0], [1,0,0,1,1,1]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 0, 1, 1], [0,0,0,1,1,1]);

        // Right side of the cube
        drawTriangle3DUV([1, 0, 0, 1, 1, 0, 1, 1, 1], [1,0,0,1,1,1]);
        drawTriangle3DUV([1, 1, 1, 1, 0, 1, 1, 0, 0], [0,0,0,1,1,1]);
    }
}