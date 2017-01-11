/*

var worker_task = new Worker_handler({
    work: function(e){
        var input = e.data
        input.test = Math.random() * 100
        console.log(input);
        return input
    },
    callback: function(e) {
        console.log("Received: ", e.data);
    }
})

*/

class Worker_handler {

    constructor(options) {
        this.options            = options
        this.work               = this.options.work
        this.callback           = this.options.callback
        this.ready              = false
        this.init_work()
        this.init_worker()
    }

    init_work(){
        var callback = String(this.work)

        callback = callback.replace("function work(e) {", "")
        callback = callback.replace("}", "")
        callback = callback.replace(/\;/g, "")

        var tmp = callback.split("return")

        tmp.splice(1, 0, "self.postMessage(")
        tmp.splice(3, 0, ");")
        tmp.splice(0, 0, "self.onmessage = function(e) {")
        tmp.push("};")

        this.work_adapted = tmp.join("")
    }

    init_worker() {
        var that = this
        var blob = new Blob([
            this.work_adapted
        ], { type: "text/javascript" })
        this.worker = new Worker(window.URL.createObjectURL(blob))
        this.worker.onmessage = function(e) {
            that.callback(e)
        }
        var that = this
        setTimeout(function () {
            that.ready = true
        }, 10);
    }

    run_with(input){
        this.worker.postMessage(input)
    }

}

export default Worker_handler
