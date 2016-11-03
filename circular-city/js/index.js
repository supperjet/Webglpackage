  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////
  // init renderer
  var renderer	= new THREE.WebGLRenderer({
    antialias	: false
  });
  renderer.setClearColor(new THREE.Color('#181525'), 1)
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMapEnabled = true;	
  document.body.appendChild( renderer.domElement );
  // array of functions for the rendering loop
  var onRenderFcts= [];
  // init scene and camera
  var scene	= new THREE.Scene();
  var camera	= new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 1000);

  //////////////////////////////////////////////////////////////////////////////////
  //		add an object in the scene
  //////////////////////////////////////////////////////////////////////////////////

  var step = 0;

  /* Function Returning : Random between min and max */
  var randInt = function(min,max) {
    return (~~((Math.random()*max)+min));
  }

  var light = new THREE.PointLight(0xffffff, 0.3);
	light.position.x = 0;
	light.position.y = 10;
	light.position.z = 0;
	scene.add(light);
	

	var light2 = new THREE.PointLight(0xffffff, 1);
	light2.position.x = 200;
	light2.position.y = 200;
	light2.position.z = 200;
	scene.add(light2);

	spotLight = new THREE.SpotLight(0xffffff);
	spotLight.position.set(450, 700, 450);
	spotLight.target.position = new THREE.Vector3(0,110,800);
	spotLight.intensity = 1;
	spotLight.shadowDarkness = 2;
	spotLight.castShadow = true;
	spotLight.shadowMapWidth = 32;
	spotLight.shadowMapHeight = 32;
	spotLight.shadowCameraFov = 30;
	spotLight.angle = 0.8;
	scene.add(spotLight);

  // Buildings 
	var numBuild = 60;
	var diamBuild = 50;
	var tabBuildLeft = [];
	var tabBuildRight = [];
	var tabFaces = [4,8,15];

	var normalMaterial = new THREE.MeshPhongMaterial({
  	color      :  new THREE.Color("rgb(176,64,0)"),
  	emissive   :  new THREE.Color("rgb(175,25,95)"),
  	specular   :  new THREE.Color("rgb(229,111,14)"),
		shininess  :  30,
		shading    :  THREE.FlatShading,
		transparent: 1,
		opacity    : 1
    });

  var blackMaterial = new THREE.MeshPhongMaterial({
    color      :  new THREE.Color("rgb(40,40,40)"),
  	emissive   :  new THREE.Color("rgb(20,20,20)"),
  	specular   :  new THREE.Color("rgb(160,160,160)"),
		shininess  :  30,
		shading    :  THREE.FlatShading,
		transparent: 1,
		opacity    : 1
  });

  var blueMaterial = new THREE.MeshPhongMaterial({
    color      :  new THREE.Color("rgb(40,40,140)"),
  	emissive   :  new THREE.Color("rgb(2,7,22)"),
  	specular   :  new THREE.Color("rgb(40,0,190)"),
		shininess  :  30,
		shading    :  THREE.FlatShading,
		transparent: 1,
		opacity    : 1
  });

  var tabMaterial = [normalMaterial,blueMaterial,blackMaterial];

  var groundMaterial = new THREE.MeshPhongMaterial({
    color     :  0x000000,
    emissive  :  0x050505,
    specular  :  0x222222,
    shininess  :  0,
    shading    :  THREE.FlatShading,
    transparent: 1,
    opacity    : 1
  });

  // Background Sky Sphere
  var backgroundSphere = new THREE.Mesh( new THREE.SphereGeometry( 200, 10, 10 ), new THREE.MeshPhongMaterial( {
    color      :  new THREE.Color("rgb(30,80,40)"),
    emissive   :  new THREE.Color("rgb(20,2,35)"),
    specular   :  new THREE.Color("rgb(19,50,126)"),
    shininess  :  70,
    transparent: 1,
    opacity    : 1,
    side: THREE.BackSide
  }));
  scene.add( backgroundSphere );

  // Ground 
  var circleGround = new THREE.Mesh( new THREE.CylinderGeometry( 250, 0, 0, 0 ), groundMaterial );
  circleGround.position.y = 0;
  circleGround.receiveShadow = true;
  circleGround.castShadow = true;
  scene.add(circleGround);

  function buildBoxLeft (inx){
     this.b = new THREE.Mesh(new THREE.BoxGeometry( randInt(3,4), randInt(10,80), randInt(3,4)), tabMaterial[randInt(0,tabMaterial.length)]);
    this.b.position.x = Math.cos(inx*(Math.PI*2)/numBuild)*diamBuild;
    this.b.position.y = 0;
    this.b.position.z = Math.sin(inx*(Math.PI*2)/numBuild)*diamBuild;
    this.b.lookAt(new THREE.Vector3(0,0,0));
    this.b.receiveShadow = true;
    this.b.castShadow = true;
  }

  function buildBoxRight (inx){
    this.b = new THREE.Mesh(new THREE.BoxGeometry( randInt(3,6), randInt(10,80), randInt(3,4)), tabMaterial[randInt(0,tabMaterial.length)]);
    this.b.position.x = Math.cos(inx*(Math.PI*2)/numBuild)*(diamBuild+15);
    this.b.position.y = 0;
    this.b.position.z = Math.sin(inx*(Math.PI*2)/numBuild)*(diamBuild+15);
    this.b.lookAt(new THREE.Vector3(0,0,0));
    this.b.receiveShadow = true;
    this.b.castShadow = true;
  }

  for(var i=0; i<numBuild; i++){
    tabBuildLeft.push(new buildBoxLeft(i));
    scene.add(tabBuildLeft[i].b);
  }	

  for(var i=0; i<numBuild; i++){
    tabBuildRight.push(new buildBoxRight(i));
    scene.add(tabBuildRight[i].b);
  }	

  //////////////////////////////////////////////////////////////////////////////////
  //		render the whole thing on the page
  //////////////////////////////////////////////////////////////////////////////////
  // handle window resize
  window.addEventListener('resize', function(){
    renderer.setSize( window.innerWidth, window.innerHeight )
    camera.aspect	= window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()		
  }, false)
  // render the scene
  onRenderFcts.push(function(){
    renderer.render( scene, camera );	
    camera.position.x = Math.cos(step)*60;
		camera.position.y = 4;
		camera.position.z = Math.sin(step)*60;
		camera.lookAt(new THREE.Vector3(Math.cos(step+1)*58,40,Math.sin(step+1)*58));
    step += 0.0025;	
  })

  // run the rendering loop
  var lastTimeMsec= null
  requestAnimationFrame(function animate(nowMsec){
    // keep looping
    requestAnimationFrame( animate );
    // measure time
    lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
    var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec	= nowMsec
    // call each update function
    onRenderFcts.forEach(function(onRenderFct){
      onRenderFct(deltaMsec/1000, nowMsec/1000)
    })
  })