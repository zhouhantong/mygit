// 载入等待界面
v.ui.Loading = {
  done: true,
  times: 0,
  timer: null,
  start: function() {
    this.times++;
    if (this.done) {
      this.done = false;
      if (this.timer) {
        clearTimeout(this.timer);
      } else {
        this.el = $.$({
          classes: 'scrim loading-view',
          style: 'z-index:' + 9e9
        }, document.body);
        this.el.spin({color: '#fff'})
      }
    }
  },
  stop: function() {
    var self = this;
    if (!self.done) {
      self.times--;
      if (self.times === 0 && self.el) {
        self.done = true;
        self.timer = function() {
          self.el.spin(false).remove();
          self.el = self.timer = null;
        }.defer(100);
      }
    }
  }
}