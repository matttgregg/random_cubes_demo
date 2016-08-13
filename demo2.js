
var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

var colList = [0x0000ff, 0x0010bb, 0x01aaaa, 0x22aaff];

var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container;


window.addEventListener('load', init, false);

function init() {
	// set up the scene, the camera and the renderer
	createScene();

	// add the lights
	createLights();

	// add the objects
	//createPlane();
	//createSea();
	createSky();

	// start a loop that will update the objects' positions
	// and render the scene on each frame
	loop();
}

function createScene() {
	// Get the width and the height of the screen,
	// use them to set up the aspect ratio of the camera
	// and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene
	scene = new THREE.Scene();

	// Add a fog effect to the scene; same color as the
	// background color used in the style sheet
	scene.fog = new THREE.Fog(0x342929, 1000, 2000);

	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 90;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);

	// Set the position of the camera
	camera.position.x = 0;
	camera.position.z = 1000;
	camera.position.y = 100;

	// Create the renderer
	renderer = new THREE.WebGLRenderer({
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true,

		// Activate the anti-aliasing; this is less performant,
		// but, as our project is low-poly based, it should be fine :)
		antialias: true
	});

	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setSize(WIDTH, HEIGHT);

	// Enable shadow rendering
	renderer.shadowMap.enabled = true;

	// Add the DOM element of the renderer to the
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

Cloud = function(){
	// Create an empty container that will hold the different parts of the cloud
	this.mesh = new THREE.Object3D();

	this.cycleSpeed = 0.5+Math.random();

	// create a cube geometry;
	// this shape will be duplicated to create the cloud
	var geom = new THREE.BoxGeometry(20,20,20);

	// create a material; a simple white material will do the trick
	var mat = new THREE.MeshPhongMaterial({
		color:colList[Math.floor(Math.random() * 4)],
    //color:Colors.red,
	});

	// duplicate the geometry a random number of times
	var nBlocs = 3+Math.floor(Math.random()*3);
	for (var i=0; i<nBlocs; i++ ){

		// create the mesh by cloning the geometry
		var m = new THREE.Mesh(geom, mat);

		// set the position and the rotation of each cube randomly
		m.position.x = i*15;
		m.position.y = Math.random()*10;
		m.position.z = Math.random()*10;
		m.rotation.z = Math.random()*Math.PI*2;
		m.rotation.y = Math.random()*Math.PI*2;

		// set the size of the cube randomly
		var s = .1 + Math.random()*2.9;
		m.scale.set(s,s,s);

		// allow each cube to cast and to receive shadows
		m.castShadow = true;
		m.receiveShadow = true;

		// add the cube to the container we first created
		this.mesh.add(m);
	}
}

// Create sky, with some number of clouds
Sky = function(cloudCount, speedFactor){
  this.mesh = new THREE.Object3D();
  this.nClouds = cloudCount;
  this.clouds = [];
  this.speeds = []
  var stepAngle = Math.PI*2 / this.nClouds;
  for(var i=0; i<this.nClouds; i++){
    var c = new Cloud();
    this.clouds.push(c);
    this.speeds.push(speedFactor*(Math.random()*50 - 10));
    var a = stepAngle*i;
    var h = 750 + Math.random()*200;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = -400-Math.random()*400;
    c.mesh.rotation.z = a + Math.PI/2;
    var s = 1+Math.random()*2;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh);
  }
}

var sky;

function MoveClouds(delta)
{
  //sky.mesh.position.z =  Math.sin(delta)*100;
  for(var i=0; i<sky.nClouds; i++){

    // Faster clouds jump further.
		var rjump = 0.01*sky.speeds[i];

    var cloud = sky.clouds[i]
    cloud.mesh.position.x += 0.25*i*(2*(Math.cos(cloud.cycleSpeed*10*rjump*delta)) + rjump)
    if (Math.abs(cloud.mesh.position.x) > 2000) {
      cloud.mesh.position.x = 0;
    }

    cloud.mesh.position.z += sky.speeds[i];

    if (cloud.mesh.position.z < -1500) {
          sky.speeds[i] = -10-Math.random()*10;
          cloud.mesh.position.z = 1000;
    }

    if (cloud.mesh.position.z > 1000) {
      sky.speeds[i] = 5 + Math.random()*50;
      cloud.mesh.position.z = -1100-Math.random()*400;
    }
  }
}

function createSky(){
	sky = new Sky(50, 1.5);
	sky.mesh.position.y = -200;
	scene.add(sky.mesh);
}

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -800;
  shadowLight.shadow.camera.right = 800;
  shadowLight.shadow.camera.top = 800;
  shadowLight.shadow.camera.bottom = -800;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

var startTime = Date.now();

function loop(){
	// Rotate the propeller, the sea and the sky
	///airplane.propeller.rotation.x += 0.3;
	sky.mesh.rotation.z += .015;
	//sky.mesh.rotation.z += .01;

  MoveClouds((Date.now() - startTime)/200);
	// render the scene
	renderer.render(scene, camera);

	// call the loop function again
	requestAnimationFrame(loop);
}
