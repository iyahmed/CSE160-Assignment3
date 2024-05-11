class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
        this.cubeVerts32 = new Float32Array([
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0,
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  1, 1, 0,
            1, 1, 0,  1, 1, 1,  1, 0, 0,
            1, 0, 0,  1, 1, 1,  1, 0, 1,
            0, 1, 0,  0, 1, 1,  0, 0, 0,
            0, 0, 0,  0, 1, 1,  0, 0, 1,
            0, 0, 0,  0, 0, 1,  1, 0, 1,
            0, 0, 0,  1, 0, 1,  1, 0, 0,
            0, 0, 1,  1, 1, 1,  1, 0, 1,
            0, 0, 1,  0, 1, 1,  1, 1, 1
        ]);
        // this.cubeVerts = [
        //     0, 0, 0,  1, 1, 0,  1, 0, 0,
        //     0, 0, 0,  0, 1, 0,  1, 1, 0,
        //     0, 1, 0,  0, 1, 1,  1, 1, 1,
        //     0, 1, 0,  1, 1, 1,  1, 1, 0,
        //     1, 1, 0,  1, 1, 1,  1, 0, 0,
        //     1, 0, 0,  1, 1, 1,  1, 0, 1,
        //     0, 1, 0,  0, 1, 1,  0, 0, 0,
        //     0, 0, 0,  0, 1, 1,  0, 0, 1,
        //     0, 0, 0,  0, 0, 1,  1, 0, 1,
        //     0, 0, 0,  1, 0, 1,  1, 0, 0,
        //     0, 0, 1,  1, 1, 1,  1, 0, 1,
        //     0, 0, 1,  0, 1, 1,  1, 1, 1
        // ];
    }

    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

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
    renderfast() {
        var rgba = this.color;

        // Pass the texture number for colors
        gl.uniform1i(u_whichTexture, -2);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Array for all sides of the cube
        var allverts = [];

        // Front side of the cube
        allverts = allverts.concat([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        allverts = allverts.concat([0, 0, 0, 0, 1, 0, 1, 1, 0]);
        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top side of the cube
        allverts = allverts.concat([0, 1, 0, 0, 1, 1, 1, 1, 1]);
        allverts = allverts.concat([0, 1, 0, 1, 1, 1, 1, 1, 0]);

        // Right side of the cube
        allverts = allverts.concat([1, 1, 0, 1, 1, 1, 1, 0, 0]);
        allverts = allverts.concat([1, 0, 0, 1, 1, 1, 1, 0, 1]);

        // Left side of the cube
        allverts = allverts.concat([0, 1, 0, 0, 1, 1, 0, 0, 0]);
        allverts = allverts.concat([0, 0, 0, 0, 1, 1, 0, 0, 1]);

        // Bottom side of the cube
        allverts = allverts.concat([0, 0, 0, 0, 0, 1, 1, 0, 1]);
        allverts = allverts.concat([0, 0, 0, 1, 0, 1, 1, 0, 0]);

        // Right side of the cube
        allverts = allverts.concat([0, 0, 1, 1, 1, 1, 1, 0, 1]);
        allverts = allverts.concat([0, 0, 1, 0, 1, 1, 1, 1, 1]);
    
        // Draw all sides of the cube
        drawTriangle3D(allverts);
    }

    renderfaster() {
        var rgba = this.color;

        // Create a buffer object
        g_vertexBuffer = gl.createBuffer();
        if (!g_vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

        // Initialize the buffer with empty data
        gl.bufferData(gl.ARRAY_BUFFER, 1, gl.DYNAMIC_DRAW);

        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // Pass the texture number
        gl.uniform1i(u_whichTexture, -2);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw the 12 triangles that make up a cube
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}