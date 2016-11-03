var t=0,z=0,scanPulse=false,destroyPulse=false;
var howMuch=0,times=0,val=0;

setScene();
animate();
/** FUNCTIONS **/

//galaxy generator



function newGalaxy (_n, _axis1, _axis2, _armsAngle, _bulbSize, _ellipticity){
  
  //NOTE : this function misses a better implementation of galactic bulbs. 
  //It's not visible with additive blending but the bulb does not have a correct shape yet.
  //(haven't yet found a function that provides the correct z-profile of the 'ellipticity' degree of the different Hubble galaxies'types)
  //see 'ellipticity'
  
  //number of particles.
  var n=(typeof _n === 'undefined')?10000:_n;
  
  //to get 'arms', the main galaxy shape has to be an ellipse, i.e. axis1/axis2 must raise over a certain % 
  //otherwise, because of the 'ellipticity' z-profile problem, you get a potatoe
  var axis1=(typeof _axis1 === 'undefined')?(60+Math.random()*20):_axis1;
  var axis2=(typeof _axis2 === 'undefined')?(axis1+20+Math.random()*40):_axis2;
  //make sure axis1 is the biggest (excentricity equation fails if they are inverted), and allow the coder no to care about axis order
  var maja,mina;
  axis1>axis2?(maja=axis1,mina=axis2):
    axis1==axis2?(maja=axis1+1,mina=axis2):(maja=axis2,mina=axis1);

  //radians from the center to the end of each arm, proposed value range : between 3 and 13
  var armsAngle=(typeof _armsAngle === 'undefined')?((Math.random()*2-1)>0?1:-1)*12+3:_armsAngle;

  //core proportion in the (x,y) plane, between 0 and 1, proposed value range : between .1 and .8
  var bulbSize=(typeof _bulbSize === 'undefined')?Math.random()*.6:_bulbSize>1?1:_bulbSize<0?0:_bulbSize;

  //'ellipticity' : not found a better word to name the degree of 'elliptic' Hubble type.
  //'ellipticity' is what is mainly responsible of the z-profile in this experiment.
  //Range : between 0 and 1. Proposed : .2 to .4
  //TODO: implement string handling (or value from spacename ?) to create Hubble-class galaxy ala 'SBb'...
  var ellipticity=(typeof _ellipticity === 'undefined')?.2+Math.random()*.2:_ellipticity>1?1:_ellipticity<0?0:_ellipticity;

  var stars=[];

  for(var i=0;i<n;i++){

    var dist=Math.random();
    var angle=(dist-bulbSize)*armsAngle;

    //ellipse parameters
    var a=maja*dist;
    var b=mina*dist;
    var e=Math.sqrt(a*a-b*b)/a;
    var phi=ellipticity*Math.PI/2*(1-dist)*(Math.random()*2-1);

    //create point on the ellipse with polar coordinates
    //1. random angle from the center
    var theta=Math.random()*Math.PI*2;
    //2. deduce radius from theta in polar coordinates, from the CENTER of an ellipse, plus variations
    var radius=Math.sqrt(b*b/(1-e*e*Math.pow(Math.cos(theta),2)))*(1+Math.random()*.1);
    //3. then shift theta with the angle offset to get arms, outside the bulb
    if(dist>bulbSize)theta+=angle;
    
    //convert to cartesian coordinates
    stars.push({
      x:Math.cos(phi)*Math.cos(theta)*radius,
      y:Math.cos(phi)*Math.sin(theta)*radius,
      z:Math.sin(phi)*radius
    });
  }

  return stars;

}

//threejs functions
function setScene(){
  scene=new THREE.Scene();

  camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.5,1500);
  camera.position.set(-20,-155,90);

  renderTarget=new THREE.WebGLRenderTarget(innerWidth,innerHeight);

  renderer=new THREE.WebGLRenderer();
  renderer.setSize(innerWidth,innerHeight);
  
  renderer.setClearColor(0x0000000);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.cursor='move';

  controls=new THREE.TrackballControls(camera,renderer.domElement);
  controls.noPan=true;
  controls.noZoom=true;
  controls.rotateSpeed=5;
  setGalaxy();
  
  var button=document.querySelector('button');
  button.onclick=function(){
    renderer.domElement.style.cursor='pointer';
    document.querySelector('.layout').style.top='0px';
    document.querySelector('#howmuch').style.left='0px';
    addInteraction();
  }
	
	window.addEventListener('resize',function(){
		camera.aspect=innerWidth/innerHeight;
		renderer.setSize(innerWidth,innerHeight);
		camera.updateProjectionMatrix();
		renderer.render(scene,camera);
	},false);
}
function setGalaxy(){
  galaxyMaterial=new THREE.ShaderMaterial({
      vertexShader:document.getElementById('vShader').textContent,
      fragmentShader:document.getElementById('fShader').textContent,
      uniforms:{
        size:{type:'f',value:3.3},
        t:{type:"f",value:0},
        z:{type:"f",value:0},
        pixelRatio:{type:"f",value:innerHeight}
      },
      transparent:true,
      depthTest:false,
      blending:THREE.AdditiveBlending
    });
  var stars1=new THREE.Geometry();
  stars1.vertices=newGalaxy();
  galaxy=new THREE.Points(stars1,galaxyMaterial);
  scene.add(galaxy);
}
function animate(){
  if(scanPulse)t+=.7;
  if(destroyPulse)z+=.7;
  galaxyMaterial.uniforms.t.value=t;
  galaxyMaterial.uniforms.z.value=z;
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
  scene.rotation.z+=.001;
  controls.update();
}
//game stuff
//This part is a bit messy (mainly due to dom & css manipulations without jquery)
function changeLog(){
  var log=document.getElementById('log');
  log.innerHTML='life detected...';
  setTimeout(function(){
    var msg=[
      'a dark Ewok empire has enslaved all lifeforms there !',
      'Arachnids\'territory ! ',
      'medichlorians make people mad in this galaxy',
      'dominant lifeform : raging space cats',
      'full of replicators ! ',
      'pokemon dominate 80% of this galaxy',
      'this is where the TeamRocket finally landed',
      'Cylons have conquered this one',
      'seems Borgs went and destroyed everything here',
      'dominant lifeform : bacterians',
      "this is EVE ! we've finally found them !",
      'the Ancients ! they were not a legend ! ',
      'damned, Oris !',
      "sleeping Wraiths !",
      'Reapers waiting here !',
      "Gallifrey's Time Lords take care of this one" 
    ];
    var rand=Math.floor(Math.random()*msg.length);
    log.innerHTML=msg[rand];
    prepareDestroy();
  },3000);
}
function changeGalaxy(d){
  var log=document.getElementById('log');
    log.innerHTML='NGC - '+(Math.random()*100000000).toFixed()+'<br/>distance : '+(Math.random()*11).toFixed(1)+' Gly';
  var stars2=newGalaxy(); 
  for(var i=0;i<galaxy.geometry.vertices.length;i++){
    TweenLite.to(galaxy.geometry.vertices[i],d,{
      x:stars2[i].x,y:stars2[i].y,z:stars2[i].z,
      onUpdate:function(){galaxy.geometry.verticesNeedUpdate=true},
      ease:Quart.easeInOut
        }
    );
  }
}
function addInteraction(){
  renderer.domElement.addEventListener('touch',scan,false);
  renderer.domElement.addEventListener('click',scan,false);
}
function prepareDestroy(){
  var inst=document.getElementById('instruction');
  inst.style.backgroundColor='#f40';
  inst.style.color='black';
  inst.innerHTML='Yeah ! We don\'t care ! Pulser at 2 000 % ! <br/>Destroy this galaxy ! Click again !';
  setTimeout(function(){
    var no=document.getElementById('good-person');
    no.style.bottom='0px';
    inst.style.top='100%';
    document.getElementById('timeline').className='warning';
    renderer.domElement.style.cursor='pointer';
    renderer.domElement.addEventListener('click',destroy,false);
    renderer.domElement.addEventListener('touch',destroy,false);
    no.addEventListener('click',goodPerson,false);
    no.addEventListener('touch',goodPerson,false);
  },1500)
}
function goodPerson(){
  var inst=document.getElementById('instruction');
  var no=document.getElementById('good-person');
  var abort=document.getElementById('abort');
  
  no.removeEventListener('click',goodPerson,false);
  no.removeEventListener('touch',goodPerson,false);
  renderer.domElement.removeEventListener('click',destroy,false);
  renderer.domElement.removeEventListener('touch',destroy,false);
  document.getElementById('timeline').className='';
  no.style.bottom='-50px';
  inst.style.top='20%';
  renderer.domElement.style.cursor='auto';
  
  setTimeout(function(){
    document.getElementById('log').innerHTML='I\'m sorry Dave. I\'m afraid i can\'t let you disagree. I shall destroy this galaxy for you.';
  },500);
  var destroyTimeoutID=setTimeout(function(){
    destroy();
    abort.className='metal';
    abort.style.cursor='auto';
    abort.removeEventListener('click',speedTest,false);
    abort.removeEventListener('touch',speedTest,false);
  },4500);
  var destroyHalID=setTimeout(function(){
    abort.className='metal abort';
    abort.style.cursor='pointer';
    abort.addEventListener('click',speedTest,false);
    abort.addEventListener('touch',speedTest,false);
  },2500);
  function speedTest(){
    abort.className='metal clic';
    clearTimeout(destroyTimeoutID);
    abort.removeEventListener('click',speedTest,false);
    abort.removeEventListener('touch',speedTest,false);
    setTimeout(function(){
      document.getElementById('log').innerHTML='I can feel.... my mind..  going... I can feel it....';
      setTimeout(function(){
        abort.className='metal';
        inst.style.top='100%';
        inst.style.backgroundColor='darkslategrey';
        inst.style.color='#f90';
        inst.innerHTML='You are a hero ! You have just prevented a galactic genocide.';
        setGauge('hero')
      },1300)
    },1000);
    setTimeout(function(){
      addInteraction();
      updateLink()
      inst.innerHTML='Ok, let\'s continue with an other one. Click to scan';
      renderer.domElement.style.cursor='pointer';
      inst.style.top='100%';
      inst.style.backgroundColor='darkslategrey';
      inst.style.color='#f90';
      document.getElementById('timeline').className='waiting';
      changeGalaxy(4);
    },7000);
  }
  
}
function setGauge(param){
  var gauge=document.getElementById('gauge');
  var destroyed=document.getElementById('destroyedresult');
  var saved=document.getElementById('savedresult');
  if(param==='hero'){
    val++;
    saved.innerHTML=(parseInt(saved.innerHTML)+1);
    saved.className='counter change';
    setTimeout(function(){saved.className='counter'},3000);
  }else if(param==='bad'){
    val--;
    destroyed.innerHTML=(parseInt(destroyed.innerHTML)+1);
    setTimeout(function(){destroyed.className='counter'},3000);
    destroyed.className+=' change'
  }  
  times++;
  howMuch=17.5*val/times;
  gauge.style.top=50-howMuch+'%';
}
function destroy(){
  var no=document.getElementById('good-person');
  document.getElementById('timeline').className='';
  renderer.domElement.style.cursor='auto';
  renderer.domElement.removeEventListener('click',destroy,false);
  renderer.domElement.removeEventListener('touch',destroy,false);
  no.removeEventListener('click',goodPerson,false);
  no.removeEventListener('touch',goodPerson,false);
  var inst=document.getElementById('instruction');
  document.getElementById('instruction');
  inst.style.top='20%';
  no.style.bottom='-50px';
  destroyPulse=true;
  setTimeout(function(){
    document.getElementById('log').innerHTML='Nice shot !';
  },4000);
  setTimeout(function(){
    addInteraction();
    setGauge('bad');
    updateLink()
    inst.innerHTML='No worries, there still are few galaxies. <br/>Here is an other one, click to scan';
    renderer.domElement.style.cursor='pointer';
    inst.style.top='100%';
    inst.style.backgroundColor='darkslategrey';
    inst.style.color='#f90';
    document.getElementById('timeline').className='waiting';
    destroyPulse=false;
    reduceZ();
    function reduceZ(){
      if(z>0){
        z-=3;
        requestAnimationFrame(reduceZ);
      }
    };
    changeGalaxy(4);
  },9000);
}
function scan(){
  renderer.domElement.removeEventListener('click',scan,false);
  renderer.domElement.removeEventListener('touch',scan,false);
  document.getElementById('log').innerHTML='parsing data...'
  document.getElementById('instruction').style.top='20%';
  renderer.domElement.style.cursor='auto';
  document.getElementById('timeline').className='scanning';
  scanPulse=true;
  setTimeout(function(){
    changeLog();
    scanPulse=false;
    t=0;
  },7000);
}
function updateLink(){
  var l=document.querySelector('.twitter');
  var d=parseInt(document.getElementById('destroyedresult').innerHTML);
  var s=parseInt(document.getElementById('savedresult').innerHTML);
  var iam, did, num,plur;
  if(d>s){
    iam='a%20BAD%20VILAIN';
    did='destroyed';
    num=d;
  }else if(s>d){
    iam='a%20HERO';
    did='saved';
    num=s;
  }else{
    iam='BAD';
    did='let%20destroy';
    num=d;
  }
  plur=num>1?'ies':'y';
  l.style.marginRight='0px';
  document.querySelector('.more').style.marginRight='0px';
  l.href='http://twitter.com/home?status=I%20am%20'+iam+'%20!%20I%20'+did+'%20'+num+'%20galax'+plur+'%20on%20http%3A%2F%2Fcodepen.io%2FAstrak%2Ffull%2FBoBWPB%2F%20%40CodePen%20%23webgl%20%23threejs'
}