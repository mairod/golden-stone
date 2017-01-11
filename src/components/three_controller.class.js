import * as TOOLS from './tools.class.js'
import * as THREE from 'three'
import Ring from './ring.class.js'


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
        this.init_rings()
        this.init_lights()
        this.init_mirror_mesh()
        this.init_floor()
        // this.init_dummy()
        this.update()

    }

    init_loader() {

        this.manager = new THREE.LoadingManager();
		    this.manager.onProgress = function ( item, loaded, total ) {
			       console.log( item, loaded, total );
        };

    }

    init_lights(){

        this.light = new THREE.SpotLight( 0xffffff )

        this.light.castShadow = true
        this.light.penumbra = .8
        this.light.power = Math.PI * .5

        this.light.castShadow = true
    	this.light.shadow.camera.near = 1
    	this.light.shadow.camera.far = 30

        this.light.position.set(200, 25, 0)
        this.light.lookAt(new THREE.Vector3(30,20,0))
        this.scene.add(this.light)

        var time = 0
        this.light.update = function(){
            time += .01
            this.power = ((Math.PI * Math.cos(time)) / 4) + (Math.PI * 1.7)
        }

    }

    init_mirror_mesh(){
        this.mirror_mesh = {}

        this.mirror_mesh.camera = new THREE.CubeCamera( 0.1, 5000, 512 );
    	// this.mirror_mesh.camera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    	this.scene.add( this.mirror_mesh.camera );

    }

    init_rings(){

        this.ring = new Ring({
            rotation: {
                x: Math.PI/4,
                y: 0,
                z: 0
            }
        })
        this.scene.add(this.ring)

    }

    init_floor(){

        var material = new THREE.MeshPhongMaterial( {
            color: 0x1c1d21,
            shading: THREE.SmoothShading,
            reflectivity: .85
        } );

        var geom = new THREE.PlaneBufferGeometry(1300, 1300, 2, 2)

        this.floor = new THREE.Mesh(geom, material)
        this.floor.rotation.x = - Math.PI / 2
        this.floor.position.y = - 58
        this.floor.castShadow = true
        this.floor.receiveShadow = true

        this.scene.add(this.floor)

    }

    load_mesh(){
        var that = this

        var OBJLoader = require('three-obj-loader')
        OBJLoader(THREE);

        this.mesh = new THREE.Group()
        this.scene.add(this.mesh)

        var loader = new THREE.OBJLoader( this.manager );
		    loader.load( 'assets/statue_low_smth.obj', function ( object ) {

                var obj = object
                that.mesh.add(obj)

                var material = new THREE.MeshPhongMaterial( {
                    color: 0x82b2ca,
                    envMap: that.mirror_mesh.camera.renderTarget.texture,
                    shading: THREE.SmoothShading,
                    reflectivity: .85
                } );

    			obj.traverse( function ( child ) {
      				  if ( child instanceof THREE.Mesh ) {
  					       child.material = material
                           child.castShadow = true
                           child.receiveShadow = true
      				  }
			    } );

                obj.scale.x = .8;
                obj.scale.y = .8;
                obj.scale.z = .8;
                obj.position.set(0, -60, 0)
                that.mirror_mesh.camera.position.set(0, -60, 0)

          } );

          this.mesh.update = function(){
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

        this.scene.fog = new THREE.FogExp2( 0x101010, 0.0028 )

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)

        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.shadowMapWidth = 1024
        this.renderer.shadowMapHeight = 1024

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
        this.dummy.castShadow = true
        this.dummy.receiveShadow = true
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

        if ( this.dummy   != undefined ) { this.dummy.update() }
        if ( this.mesh    != undefined ) { this.mesh.update()  }
        if ( this.ring    != undefined ) { this.ring.update()  }
        if ( this.light   != undefined ) { this.light.update()  }

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
