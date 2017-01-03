import * as THREE from 'three'
import THREE_Controller from './components/three_controller.class.js'
import * as TOOLS from './components/tools.class.js'

var framecounter = new TOOLS.FrameRateUI()

var controller = new THREE_Controller({
    container: document.querySelector('#container')
})

// start animating
animate();

function animate() {
    requestAnimationFrame(animate);

    // Updating components
    controller.update()
    framecounter.update()

}
