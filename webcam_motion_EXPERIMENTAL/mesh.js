Mesh = function(scene) {
	this.scene = scene;
	
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};
	
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};
	
	var onError = function ( xhr ) {
	};
	
	var loader = new THREE.OBJLoader(manager );
	
	loader.load( './data/bunny.obj', function( object ) {
		var mesh = object.children[0];
		var obj_geometry = mesh.geometry;
		obj_geometry.normalsNeedUpdate = true;
		obj_geometry.computeFaceNormals();
		obj_geometry.computeVertexNormals();
		obj_geometry.scale(700,700,700);
		
		mesh.castShadow = true;
		mesh.receiveShadow = true;		
		
		scene.add(mesh);
		
	}, onProgress, onError);
}


// Translate or rotate the mesh
Mesh.prototype.update = function(xt, yt) {
	// Uncomment for a rotation
	// The boundaries used in the rescaling are related to the 
	// size of the video canvas. I picked them experimentally
	//var mesh_rot_y = rescale(xt, -10, 70, -Math.PI/2, Math.PI/2);
	//var mesh_rot_x = rescale(yt, -10, 30, -Math.PI/2, Math.PI/2);
	
	// Corresponds to a translation
	var mesh_trans_x = rescale(-xt, -70, 10, -300, 300);
	var mesh_trans_y = rescale(-yt, -50, 10, -300, 300);

	if (this.scene.children[5]) {
		// hack: children[5] currently corresponds to the mesh
		// this may not always be the case in the future. Fix-it
		var mesh = this.scene.children[5];
		
		// hack: use rotateX(), Y, Z and translate() instead 
		// of accessing the fields directly
		
		// Rotation
		//mesh.rotation.y += (mesh_rot_y - mesh.rotation.y);
		//mesh.rotation.x += (mesh_rot_x - mesh.rotation.x);
		
		// Translation
		mesh.position.x += (mesh_trans_x - mesh.position.x);
		mesh.position.y += (mesh_trans_y - mesh.position.y);
	}
}


// rescale the value v from the interval [v1min, v1max]
// to the interval [v2min, v2max]
function rescale(v, v1min, v1max, v2min, v2max) {
	var val = Math.max(Math.min(v, v1max), v1min);
	var dv1 = v1max - v1min;
	var t = (val - v1min) / dv1;
	var dv2 = v2max - v2min;
	return v2min + t*dv2;
}

