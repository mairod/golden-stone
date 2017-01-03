import * as TOOLS from './tools.class.js'
import * as THREE from 'three'

class THREE_Controller {

    constructor(options) {

        this.options            = options
        this.container          = this.options.container
        this.debug              = this.options.debug || false
        this.width              = this.container.offsetWidth
        this.height             = this.container.offsetHeight
        this.camera             = new Object()
        this.assets             = new Object()
        this.scene              = new THREE.Scene()
        this.mouse              = new THREE.Vector2(0, 0)
        this.direction          = new THREE.Vector2(0, 0)
        this.cameraPosition     = new THREE.Vector2(0, 0)
        this.cameraEasing       = 40
        this.time               = 0

        // this.init_loader()
        this.init_environement()
        this.init_camera()
        this.init_event()
        this.init_loader()
        this.load_mesh()
        this.init_mirror_mesh()
        this.init_dummy()

        this.update()

    }

    init_loader() {

        this.manager = new THREE.LoadingManager();
		this.manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};

    }

    init_mirror_mesh(){
        this.mirror_mesh = {}

        this.mirror_mesh.camera = new THREE.CubeCamera( 0.1, 5000, 512 );
    	// this.mirror_mesh.camera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    	this.scene.add( this.mirror_mesh.camera );

    }

    load_mesh(){
        var that = this

        var OBJLoader = require('three-obj-loader')
        OBJLoader(THREE);

        this.mesh = new THREE.Group()
        this.scene.add(this.mesh)

        var loader = new THREE.OBJLoader( this.manager );
		loader.load( 'assets/statue.obj', function ( object ) {

                var obj = object
                that.mesh.add(obj)

                var material = new THREE.MeshBasicMaterial( {
                    color: 0x82b2ca,
                    envMap: that.mirror_mesh.camera.renderTarget.texture,
                    shading: THREE.SmoothShading,
                    reflectivity: .95,
                    combine: THREE.Multiply
                } );

    			obj.traverse( function ( child ) {
    				if ( child instanceof THREE.Mesh ) {
    					child.material = material
    				}
    			} );

    			// obj.position.x = - 60;
                // obj.rotation.x = 20* Math.PI / 180;
                // obj.rotation.z = 20* Math.PI / 180;
                obj.scale.x = .8;
                obj.scale.y = .8;
                obj.scale.z = .8;
                obj.position.set(0, -60, 0)
                that.mirror_mesh.camera.position.set(0, -60, 0)
          } );

          this.mesh.update = function(){
              // mirror update
              this.visible = false;
              that.mirror_mesh.camera.updateCubeMap( that.renderer, that.scene );
              this.visible = true;
          }
    }

    init_camera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.z = 200;
    }

    init_environement() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)
        this.container.appendChild(this.renderer.domElement)
    }

    init_event() {
        var that = this
        window.addEventListener('resize', function() {
            that.width = window.innerWidth
            that.height = window.innerHeight
            that.camera.aspect = that.width / that.height;
            that.camera.updateProjectionMatrix();
            that.renderer.setSize(that.width, that.height);
        }, false)

        window.addEventListener("mousemove", function(event) {
            that.mouse.x = (event.clientX / that.width - .5) * 2
            that.mouse.y = (event.clientY / that.height - .5) * 2
        })

    }

    init_dummy() {

        var glsl = require('glslify')

        const vertex_shader = glsl.file("../shaders/mat_cap.vert")
        const fragment_shader = glsl.file("../shaders/mat_cap.frag")
        const matcap = new THREE.TextureLoader().load('assets/matcap.png')

        var material = new THREE.ShaderMaterial({
            uniforms: {
                tMatCap: {
                    type: 't',
                    value: matcap
                }
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader,
            shading: THREE.SmoothShading
        });

        var that = this
        this.dummy = new THREE.Mesh(new THREE.TorusKnotGeometry(20, 3, 400, 15, 8, 14), material);
        this.dummy.position.set(0, 0, 0);
        this.dummy.rotation.set(Math.PI / 4, 0, Math.PI / 3);
        this.scene.add(this.dummy);
        console.log(this.dummy);

        this.dummy.time = 0
        this.dummy.update = function() {
            this.time += .02
            that.dummy.rotation.x += .01
            that.dummy.rotation.y += .02
            that.dummy.position.x = Math.cos(this.time) * 100
            that.dummy.position.y = Math.cos(this.time) * 20
            that.dummy.position.z = Math.sin(this.time) * 100

        }
    }

    update() {

        if (this.dummy != undefined) {
            this.dummy.update()
        }

        if (this.mesh != undefined) {
            this.mesh.update()
        }

        // camera
        this.direction.subVectors(this.mouse, this.cameraPosition)
        this.direction.multiplyScalar(.06)
        this.cameraPosition.addVectors(this.cameraPosition, this.direction)
        this.camera.position.x = this.cameraPosition.x * this.cameraEasing * -1
        this.camera.position.y = -this.cameraPosition.y * this.cameraEasing * -1
        this.camera.lookAt(new THREE.Vector3(0, 0, -200))

        this.renderer.render(this.scene, this.camera);
    }


}

export default THREE_Controller
