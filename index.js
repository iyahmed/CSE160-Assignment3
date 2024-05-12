// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;


// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
      
      if (u_whichTexture == -2) {             // Use color
        gl_FragColor = u_FragColor;

      } else if (u_whichTexture == -1) {      // Use UV debug color
        gl_FragColor = vec4(v_UV,1.0,1.0);

      } else if (u_whichTexture == 0) {       // Use texture0
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      
      } else if (u_whichTexture == 1) {       // Use texture1
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      
      } else {                                // Error, put Reddish
        gl_FragColor = vec4(1,.2,.2,1);
      }
  }`


// Globals for the WebGL setup
let canvas, gl, a_Position, a_UV, u_FragColor, u_Size, u_ModelMatrix, u_ProjectionMatrix, u_ViewMatrix, u_GlobalRotateMatrix, u_Sampler0, u_Sampler1, u_whichTexture;
// Global for the global sideways camera angle
let g_globalAngle = 0;
// Globals for the performance calculation
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var fps = 60;
var fpsDelta = 1000 / fps;
var previous = performance.now();
var start;
// Globals for the perspective camera
var g_camera = new Camera();
var g_eye = g_camera.eye.elements;
var g_at = g_camera.at.elements;
var g_up = g_camera.up.elements;
var rotateDelta = -0.2; // In degrees
// Global for the renderScene() function
var g_shapesList = [];
var projMat = new Matrix4();
// Global for map walls
var g_map = [
  // For 32 x 32
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
   1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
   1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
   1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
   1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Halfway through 32 x 32
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0,
   1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
   1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1,
   1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
   1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1,
   1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
   1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
   0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
  [0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1,
   0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0],
// For 8 x 8
//   [1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 1, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
// Adding these values will cause lag
//   [1, 0, 1, 0, 1, 0, 1, 1],
//   [1, 0, 0, 1, 1, 1, 0, 1],
//   [1, 1, 1, 0, 0, 0, 0, 1],
//   [1, 0, 0, 1, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 1, 1, 1],
//   [1, 1, 0, 0, 0, 0, 1, 1],
//   [0, 0, 0, 1, 1, 0, 0, 0],
//   [1, 0, 0, 1, 1, 0, 0, 1],
];


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}


function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  
  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  
  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  
  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }
  
  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }
  
  // Get the storage location of u_Sampler
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Set an initial value for the matrix to identify
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


// Set up actions for the HTMl UI elements
function addActionsForHTMLUI() {
  // Angle Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderScene(); });
}


function initTextures(gl, n) {
  // Create the image objects
  var image0 = new Image();  // Create the image object for texture 0
  if (!image0) {
    console.log('Failed to create the image0 object');
    return false;
  }
  var image1 = new Image();  // Create the image object for texture 1
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }

  // Load all the images for the textures async
  image0.onload = function () {
    sendImageToTEXTURE0(image0);
    image1.onload = function () {
      sendImageToTEXTURE1(image1);
    };
    image1.src = 'pinkflower.jpg';
  };
  image0.src = 'sky.jpg';

  return true;
}


function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log("Finished loading the texture for TEXTURE0");
}


function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit1
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  console.log("Finished loading the texture for TEXTURE1");
}


function main() {
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader progress and other GLSL variables 
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  document.onkeydown = keydown;

  // For mouse movements
  // Mouse movement constants
  let dragging = false;
  let lastX = -1;
  let lastY = -1;
  let theta = 0;
  let phi = Math.PI / 2; // Default value avoids the viewpoint jumping to the top by default
  // Dragging the mouse
  canvas.addEventListener('mousedown', (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });
  // Letting go of the mouse
  canvas.addEventListener('mouseup', () => {
    dragging = false;
  })
  // Moving the mouse
  canvas.addEventListener('mousemove', (event) => {
    if (dragging) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      theta -= deltaX * 0.005; // Mouse sensitivity
      phi -= deltaY * 0.005; // Mouse sensitivity

      g_camera.updateCamera(theta, phi);
      gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);
      // renderScene();
    }
    lastX = event.clientX;
    lastY = event.clientY;
  });

  // Call the texture helper functions
  initTextures(gl, 0);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Render scene
  start = previous;
  renderScene();
  requestAnimationFrame(tick);
}



// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);

  // Caps the FPS to 60
  var current = performance.now();
  var delta = current - previous;
  if (delta > fpsDelta) {
    previous = current - (delta % fpsDelta);

    // Draw everything
    renderScene();
  }
}


function keydown(ev) {
  if (ev.keyCode === 68) { // Moving right with the "D" key
   g_camera.right();
  } else {
    if (ev.keyCode === 65) { // Moving left with the "A" key
      g_camera.left();
    } else {
      if (ev.keyCode === 87) { // Moving forward with the "W" key
        g_camera.forward();
      } else {
        if (ev.keyCode === 83) { // Moving backward with the "S" key
          g_camera.back();
        } else if (ev.keyCode === 81) { // Turning the camera left with the "Q" key
          g_camera.panLeft();
        } else if (ev.keyCode === 69) { // Turing the camera right with the "R" key
          g_camera.panRight();
        }
      }
    }
  }

  renderScene();
  console.log(ev.keyCode);
}


function drawMap() { // TODO: Extend this to 32 x 32
  // Double loop for initial map wall draw
  // TODO: Add collision detection by preventing the camera from moving where there is a wall
  var body = new Cube();
  body.textureNum = -2;
  body.color = [0.8, 1, 1, 1];
  body.matrix.translate(0, -0.75, 0);
  body.matrix.scale(0.3, 0.3, 0.3);
  for (x = 0; x < 32; x++) {
    for (z = 0; z < 32; z++) {
      // console.log("MAP X: ", x);
      // console.log("MAP Z: ", z);

      if (g_map[x][z] === 1) {
        if (x >= 16 && z >= 16) {
          body.matrix.translate(x % 1.25, 0.05, z % 1.25);
        } else {
          body.matrix.translate(-x % 1.25, 0.05, -z % 1.25);
        }
      }

      // if (x * z >= 32) {
      //   body.matrix.translate(x % 128, 0, z % 128);
      // } else {
      //   body.matrix.translate(-x % 128, 0, -z % 128);
      // }

      // if (x * z >= 8) { // For 8 x 8
      //   body.matrix.translate(x % 4, 0, z % 4);
      // } else {
      //   body.matrix.translate(-x % 4, 0, -z % 4);
      // }
      body.renderfaster(); // TODO: Fix Cube.renderfast()
    }
  }
}


function renderScene() {
  // Check the time at the start of the function
  var startTime = performance.now();

  // Pass the projection matrix (not needed in the renderScene())
  // var projMat = new Matrix4();
  projMat.setIdentity();
  projMat.setPerspective(50, 1 * canvas.width / canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2],
  ); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to the u_ModelMatrix attribute
  var cameraRotMat = new Matrix4().rotate(rotateDelta, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, cameraRotMat.elements);

  // Pass the matrix to the u_GlobalRotateMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
 
  // Draw the map's wall cubes
  drawMap();

  // Draw the ground cube
  var ground = new Cube(); // Creating the ground as a large rectangle
  ground.color = [0, 1, 0, 1]; // Color the ground green
  ground.textureNum = -2; // Use the colors on the ground
  ground.matrix.translate(0, -0.75, 0.0); // Y placement for the ground
  ground.matrix.scale(32, 0.0001, 32); // Scaling for the ground
  ground.matrix.translate(-0.5, 0, -0.5); // X and Z placement for the ground
  ground.render(); // Rendering for the ground

  // Draw the sky cube
  var sky = new Cube(); // Creating the sky as a large rectangle
  sky.color = [0, 0, 1, 1]; // Color the sky blue
  sky.textureNum = 0; // Use the texture0 on the sky
  sky.matrix.scale(100, 100, 100); // Scaling for the sky
  sky.matrix.translate(-0.5, -0.5, -0.5); // X, Y, and Z placement for the sky
  sky.render(); // Rendering for the sky

  // Draw the head cube
  var head = new Cube(); // Creating the head as a small rectangle
  head.textureNum = 0; // Use the texture0 on the head
  head.matrix.translate(-0.25, 0.5, 0.175); // X, Y, and Z placements for the head
  head.matrix.scale(0.3, 0.3, 0.3); // Scaling for the head
  head.render(); // Rendering for the head
 
  // Draw the foot cube
  var foot = new Cube(); // Creating the foot as a small rectangle
  foot.textureNum = 0; // Use the texture0 on the foot
  foot.matrix.translate(-0.425, -0.65, 0); // X and Y placements for the foot
  foot.matrix.scale(.7, .5, .7); // Scaling for the foot
  foot.render(); // Rendering for the foot

  // Draw the body cube
  var body = new Cube(); // Creating the body as a small rectangle
  body.textureNum = 1; // Use the texture1 on the body
  body.matrix.translate(-0.25, -0.15, 0.0); // X and Y placements for the body
  body.matrix.scale(0.3, 0.65, 0.65); // Scaling for the body
  body.render(); // Rendering for the body
  
  // Draw the arm cube
  var arm = new Cube(); // Creating the arm as a small rectangle
  arm.color = [1, 1, 0, 1]; // Color the arm yellow
  arm.textureNum = -2; // Use the colors on the arm
  arm.matrix.translate(-0.15, 0.3, 0); // X and Y placements for the arm
  arm.matrix.scale(1.15, 0.1, 1.15); // Scaling for the arm
  arm.render(); // Rendering for the arm

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration), "numdot");
}


// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get: " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}