import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x808080);

//Ambient Light
const ambientLight = new THREE.AmbientLight(0xFFFFFF)
ambientLight.position.set(1, 1, 1)
scene.add(ambientLight)

//Ambient Light GUI params
const gui = new GUI()
const ambientFolder = gui.addFolder('Ambient Light')
ambientFolder.add(ambientLight, "visible")
ambientFolder.add(ambientLight, "intensity", 0.0, 1.0)

//Directional Light
const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
dirLight.position.set(2, 10, 1);

scene.add(dirLight);

//Directional Light GUI params
const dirFolder = gui.addFolder('Directional Light')
dirFolder.add(dirLight, "visible")
dirFolder.add(dirLight, "intensity", 0.0, 1.0)

// ground
const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshPhongMaterial({ color: 0x363636, depthWrite: false })
);
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);

const grid = new THREE.GridHelper(20, 20, 0xFFFFFF, 0xFFFFFF);
scene.add(grid);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(3, 2, 0)

const renderer = new THREE.WebGLRenderer()
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0.7, 0)

const somemap = new THREE.TextureLoader().load( 'models/Cutter_MOS.png' );
const texture = new THREE.TextureLoader().load( 'models/Cutter_A.png' );
const normal = new THREE.TextureLoader().load( 'models/Cutter_N.png' );

// immediately use the texture for material creation
const material = new THREE.MeshStandardMaterial( 
    { 
        map: texture, 
        normalMap: normal,
        aoMap: somemap
    } 
);

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

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()