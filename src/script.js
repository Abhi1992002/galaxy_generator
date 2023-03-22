import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//galaxy

const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = "#ff6030"
parameters.outsideColor = "#1b3984"

let particleGeometry = null
let material = null
let points = null

const galaxyGenerator = ()=>{

    if(points !== null){

        //in starting , it will not run because points is null but if we generate new galaxy , points is not null and then it will run this and remve galxy from scene

        particleGeometry.dispose()
        material.dispose()
        scene.remove(points)
    }


     particleGeometry = new THREE.BufferGeometry()
    const position = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    
   const colorInside = new THREE.Color(parameters.insideColor) 
   const colorOutside = new THREE.Color(parameters.outsideColor) 



    for (let i = 0; i < parameters.count;  i++) {
         
        let i3 = i * 3
    
        const radius = Math.random() * parameters.radius //random distance of particle from center
        const spinAngle = parameters.spin * radius //far particle , more spin , center particle =>  no spin => cause spiral shape
        const branchAngle = ((i % parameters.branches)/parameters.branches) * Math.PI * 2

          

        //see if Math.random is near 0.2 , so pow make it more small , which cause particle to be near to center , and i multiply it with
        // (Math.random() < 0.5 ? 1 :-1) to make its range from negative to positive
        const randomX = Math.pow(Math.random() ,parameters.randomnessPower) * (Math.random() < 0.5 ? 1 :-1)
        const randomY = Math.pow(Math.random() ,parameters.randomnessPower) * (Math.random() < 0.5 ? 1 :-1)
        const randomZ = Math.pow(Math.random() ,parameters.randomnessPower) * (Math.random() < 0.5 ? 1 :-1)

        position[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX 
        position[i3 + 1] = randomY
        position[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

         // making mixed color between both
         const mixedColor = colorInside.clone()

         //lerp second parameter is alpha , if near 0 then more insie color , if 1 then outside (value should be between 0 and 1)
  
         mixedColor.lerp(colorOutside , radius/parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(position , 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors , 3))

    // material 
     material = new THREE.PointsMaterial({
        size:parameters.size,
        sizeAttenuation:true,
        depthWrite:false,
        blending:THREE.AdditiveBlending,
        //color : orange at near center and blue outside
        vertexColors:true
    })

    //points
    points = new THREE.Points(particleGeometry, material)
    scene.add(points)

  
}
//if we change parameter we need to regenerate galaxy again , we make new galaxy but ot removing the previous galaxy , remove geometry , material and points aoutside function nad give them null value
gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(galaxyGenerator)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(galaxyGenerator)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(galaxyGenerator)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(galaxyGenerator)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(galaxyGenerator)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(galaxyGenerator)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(galaxyGenerator)
gui.addColor(parameters, 'insideColor').onFinishChange(galaxyGenerator)
gui.addColor(parameters, 'randomnessPower').onFinishChange(galaxyGenerator)
galaxyGenerator()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()