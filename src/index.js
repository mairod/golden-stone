import * as THREE from 'three'
import THREE_Controller from './components/three_controller.class.js'
import * as TOOLS from './components/tools.class.js'

var framecounter = new TOOLS.FrameRateUI()
framecounter.hide()

var audio_analyser = new TOOLS.AudioAnalyzer({
    debug: true,
    playerUI: true,
    autoplay: false,
    audioElement: document.querySelector('audio'),
    samplingFrequency: 256
})
audio_analyser.hide()
STORAGE.audio = audio_analyser

audio_analyser.addControlPoint({
      bufferPosition : 30
})
STORAGE.audio_controls = audio_analyser.controls

var link = document.querySelector('h2.credits')
link.addEventListener('click', function(event){
    event.preventDefault()
    var url = this.querySelector('a').getAttribute("href")
    var win = window.open(url, '_blank');
    win.focus();
})

window.addEventListener('keyup', function(evt){
    var key = evt.keyCode
    if (key == 192) {
        var audio = document.querySelector('audio')
        audio.classList.toggle('hidden')
        // STORAGE.canvas.classList.toggle('hidden')
        framecounter.toggleShow()
        audio_analyser.toggleShow()
    }
})

var controller = new THREE_Controller({
    container: document.querySelector('#container')
})

// start animating
animate();

function animate() {
    requestAnimationFrame(animate);

    // Updating components
    controller.update()
    audio_analyser.update()
    framecounter.update()

}
