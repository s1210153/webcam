function MovingAverage(length) {
	// Max length
	this.m = length;

	// Array of measurement
	this.p = [];
}

MovingAverage.prototype.setavg = function(x) {
	this.m = x;
	console.log('updata '+ this.m );
}


MovingAverage.prototype.update = function(x) {
	this.p.push(x);
	//console.log('updata '+ this.m );
	if (this.p.length > this.m) {
		this.p.splice(0, this.p.length - this.m);	
	}
}


MovingAverage.prototype.get = function() {
	var s = 0.0;
	for (var i in this.p) {
		s += this.p[i];
	}				
	return (s / this.p.length);
}


function MotionDetector() {
	//TODO experiment with these values
	// try to increase as long as the program is responsive
	var PIXELS_HORIZONTAL = 64;
	var PIXELS_VERTICAL = 40;
	

	// assign global variables to HTML elements
	var video;
	this.videoCanvas = document.createElement( 'canvas' );
	this.videoCanvas.width = PIXELS_HORIZONTAL;
	this.videoCanvas.height = PIXELS_VERTICAL;

	var videoContext = this.videoCanvas.getContext( '2d' );
	
	var layer2Canvas = document.createElement( 'canvas' );
	layer2Canvas.width = PIXELS_HORIZONTAL;
	layer2Canvas.height = PIXELS_VERTICAL;
	var layer2Context = layer2Canvas.getContext( '2d' );
	
	var blendCanvas  = document.createElement( 'canvas' );
	var blendContext = blendCanvas.getContext('2d');
	
	var blendedData;

	var motionDetector;


	var lastImageData;

	////
	var FizzyText = function() {
　　　this.message = 'dat.gui';
  　　this.average = 300;
  　　this.displayOutline = false;
  　　//this.explode = function() { ... };
  　　// Define render logic ...
　　};
	
	var text;	
	var avg=300;
　　
　　
　　////
　　/*
　　function setValue(){
　　	var t = text.average;
　　	
		avg = text.average;
		console.log(avg);
　　};
	*/
	console.log(avg);
	// 300 is too big; try to decrease it
	this.avgX = new MovingAverage(avg);
	this.avgY = new MovingAverage(avg);

	// initially our object will be centered
	this.avgX.update(PIXELS_HORIZONTAL/2);
	this.avgY.update(PIXELS_VERTICAL/2);
	
	window.onload = function() {
 　　　var _that = this;
 　　　text = new FizzyText();
 　　　　 var gui = new dat.GUI();
 　　　　 gui.add(text, 'message');
　　　 gui.add(text, 'average', 1, 300).onChange(function(){
　　　 	var t = text.average;
　　　 	_that.avg = t;
　　　 });
 　　　　 gui.add(text, 'displayOutline');
　　}; 
	
	
	MotionDetector.prototype.init = function() {
		motionDetector = this;

		navigator.getUserMedia = navigator.getUserMedia 
				      || navigator.webkitGetUserMedia 
				      || navigator.mozGetUserMedia;
		window.URL = window.URL || window.webkitURL;

		////video = document.createElement('video');
		video = document.getElementById('video');
		
		if (!navigator.getUserMedia) {
			console.log("video not available");
		}

		function gotStream(stream) {
			if (window.URL) 
			{   video.src = window.URL.createObjectURL(stream);   } 
			else // Opera
			{   video.src = stream;   }
			
			video.onerror = function(e) 
			{   stream.stop();   };

			stream.onended = noStream;
		}

		function noStream(e) {
			var msg = 'No camera available.';
			if (e.code == 1) 
			{   msg = 'User denied access to use camera.';   }
			console.log(msg);
		}
		
		navigator.getUserMedia({video: true}, gotStream, noStream);
		
		motionDetector.start();
	}


	MotionDetector.prototype.analyze = function() {
		//console.log('analyze');
		if(window.avg){
			this.avgX.setavg(window.avg);
　　　 		this.avgY.setavg(window.avg);
		}
		var width  = this.videoCanvas.width;
		var height = this.videoCanvas.height;

		videoContext.drawImage( video, 0, 0, this.videoCanvas.width, this.videoCanvas.height );



        ////
        /*
        for ( var i = 0; i < buttons.length; i++ ) {
	        layer2Context.drawImage( buttons[i].image, buttons[i].x, buttons[i].y, buttons[i].w, buttons[i].h );
		} 
        */



		// get current webcam image data
		var sourceData = videoContext.getImageData(0, 0, width, height);

		// create an image if the previous image does not exist
		if (!lastImageData) lastImageData = videoContext.getImageData(0, 0, width, height);

		// create a ImageData instance to receive the blended result
		blendedData = videoContext.createImageData(width, height);

		// blend the 2 images
		differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);

		// store the current webcam image
		lastImageData = sourceData;

		this.getCoord();

		var _that = this;
		setTimeout(function() {
			_that.analyze();
		}, 20);
	}


	function differenceAccuracy(target, data1, data2) {
		if (data1.length != data2.length) return null;
		var i = 0;
		while (i < (data1.length * 0.25)) {
			var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
			var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
			var diff = threshold(fastAbs(average1 - average2));
			target[4*i]   = diff;
			target[4*i+1] = diff;
			target[4*i+2] = diff;
			target[4*i+3] = 0xFF;
		    ++i;
		}
	}

	
	function fastAbs(value) 
	{
		return (value ^ (value >> 31)) - (value >> 31);
	}
	
	
	function threshold(value) 
	{
		return (value > 0x15) ? 0xFF : 0;
	}
	
	
	MotionDetector.prototype.getCoord = function() {
		var pix_vertical = 40;
		var pix_horizontal = 64;

		// first compute the centroid
		// then smooth the centroid with moving average
		var centroidX = 0.0;
		var centroidY = 0.0;
		var sum = 0;
		
		for (var y = 0; y < pix_vertical; y++) {
			for (var x = 0; x < pix_horizontal; x++) {
				
				if (blendedData.data) {
					var r = blendedData.data[x*4 + y*pix_horizontal*4];
					var g = blendedData.data[x*4 + y*pix_horizontal*4+1];
					var b = blendedData.data[x*4 + y*pix_horizontal*4+2];
					
					if (r > 128) {
						//console.log('add');
						//console.log('x: ' + x);
						//console.log('y: ' + y);
						
						//this.avgX.update(x);
						//this.avgY.update(y);
						
						centroidX = centroidX + x;
						centroidY = centroidY + y;
						sum = sum + 1;
					}
				}
			}
		}

	    if (sum > 0) {
		centroidX = centroidX / sum;
		centroidY = centroidY / sum;

	    	//console.log('X: ' + centroidX);
	    	//console.log('Y: ' + centroidY);

		// smooth with moving average
		this.avgX.update(centroidX);
		this.avgY.update(centroidY);
	    }

	}


	MotionDetector.prototype.start = function() {
		video.play();
		this.analyze();
	}
	
}

