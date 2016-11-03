$(function (){
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth /     window.innerHeight, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
 
  renderer.setClearColorHex(0x2e7c95); 
  scene.fog = new THREE.FogExp2( 0x3690ae, 0.0085 );
  
  var groundGeo = new THREE.PlaneGeometry(400,400,4,4);
  var groundMat = new THREE.MeshPhongMaterial({color:0x244876});
  groundMat.shininess = 100;
  var ground = new THREE.Mesh(groundGeo,groundMat);
  scene.add(ground);
  ground.position.x = 140; 
  ground.position.y = 0; 
  ground.position.z = -150; 
  ground.rotation.x = -1.55;
  
  camera.position.x = 0; 
  camera.position.y = 25; 
  camera.position.z = 0; 
  
  camera.rotation.y = -0.785398163;
  camera.rotation.z = -0.280;
  camera.rotation.x = -0.400;
  
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ); 
  directionalLight.position.set( -20, 10, 30 ); 
  scene.add( directionalLight );
  
  var pointLight = new THREE.PointLight( 0xff0000, 10, 100 );
  scene.add(pointLight);
  
  var monolith = [];
  var monolithGeo = new THREE.CubeGeometry( 4,4,4); 
  var monolithMat = new THREE.MeshPhongMaterial( {color: 0x244876}); 
  monolithMat.shininess = 100;
  var monolithRow = [];
  var rowZ = 0;
  
  for (r=0; r<35; r++){
    rowZ -= 10;
    
    for (i=0; i<35; i++){
      monolith[i] = new THREE.Mesh(monolithGeo, monolithMat); 
      monolith[i].position.x = i*10; 
      monolith[i].position.y = 0; 
      monolith[i].position.z = rowZ; 
    
      var rand = Math.ceil(Math.random()*10);
      monolith[i].scale.y = rand;
      scene.add(monolith[i]); 
    }
  }
  
  render();
  
  function render(){
    requestAnimationFrame(render);
    
    camera.position.z -= 0.1;
    camera.position.x += 0.1;
    pointLight.position.set(camera.position.x,camera.position.y,camera.position.z);
    
    renderer.render(scene, camera);
  };
  
  $("#WebGL-output").append(renderer.domElement);
 
  
});