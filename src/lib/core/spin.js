(function(v) {
  v.ui.Spinner = Object.extend({
    running: false,
    
    init: function(options) {
      options = v.x({
        lines: 12,            // The number of lines to draw
        length: 4,            // The length of each line
        width: 2,             // The line thickness
        radius: 7,            // The radius of the inner circle
        // rotate: 0,            // Rotation offset
        // corners: 1,           // Roundness (0..1)
        color: '#000'         // css color
      }, options, true)
      
      // var scale = v.ui.scale || 1
      // var ratio = v.env.screen.pixelRatio * 2 * scale
      // if (ratio != 1) {
      //   options.length *= ratio
      //   options.width *= ratio
      //   options.radius *= ratio
      // }
      var ratio = v.env.screen.pixelRatio
      if (ratio != 1) {
        options.length *= ratio
        options.width *= ratio
        options.radius *= ratio
      }

      this.speed = 1000 / options.lines
      this.angle = Math.PI * 2 / options.lines
      this.width = (options.radius + options.length + options.width) * 2
      
      this.options = options
    },
    
    spin: function(el) {
      el = v(el)
      if (!this.running && el.has()) {
        var ratio = v.env.screen.pixelRatio
        var options = this.options
        var width = this.width
        var halfWidth = width >> 1
        var w = width / ratio | 0
        var hw = w >> 1
        var canvas = v.$({
          tag: 'canvas',
          width: w,
          height: w,
          style: 'position:absolute;top:50%;left:50%;z-index:' + 2e9 +
                 ';margin:-' + hw + 'px 0 0 -' + hw + 'px'
        }, el)[0]
        var ctx = canvas.getContext('2d')
        canvas.width = canvas.height = width
        ctx.translate(halfWidth, halfWidth)
        ctx.lineWidth = options.width
        ctx.strokeStyle = options.color
        // if (options.corners) {
          ctx.lineCap = 'round'
        // }
        
        this.canvas = canvas
        this.running = true
        
        this.update()
      }
      return this
    },
    
    update: function() {
      if (this.running) {
        var options = this.options
        var color = options.color
        var canvas = this.canvas
        var ctx = canvas.getContext('2d')
        
        // Rotate the origin
        // ctx.rotate(this.angle + options.rotate)
        ctx.rotate(this.angle)

        ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2)
        for (var i = 0; i < options.lines; i++) {
          // ctx.globalCompositeOperation = i === 0 ? 'source-out' : 'source-over'
          
          // Rotate the origin
          // ctx.rotate(this.angle + options.rotate)
          ctx.rotate(this.angle)
          
          // Set transparency
          ctx.globalAlpha = Math.max(i / options.lines, 0.1);

          ctx.beginPath()
          ctx.moveTo(0, options.radius)
          ctx.lineTo(0, options.radius + options.length)
          ctx.stroke()
        }
        setTimeout(this.update.bind(this), this.speed)
      }
    },
    
    stop: function() {
      this.running = false
      v(this.canvas).remove()
    }
  })

  v.fn.spin = function(opts) {
    this.forEach(function(item) {
      if (item.spinner) {
        item.spinner.stop();
        delete item.spinner;
      }
      if (opts !== false) {
        item.spinner = new v.ui.Spinner(opts).spin(item);
      }
    });
    return this;
  };
})(vee)