var g_scene;
var g_camera, g_scene, g_renderer;
var g_mesh;
var g_motionDetector;

var buttons = [];////


function init() {
	g_scene = new THREE.Scene();
	var container = document.getElementById('drawingArea');
	var height = window.innerHeight;
	var width = window.innerWidth;
	g_camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
	g_scene.add(g_camera);

	g_renderer = new THREE.WebGLRenderer({
		alpha : true,
		antialias : true
	});
	g_renderer.shadowMap.enabled = true;
	//g_renderer.setClearColor(0x7ec0ee, 1);  ////
	container.appendChild(g_renderer.domElement);


	// webcam motion detection
	g_motionDetector = new MotionDetector();
	g_motionDetector.init();


	g_camera.position.set(0, 150, 500);
	g_camera.lookAt(0, 150, 0);


	var resizeCallback = function() {
		var panelWidth = window.innerWidth;
		var panelHeight = window.innerHeight;

		var devicePixelRatio = window.devicePixelRatio || 1;
		g_renderer.setSize(panelWidth * devicePixelRatio, panelHeight * devicePixelRatio);
		g_renderer.domElement.style.width = panelWidth + 'px';
		g_renderer.domElement.style.height = panelHeight + 'px';
		g_camera.aspect = panelWidth / panelHeight;
		g_camera.updateProjectionMatrix();
	};

	window.addEventListener('resize', resizeCallback, false);
	resizeCallback();

	createLights();
	createFloor();
	createMesh();
	
	createImage();////
	
}


function createLights() {
	var hemiLight = new THREE.HemisphereLight(0xffffff, 0x101010, 0.9);
	g_scene.add(hemiLight);

	var ambLight = new THREE.AmbientLight(0x2f2f2f);
	g_scene.add(ambLight);

	var dirLight = new THREE.DirectionalLight(0xffffff, 0.30);
	dirLight.position.set(300, 600, 500);
	dirLight.castShadow = true;
	dirLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera());
	g_scene.add(dirLight);
}


function createFloor() {
	var groundGeo = new THREE.PlaneBufferGeometry(10000,10000);
	var groundMat = new THREE.MeshPhongMaterial({
		color : 0xd3d3d3,
		specular : 0xd3d3d3
	});

	var ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -45;
	ground.receiveShadow = true;
	g_scene.add(ground);
}


function createMesh() {
	g_mesh = new Mesh(g_scene);
}


function animate() {
	// look for pos as: a + b * mov_avg
	var posx = g_motionDetector.avgX.get();
	var posy = g_motionDetector.avgY.get();
	g_mesh.update(posx, posy);

	//console.log(pos_x, pos_y);

	// Render scene
	requestAnimationFrame(animate);
	g_renderer.render(g_scene, g_camera);
}


////
function createImage() {
	
	var button1 = new Image();
	button1.src ="Image/SquareRed.png";
	var buttonData1 = { name:"red", image:button1, x:10, y:20, w:32, h:32 };
	buttons.push( buttonData1 );
	
	var button2 = new Image();
	button2.src ="Image/SquareGreen.png";
	var buttonData2 = { name:"green", image:button2, x:320 - 64 - 20, y:10, w:32, h:32 };
	buttons.push( buttonData2 );
	
	var button3 = new Image();
	button1.src ="Image/SquareBlue.png";
	var buttonData3 = { name:"blue", image:button3, x:320 - 32 - 10, y:10, w:32, h:32 };
	buttons.push( buttonData3 );
	
}