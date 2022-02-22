import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

//cubemap
const path = 'textures/cube/';
const format = '.jpg';
const urls = [
	path + 'px' + format, path + 'nx' + format,
	path + 'py' + format, path + 'ny' + format,
	path + 'pz' + format, path + 'nz' + format
];

const reflectionCube = new THREE.CubeTextureLoader().load( urls );
const refractionCube = new THREE.CubeTextureLoader().load( urls );
refractionCube.mapping = THREE.CubeRefractionMapping;

// SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xEEE5E9)
scene.fog = new THREE.Fog( 0xEEE5E9, 4, 15 )

// CAMERA
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(3, 2, 0)

// RENDER
const renderer = new THREE.WebGLRenderer( { antialias: true } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0.7, 0)

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

//Ambient Light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
scene.add(ambientLight)

//Ambient Light GUI params
const gui = new GUI()
const ambientFolder = gui.addFolder('Ambient Light')
ambientFolder.add(ambientLight, "visible")
ambientFolder.add(ambientLight, "intensity", 0.0, 1.0)

//Directional Light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 0.1, 1, 0 ); //default; light shining from top
directionalLight.castShadow = true;
scene.add(directionalLight);

//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 512; // default
directionalLight.shadow.mapSize.height = 512; // default
directionalLight.shadow.camera.near = 0.5; // default
directionalLight.shadow.camera.far = 500; // default

//Directional Light GUI params
const dirFolder = gui.addFolder('Directional Light')
dirFolder.add(directionalLight, "visible")
dirFolder.add(directionalLight, "intensity", 0.0, 1.0)

const dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( 3, 10, 10 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add( dirLight );

// GROUND
const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add( mesh );

// MATERIALS
const texture = new THREE.TextureLoader().load( 'models/Cutter_A.png' );
const normal = new THREE.TextureLoader().load( 'models/Cutter_N.png' );
const metal = new THREE.TextureLoader().load( 'models/Cutter_M.png' );
const occlusion = new THREE.TextureLoader().load( 'models/Cutter_O.png' );
const roug = new THREE.TextureLoader().load( 'models/Cutter_S.png' );
// immediately use the texture for material creation
const material = new THREE.MeshStandardMaterial( 
    { 
        map: texture,
        normalMap: normal,
        roughnessMap: roug, 
        roughness: 1,
        aoMap: occlusion,
        metalnessMap: metal,
        metalness: 1, 
        envMap: reflectionCube
    } 
);

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    encoding: THREE.sRGBEncoding
} );

const cubeCamera = new THREE.CubeCamera( 1, 10000, cubeRenderTarget );

// LOADER
const fbxLoader = new FBXLoader()
fbxLoader.load(
    'models/cutter.fbx',
    (object) => {
         object.traverse(function (child) {
             if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = material
             }
         })
         
        object.scale.set(.01, .01, .01)
        object.rotation.set(0, 4, 0)
        object.castShadow = true //default is false
        object.receiveShadow = false //default
        object.add(cubeCamera)
        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    cubeCamera.update( renderer, scene );

    render()

    stats.update()

}

function render() {
    renderer.render(scene, camera)
}

animate()