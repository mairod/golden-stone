import * as THREE from 'three'

class Ring {

    constructor(options) {

          this.options                = options                   || {}
          this.position               = this.options.position     || { x: 0, y:0, z:0 }
          this.rotation               = this.options.rotation     || { x: 0, y:0, z:0 }
          this.scale                  = this.options.scale        || { x: 1, y:1, z:1 }
          this.size                   = this.options.size         || { radius: 50, pipe: 2 }
          this.offset                 = this.options.offset       || { x: 0, y:0, z:0 }
          this.object                 = new THREE.Group()

          this.init_material()
          this.init_object()
          return this.object

    }

    init_material(){

        var glsl = require('glslify')

        const vertex_shader = glsl.file("../shaders/mat_cap.vert")
        const fragment_shader = glsl.file("../shaders/mat_cap.frag")
        const matcap = new THREE.TextureLoader( STORAGE.manager ).load('assets/gold.png')

        this.material = new THREE.ShaderMaterial({
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
        this.material.canvas = this.matcap


    }

    init_object() {

        var that = this

        this.mesh = new THREE.TorusBufferGeometry(this.size.radius, this.size.pipe, 128, 64)
        var object = new THREE.Mesh(this.mesh, this.material)
        object.castShadow = true
        object.receiveShadow = false

        object.position.set(this.offset.x, this.offset.y, this.offset.z)
        this.object.position.set(this.position.x, this.position.y, this.position.z)
        object.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)
        this.object.scale.set(this.scale.x, this.scale.y, this.scale.z)

        this.object.add(object)
        this.object.update = function(){
            that.update()
        }

    }

    update(){

        this.object.rotation.y += .01
        if ( this.matcap_canvas != undefined && this.material != undefined) {
            this.material.canvas.needsUpdate = true
            this.matcap_canvas.update()
        }

    }
}

export default Ring
