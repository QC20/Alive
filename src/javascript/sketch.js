class ThreeBasic {
    constructor(withControls = false){
      this.hasControls = withControls;
      this.useControls = false;
      this.renderer = null;
      this.camera = null;
      this.scene = null;
      this.controls = null;
    }
    init(){
      const VIEW_ANGLE = 45,
      ASPECT = window.innerWidth / window.innerHeight,
      NEAR = 0.1,
      FAR = 10000;
      const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
      camera.position.z = 50;
      
      
      const scene = new THREE.Scene();
      
      const renderer = new THREE.WebGLRenderer({ alpha: true,  antialias: true , preserveDrawingBuffer: true });
                  // renderer.autoClearColor = false;
      if(this.hasControls){
      }
      document.body.appendChild(renderer.domElement);
      
      
      this.camera = camera;
      this.scene = scene;
      this.renderer = renderer;
      this.onResize();
    }
    add(mesh){
      this.scene.add(mesh);
    }
  onResize(){
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // uniforms.u_res.value.x = renderer.domElement.width;
    // uniforms.u_res.value.y = renderer.domElement.height;
    this.camera.aspect = window.innerWidth / window.innerHeight;
  }
    render(){
        this.renderer.render( this.scene, this.camera );
    }
  }
  const point  = new THREE.BufferGeometry();
  const vertices =  new Float32Array([0,0,0]);
  point.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  
  // const pointMat = new THREE.PointsMaterial( { color: 0x888888 } );
  // const pointMesh = new THREE.Points(point,pointMat);
  
  
  const makeInstanced = (originalBufferGeometry, count, maxCount)=>{
    
    maxCount = maxCount ? maxCount : count;
    console.log(maxCount)
    
    const geometry  = new THREE.InstancedBufferGeometry();
    geometry.addAttribute("position", originalBufferGeometry.attributes.position.clone());
    if(originalBufferGeometry.attributes.normal)
    geometry.addAttribute('normal',originalBufferGeometry.attributes.normal.clone());
    if(originalBufferGeometry.attributes.uv)
    geometry.addAttribute('uv',originalBufferGeometry.attributes.uv.clone());
    geometry.maxInstancedCount = maxCount;
    const nums = new THREE.InstancedBufferAttribute(new Float32Array(maxCount), 1, 1);
    for(var i = 0; i < nums.count; i++){
      nums.setX(i, i);
    }
    geometry.addAttribute('count', nums);
    geometry.setIndex(originalBufferGeometry.getIndex())
    geometry.setDrawRange(0,count);
    return geometry;
  }
  
  const updateInstanceCount = (instancedBuffer, count)=>{
    instancedBuffer.setDrawRange(0,count);
    
  }
  
  const App = new ThreeBasic(true);
  App.init();
  
  const variables = {
    instances: 10000,
    stopTime: false,
    timeSpeed: 0.0005,
    variant: 'deer'
  }
  const variants = ['time','home', 'search','deer','butterfly'];
  
  // CODE GOES HERE
  let total = 100;
  
  
  const uniforms = {
    
     u_time: {type:'f', value: 0},
    u_total: {type: 'f', value: variables.instances},
    u_noiseDiff: { type: 'f', value: 0.01},
    u_radius: {type: 'f', value: 25 },
    u_pointSize: {type: 'f', value: 1.}
  }
  let segments = 16;
  let squareGeo =  makeInstanced(point, 10000,25000);
  const curlNoise = document.getElementById('curlnoise').textContent;
  const getVertexShader = (variant) => {
    
  const variantFragment = document.getElementById(`${variables.variant}-vertex`).textContent;
  const vertexShader = curlNoise + variantFragment;
   return vertexShader;
  }
  
  const squareMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: getVertexShader(variables.variant),
    fragmentShader: document.getElementById('fragment').textContent
  });
  const squareMesh = new THREE.Points(squareGeo, squareMat );
  
  // Adding materials 
    App.add(squareMesh);
  
  //
  let stats = new Stats();
  stats.showPanel(0);
  stats.domElement.className = "stats"
  document.body.appendChild( stats.domElement );
  /*
  pow(
    (1 + noise.eval(
     4 * SEED + scl * pos.x/2,
     scl * pos.y / 2 + mr * cos(TWO_PI*t),
     scl * pos.z / 2 + mr * sin(TWO_PI*t))
    )/2,
    4.0);
  */
  const test = {
    test: 'sans-serif'
  }
  const gui = new dat.GUI();
  gui.add(variables, "stopTime");
  gui.add(variables, "timeSpeed", 0.00001,0.001);
  const instanceController  = gui.add(variables, "instances", 1000,25000);
  instanceController.onFinishChange(function(val){
    val = Math.floor(val);
    updateInstanceCount(squareGeo, val);
    console.log(val,uniforms.u_total.value)
    uniforms.u_total.value = val;
  });
  gui.add(uniforms.u_noiseDiff, 'value', 0.001,0.02).name('noise diff');
  gui.add(uniforms.u_radius, 'value', 10,25).name('max radius');
  gui.close();
  const guiVariants = gui.add(variables, "variant", variants);
  guiVariants.onFinishChange(function(val){
    const vertex = getVertexShader(val);
    squareMat.vertexShader = vertex;
    uniforms.u_time.value = 0;
    squareMat.needsUpdate = true;
    
  })
   // Gui controls go here
  const update = ()=>{
    if(!variables.stopTime)
    uniforms.u_time.value += variables.timeSpeed;
    // squareMesh.rotation.y+=0.025;
  }
  function draw(){
    stats.begin();
    App.render();
    stats.end();
    update();
    
    requestAnimationFrame(draw)
  }
  function init(){
    requestAnimationFrame(draw)
  }
  
  
  window.addEventListener('resize', ()=>{
    App.onResize();
    
    
  });
  window.addEventListener('mousemove',(e)=>{
    // uniforms.u_mouse.value.x = e.clientX/window.innerWidth;
    // uniforms.u_mouse.value.y = e.clientY/window.innerHeight;
  })
  
  init();