var H5Audio = Object.extend({
  
  init: function(file) {
    var EXP_HTTP  = /^(?:\.\/|\.\.\/|http:\/\/|https:\/\/|\/\/)/i;
    var audio = this.audio = new Audio();
    if (!EXP_HTTP.test(file)) {
      file = require.config.baseUrl + file;
    }
    audio.src = file;
    audio.load();
    
    if (v.env.mobile) {
      function fixOnMobile() {
        audio.load();
        $(document.body).off("touchstart", fixOnMobile);
      }
      $(document.body).on("touchstart", fixOnMobile);
    }
  },
  
  play: function() {
    this.audio.play();
  }
  
})