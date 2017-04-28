v.ui.Carousel = v.EventTrigger.extend(function() {
  function _adjustCards(carousel, dx) {
    var width = carousel.el.width();

    if (carousel.mode == 'book') {
      carousel.leftEl.vendor('transform', 'translate3d(-' + (width - dx) + 'px, 0, 0)');
      carousel.centerEl.vendor('transform', 'translate3d(' + Math.min(dx, 0) + 'px, 0, 0)');
      carousel.rightEl.vendor('transform', 'translate3d(0, 0, 0)');
    } else {
      carousel.leftEl.vendor('transform', 'translate3d(-' + (width - dx) + 'px, 0, 0)');
      carousel.centerEl.vendor('transform', 'translate3d(' + dx + 'px, 0, 0)');
      carousel.rightEl.vendor('transform', 'translate3d(' + (width + dx) + 'px, 0, 0)');
    }

  }

  function _updateCard(carousel, side) {
    var el = carousel[side + 'El'];
    var index = carousel.index;
    if (side == 'left') {
      --index
    } else if (side == 'right') {
      ++index
    }

    if (_canSnap(carousel, index)) {
      carousel.trigger('update', {el: el, index: index})
      el.show()
    } else {
      el.hide()
    }

    carousel.leftEl.removeClass('active-card');
    carousel.rightEl.removeClass('active-card');
    carousel.centerEl.addClass('active-card');
  }

  function _go(carousel, dx, dir) {
    if (!_canSnap(carousel, carousel.index + dir)) {
      carousel.snapping = false;
      return;
    }

    var d = Math.abs(dir)
    carousel.index += dir;

    new v.Animator({
      startValue: dx,
      endValue: carousel.el.width() * d,
      onStep: function() {
        _adjustCards(carousel, this.value * -dir);
      }
    }).start().then(function() {
      var el = carousel.leftEl;
      if (dir < 0) {
        carousel.leftEl = carousel.rightEl;
        carousel.rightEl = carousel.centerEl;
        carousel.centerEl = el;
      } else {
        carousel.leftEl = carousel.centerEl;
        carousel.centerEl = carousel.rightEl;
        carousel.rightEl = el;
      }
      if (d > 1) {
        _updateCard(carousel, 'left');
        _updateCard(carousel, 'center');
        _updateCard(carousel, 'right');
      } else {
        _updateCard(carousel, dir < 0 ? 'left' : 'right');
      }

      carousel.leftEl.style('z-index', 3);
      carousel.centerEl.style('z-index', 2);
      carousel.rightEl.style('z-index', 1);

      _adjustCards(carousel, 0);

      carousel.snapping = false;

      carousel.trigger('snapEnd')
      carousel.trigger('change')
    });
  }

  function _back(carousel, dx, dir) {
    new $.Animator({
      endValue: dx,
      onStep: function() {
        _adjustCards(carousel, (dx - this.value) * -dir)
      }
    }).start().then(function() {
      _adjustCards(carousel, 0)
      carousel.snapping = false
      carousel.trigger('snapEnd')
    });
  }

  function _canSnap(carousel, index) {
    var custom = carousel.canSnap(index, carousel.index)
    // var index = carousel.index + dir
    return custom !== false && (carousel.wrap || (index >=0 && index < carousel.length))
  }

  return {
    init: function(options) {
      v.x(this, options, {
        length: 0,
        index: 0,
        scrollY: false,
        snapping: false, // protected
        dragging: false, // protected
        
        enabled: true,

        wrap: false, // 是否连续循环
        preventDefault: false,

        canSnap: v.nop
      })
    },

    render: function(container) {
      var style = 'position:absolute;left:0;right:0;top:0;bottom:0;z-index:';
      container.addClass('carousel-wrapper');
      container.style('overflow', 'hidden');
      v.$([3, 2, 1].map(function(z) {
        return { classes: 'carousel-card', style: style + z }
      }), container);

      var children = container.children('.carousel-card');

      v.x(this, {
        el: container,
        leftEl: $(children[0]),
        centerEl: $(children[1]),
        rightEl: $(children[2]),
      })

      _adjustCards(this, 0);

      _updateCard(this, 'left');
      _updateCard(this, 'center');
      _updateCard(this, 'right');

      this.trigger('change')

      var enabled = null
      var self = this
      container.on('touchmove', function() {
        return enabled !== true && !self.preventDefault;
      }).on('dragStart', function(event) {
        enabled = self.enabled && (self.scrollY || Math.abs(event.dx) > Math.abs(event.dy))
      }).on('drag', function(event) {
        if (enabled) {
          self.dragging = true;
          if (!self.snapping) {
            _adjustCards(self, event.dx);
          }
        }
      }).on('drop', function(event) {
        if (enabled && !self.snapping) {
          var width = self.el.rect().width;
          var dir = event.dx > 0 ? -1 : 1;
          var dx = Math.abs(event.dx);
          var pos = width / dx;

          if (dx != 0) {
            self.snapping = true;
            if (_canSnap(self, self.index + dir) && (pos <= 4 || event.timeStamp - event.timeStart < 200)) {
              _go(self, dx, dir);
            } else {
              _back(self, dx, dir);
            }
          }
        }
        enabled = null
        self.dragging = false;
      }).on('tap', function() {
        self.trigger('tap')
      });
      return self;
    },

    go: function(index) {
      if (index != this.index) {
        _go(this, 0, index - this.index);
      }
    },

    next: function() {
      this.snapping = true;
      _go(this, 0, 1);
    },

    prev: function() {
      this.snapping = true;
      _go(this, 0, -1);
    }
  }
})
