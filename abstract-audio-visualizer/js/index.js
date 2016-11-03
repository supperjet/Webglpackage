/*
 * Copyright MIT © <2013> <Francesco Trillini>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var self = window;

(function(self) {	
	
	var container, scene, camera, renderer, stats, cubes = [], mouse = { x: 0, y: 0 }, group, material = 0, particles, uniforms, mouseDown = start = play = false, lastTransition = Date.now();
			
	// Mouse wheel and leap settings		
	var cameraZ = 3000, min = cameraZ - 500, max = min * 3;
			
	// Audio data			
	var context, buffer, source, stream, analyser, frequency = [], playButton, createObjectURL, codec = ['.ogg', '.mp3'], mimeType = ['audio/ogg', 'audio/mpeg'], URL = 'http://francescotrillini.it/assets/Soundwaves_Remix';		
				
	// Dat GUI default value
	var showStats = false;			
			
	/*
	 * List colors.
	 */
		
	var colors = {
		
		lightRed: [
			
			'#ffffff',
			'#e50000'
			
		],
		
		lightViolet: [
			
			'#ffffff',
			'#ee82ee'
						
		],
		
		lightBlue: [
		
			'#ffffff',
			'#00bcff'
		
		]
	
	};
	
	/*
	 * Settings.
	 */
		
	var Settings = function() {
			
		this.showStats = false;
		
		this.enableStats = function(value) {
			
			showStats = value;
			
			showStats ? stats.domElement.style.visibility = 'visible' : stats.domElement.style.visibility = 'hidden';
			
		};
		
		this.fullScreen = function() {
		
			var container, fullscreen;

			container = document.documentElement;
			fullscreen = (container.webkitRequestFullscreen || container.mozRequestFullScreen || container.msRequestFullscreen || container.requestFullscreen);

			fullscreen.call(document.documentElement);
			
		};
					
	};	
	
	window.addEventListener ? window.addEventListener('load', init, false) : window.onload = init;
	
    /*
	 * Init.
	 */

	function init() {
		
		if(!window.WebGLRenderingContext) { 
				
			console.error("Sorry, your browser doesn't support WebGL."); 
					
			return; 
					
		} 
				
		initAudio();		
				
		var settings = new Settings();
		var GUI = new dat.GUI();
						
		// Dat GUI main
		GUI.add(settings, 'showStats').onChange(settings.enableStats);
		GUI.add(settings, 'fullScreen');
		  
		var body = document.querySelector('body');
	
		container = document.createElement('div');
		
		container.width = innerWidth;
		container.height = innerHeight;
		
		container.style.position = 'absolute';
		container.style.top = 0;
		container.style.bottom = 0;
		container.style.left = 0;
		container.style.right = 0;
		container.style.zIndex = -1;
		container.style.overflow = 'hidden';
    
		container.style.background = '-webkit-radial-gradient(#ffcc99, #ff9933)';
		container.style.background = '-moz-radial-gradient(#ffcc99, #ff9933)';
		container.style.background = '-ms-radial-gradient(#ffcc99, #ff9933)';
		container.style.background = '-o-radial-gradient(#ffcc99, #ff9933)';
		container.style.background = 'radial-gradient(#ffcc99, #ff9933)';
			
		body.appendChild(container);
		
		// Setup
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.z = cameraZ;
		
		scene = new THREE.Scene();
		
		// Lights
		hemisphereLight = new THREE.HemisphereLight(0xffffff, 100);
		scene.add(hemisphereLight);
		
		pointLight = new THREE.PointLight(0xffffff, 3.0);
		scene.add(pointLight);
		
		group = new THREE.Object3D();
	
		for(var cube = 0, len = 80; cube < len; cube++) {
			
			var redMaterial = new THREE.MeshPhongMaterial({
					
				color: colors.lightRed[cube % colors.lightRed.length],	
					
				shading: THREE.FlatShading, 
				blending: THREE.NormalBlending, 
				
				depthTest: true,
				transparent: false
						
			});
																			
			var violetMaterial = new THREE.MeshPhongMaterial({

				color: colors.lightViolet[cube % colors.lightViolet.length], 
						
				shading: THREE.FlatShading, 
				blending: THREE.NormalBlending, 
				
				depthTest: true,
				transparent: false
						
			});
			
			var blueMaterial = new THREE.MeshPhongMaterial({

				color: colors.lightBlue[cube % colors.lightBlue.length], 
						
				shading: THREE.FlatShading, 
				blending: THREE.NormalBlending, 
				
				depthTest: true,
				transparent: false		
						
			});
						
			var geometry = new THREE.TetrahedronGeometry(50, 1);
			geometry.dynamic = true;
			
			var mesh = new THREE.Mesh(geometry, violetMaterial);
					
			mesh.position.x = Math.random() * 2000 - 1000;
			mesh.position.y = Math.random() * 2000 - 1000;
			mesh.position.z = Math.random() * 2000 - 1000;
			mesh.rotation.x = Math.random() * 2 * Math.PI;
			mesh.rotation.y = Math.random() * 2 * Math.PI;
			mesh.rotation.z = Math.random() * 2 * Math.PI;
										
			cubes.push({
					
				mesh: mesh,	
				
				materials: [
						
					redMaterial,	
					violetMaterial,	
					blueMaterial
					
				],		
				
				band: Math.floor(Math.random(128)),
				scale: 0,
				level: ~~(Math.random() * (7 - 2 + 1) + 2)
					
			});
			
			group.add(mesh);

		}

		scene.add(group);
		
		// Init particles and mesh
		loadParticles();
		updateTransitions(0);
		changeMaterial(~~(Math.random() * 3));

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		
		container.appendChild(renderer.domElement);

		// Stats
		stats = new Stats();
		
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		
		container.appendChild(stats.domElement);
		
		// Hide stats
		settings.enableStats();
		
		// Listeners
		container.addEventListener('mousedown', onMouseDown, false);
		container.addEventListener('touchstart', onTouchStart, false);
	
		document.addEventListener('drop', onDrop, false);
		document.addEventListener('dragover', onDragOver, false);
		
		document.addEventListener('mousewheel', onMouseWheel, false );
		document.addEventListener('DOMMouseScroll', onMouseWheel, false);

		playButton = document.querySelector('.play');	
		playButton.addEventListener('click', onClick, false);
		
		enableLeap();
		render();
	
		window.onresize = onResize;

	}
	
	/*
	 * Mouse down event.
	 */

	function onMouseDown(event) {

		event.preventDefault();

		if(play)
		
			changeMaterial();
		
	}
	
	/*
	 * Touch start event.
	 */

	function onTouchStart(event) {

		event.preventDefault();

		if(play)
		
			changeMaterial();
		
	}
	
	/*
	 * On drag over event.
 	 */
	
	function onDragOver(event) {
	
		event.stopPropagation();
		event.preventDefault();
		
		return false;
		
	}
	
	/*
	 * On drop event.
 	 */
	 
	function onDrop(event) {
	
		event.stopPropagation();
		event.preventDefault();
			
		// Read data as URL
		loadAudio(createObjectURL(event.dataTransfer.files[0]));
		
	}
	
	/*
	 * On mouse wheel event.
	 */
	
	function onMouseWheel(event) {
		
		if(cameraZ < min || cameraZ > max) 
		
			cameraZ = THREE.Math.clamp(cameraZ, min, max);
	
		// WebKit
		if(play && event.wheelDeltaY)
					
			cameraZ -=event.wheelDeltaY * 2;
		
		// Opera / Explorer 9
		else if(play && event.wheelDelta)
		
			cameraZ -= event.wheelDelta * 2;

		// Firefox
		else if(play && event.detail) 

			cameraZ -= event.detail * 2;
	
	}
	
	/*
	 * On click event.
	 */
	
	function onClick(event) {
							
		var triggeredEvent = event !== null ? this : playButton;
			
		document.querySelector('body').removeChild(triggeredEvent);
				
		connectSource();		
				
		if(source !== undefined) {
		
			play = true;
					
			container.style.cursor = 'pointer';
					
			source.play();
		
		}		
			
	}
	
	/*
	 * Enable leap device if detected.
	 */
	
	function enableLeap() {
	
		var controller = new Leap.Controller({ enableGestures: true });
		
		controller.on('frame', function(data) {
					
			if(cameraZ < min || cameraZ > max) 
		
				cameraZ = THREE.Math.clamp(cameraZ, min, max);	
				
			// Palm position	
			if(data.hands.length > 0) {
		                   
				var hand = data.hands[0];
		                   	
				cameraZ += ~~(-hand.palmPosition[2]);
				 	
		    }
			
			for(var i = 0; i < data.gestures.length; i++) {
			  
				var gesture = data.gestures[i];
				
		        var type = gesture.type;
		        
				switch(type) {
		        
		          	case 'screenTap':
				  
						!play ? onClick(null) : changeMaterial();
				  				
				  		break;
				  				
		        }
		
		    }
		
		});
		    	
		// Connect controller		
		controller.connect();
	
	}

	/*
	 * On resize event.
	 */

	function onResize(event) {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
    
		renderer.setSize(window.innerWidth, window.innerHeight);

	}
	
	/*
	 * Init audio from a source.
	 */
	
	function initAudio() {
		
		createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function(){};
		
		if(!typeof document.createElement('audio').canPlayType === 'function') {
		
			console.error("Sorry, your browser doesn't support Web Audio API."); 
		
			return;
		
		}
		
		context = new (window.AudioContext || window.webkitAudioContext)();
		
		source = document.createElement('audio');		
		
		for(var fallback = 0; fallback < (source.canPlayType('audio/mpeg') === '' ? 1 : 2); fallback++)
		 
			new Audio(fallback);
	
	}
	
	/*
	 * Create an audio object from an AJAX stream.
     */
 
	function Audio(fallback) {
    
		var request = new XMLHttpRequest();
				
		request.open('GET', URL + codec[fallback], true);
		request.responseType = 'blob';
		
		request.onload = function(event) {
	
			if(this.readyState === 4 && this.status === 200) {
			
				stream = document.createElement('source');
				
				stream.src = createObjectURL(this.response);
				stream.type = mimeType[fallback];
		
				source.appendChild(stream);
				
			}
			
		};
		
		request.send();
    
	}
	
	/*
	 * Load audio from a source (drag & drop).
	 */
	
	function loadAudio(data) {
		
		var streams = source.childNodes.length;
		
		while(streams--)
		
			// Manually disconnect the source
			source.removeChild(source.childNodes[streams]);
		
        stream.src = data;			
		
		source.appendChild(stream);		
	
	}
	
	/*
	 * Connect the source to analyzer.
	 */
	
	function connectSource() {
		
		buffer = context.createMediaElementSource(source);
		
		analyser = context.createAnalyser();
				
		// Fast smoothing
		analyser.smoothingTimeConstant = 0.3;
		analyser.fftSize = 512;
		
		buffer.connect(analyser);
		analyser.connect(context.destination);
		
		frequency = new Uint8Array(analyser.frequencyBinCount);
						
	}
	
	/*
	 * Load the particles.
	 */
	
	function loadParticles() {
		
		// See: https://github.com/mrdoob/three.js/issues/687
		THREE.ImageUtils.crossOrigin = '';
						
		var texture = THREE.ImageUtils.loadTexture('http://francescotrillini.it/assets/particle.png');
		
		var attributes = {
		
			size: { type: 'f', value: [] }
					
		};
		
		uniforms = {
		
			color: { type: 'c', value: new THREE.Color(0x454545) },
			texture: { type: 't', value: texture },
			bass: {type: 'f', value: 0.0 },
			opacity: { type: 'f', value: 0.0 },
		
		};
		
		var shaderMaterial = new THREE.ShaderMaterial( {
		
			uniforms: uniforms,
			attributes: attributes,
			
			vertexShader: document.getElementById('vertex').textContent,
			fragmentShader: document.getElementById('fragment').textContent,
		
			blending: THREE.AdditiveBlending,
			transparent: true,
							
		});
		
		var geometry = new THREE.Geometry();
		geometry.verticesNeedUpdate = true;
				
		// Position
		for(particle = 0, len = 100; particle < len; particle++) 
							
			geometry.vertices.push(new THREE.Vector3(Math.random() * 10000 - 5000, Math.random() * 10000 - 5000, Math.random() * 10000 - 5000));
					
		// Size
		for(var index = 0, len = geometry.vertices.length; index < len; index++)
							
			attributes.size.value[index] = 100 + Math.random() * 100;
		
		particles = new THREE.PointCloud(geometry, shaderMaterial);
		scene.add(particles);
	
	}
	
	/*
	 * Change the current material with the next one.
	 */
	
	function changeMaterial(seed) {
	
		var cube = cubes.length;
		
		material += (seed !== undefined ? seed : 1);	
			
		while(cube--) {
			
			var object = cubes[cube];
			
			object.mesh.material = object.materials[material % object.materials.length];
			
		}
	
	}
	
	/*
	 * Update the transitions (position, rotation).
	 */
	
	function updateTransitions(schedule) {
		
		var size = schedule;
		
		// Random size before play
		if(size === 0) {
		
			var cube = cubes.length;
	
			while(cube--) {
				
				var object = cubes[cube];
				
				new TWEEN.Tween(object.mesh.scale).to({

					x: object.level / 1.35,
					y: object.level / 1.35,
					z: object.level / 1.35 
						
				}, 500).start();

			}
		
		}
		
		// Change position and rotation every two secs
		if((Date.now() - lastTransition > 0 && Date.now() - lastTransition < 1000 && start) || schedule !== undefined) {
		
			start = false;
			
			var cube = cubes.length;
			
			while(cube--) {
		
				var object = cubes[cube];
				
				// Random position
				new TWEEN.Tween(object.mesh.position).to({

					x: Math.random() * 2000 - 1000,
					y: Math.random() * 2000 - 1000,
					z: Math.random() * 2000 - 1000 
						
				}, 3000).start();
					
				// Random rotation				
				new TWEEN.Tween(object.mesh.rotation).to({
				
					x: Math.random() * 2 * Math.PI,
					y: Math.random() * 2 * Math.PI,
					z: Math.random() * 2 * Math.PI 
						
				}, 3000).start();

			}
		
		}
		
		// Reset 'em all
		if(Date.now() - lastTransition > 2000) {
		
			lastTransition = Date.now();
			
			start = true;
			
		}
		
	}

	/*
	 * Render the animation.
	 */

	function render() {

		requestAnimationFrame(render);	
					
		updateTransitions();
		TWEEN.update();
		
		if(!play) {	
			
			group.rotation.x += 0.006;
			group.rotation.y += 0.006;
			
		}
					 
		if(play && frequency.length > 0) {
					
			// Zoom		
			camera.position.z += (THREE.Math.clamp(cameraZ, min, max) - camera.position.z) * 0.1;
			
			var cube = cubes.length;
			
			while(cube--) {
				
				var object = cubes[cube];
	   
				var currentLevel, band, rotation;
				
				// Frequency
				currentLevel = (frequency[object.band] / 256) * object.level;
				band = currentLevel < 1 ? 1 : currentLevel;
			
				object.scale += (band - object.scale) * 0.2;
								
				group.rotation.x += object.scale * 0.00012;
				group.rotation.y += object.scale * 0.00012;
				
				particles.rotation.copy(group.rotation);
				
				particles.rotation.x *= 0.4;
				particles.rotation.y *= 0.4;
				
				uniforms.bass.value += (object.scale / 2.7 - uniforms.bass.value) * 0.5;
				uniforms.opacity.value = Math.max(0.0, currentLevel / Math.min(12, currentLevel));
				
				// Scale fov						
				camera.fov += (75 - object.scale * 3 - camera.fov) * 0.008;
				camera.updateProjectionMatrix();
				
			}
			
			analyser.getByteFrequencyData(frequency);

		}
		
		camera.lookAt(scene.position);
						
		stats.update();
										
		renderer.render(scene, camera);
		
	}

})(self);