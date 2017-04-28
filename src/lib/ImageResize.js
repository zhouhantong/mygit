(function(context) {
  
  function adjustSize(w, h, W, H, C) {
    var c = C ? 'h' : '';
    if ((W && w > W) || (H && h > H)) {
      var r = w / h;
      if ((r >= 1 || H === 0) && W && !C) {
        w = W;
        h = (W / r) >> 0;
      } else if (C && r <= (W / H)) {
        w = W;
        h = (W / r) >> 0;
        c = 'w';
      } else {
        w = (H * r) >> 0;
        h = H;
      }
    }
    return {
      width: w,
      height: h,
      cropped: c
    };
  }
  
  function transformCoordinate(canvas, ctx, width, height, orientation) {
    if (orientation >= 5 && orientation <= 8) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
    switch (orientation) {
      case 1: // nothing
        break;
      case 2: // horizontal flip
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        break;
      case 3: // 180 rotate left
        ctx.translate(width, height);
        ctx.rotate(Math.PI);
        break;
      case 4: // vertical flip
        ctx.translate(0, height);
        ctx.scale(1, -1);
        break;
      case 5: // vertical flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.scale(1, -1);
        break;
      case 6: // 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(0, -height);
        break;
      case 7: // horizontal flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(width, -height);
        ctx.scale(-1, 1);
        break;
      case 8: // 90 rotate left
        ctx.rotate(-0.5 * Math.PI);
        ctx.translate(-width, 0);
        break;
      default:
        break;
    }
  }
  
  /**
   * Detect subsampling in loaded image.
   * In iOS, larger images than 2M pixels may be subsampled in rendering.
   */
  function detectSubsampling(img) {
    var iw = img.width,
        ih = img.height;
    if (iw * ih > 1048576) { // subsampling may happen over megapixel image
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, -iw + 1, 0);
      // subsampled image becomes half smaller in rendering size.
      // check alpha channel value to confirm image is covering edge pixel or not.
      // if alpha value is 0 image is not covering, hence subsampled.
      return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
    } else {
      return false;
    }
  }
  
  /**
   * Detecting vertical squash in loaded image.
   * Fixes a bug which squash image vertically while drawing into canvas for some images.
   */
  function detectVerticalSquash(img, iw, ih) {
    var canvas = document.createElement('canvas');
    canvas.width = iw;
    canvas.height = ih;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, iw, ih).data;
    // search image edge pixel position in case it is squashed vertically.
    var sy = 0;
    var ey = ih;
    var py = ih;
    var getAlpha = function(data, y) {
      var alpha;
      var x = 0
      while (x < iw && (alpha = data[(y * ih + x) * 4 + 3]) !== 0) {
        x++;
      }
      return alpha;
    };
    while (py > sy) {
      // var alpha = data[(py - 1) * 4 + 3];
      var alpha = getAlpha(data, py - 1);
      if (alpha === 0) {
        ey = py;
      } else {
        sy = py;
      }
      py = (ey + sy) >> 1;
    }
    var ratio = py / ih;
    return ratio === 0 ? 1 : ratio;
  }
  
  context.ImageResize = {
    defaults: {
      width: 300,
      height: 0,
      crop: false,
      quality: 80
    },
    
    getImage: function(file, options) {
      var self = this
      options = v.x(options || {}, self.defaults)
      return new Promise(function(resolve, reject) {
        var reader = new FileReader()
        reader.onloadend = function(e) {
          var dataURL = e.target.result;
          var img = new Image();
          img.onload = function(e) {
            EXIF.getData(img, function() {
              var data
              var orientation = img.exifdata.Orientation || 1;
              
              // CW or CCW ? replace width and height
              var size = (orientation >= 5 && orientation <= 8)
                      ? adjustSize(img.height, img.width, options.width, options.height, options.crop)
                      : adjustSize(img.width, img.height, options.width, options.height, options.crop);

              var iw = img.width, ih = img.height;
              var width = size.width, height = size.height;

              var canvas = document.createElement("canvas");
              var ctx = canvas.getContext("2d");

              var d = 1024; // size of tiling canvas
              var tmpCanvas = document.createElement('canvas');
              var tmpCtx = tmpCanvas.getContext('2d');
              var sy = 0;
              
              tmpCanvas.width = tmpCanvas.height = d;
              ctx.save();
              transformCoordinate(canvas, ctx, width, height, orientation);
              
              if (detectSubsampling(img)) {
                iw /= 2;
                ih /= 2;
              }
              
              var vertSquashRatio = detectVerticalSquash(img, iw, ih);
              
              while (sy < ih) {
                var sh = sy + d > ih ? ih - sy : d;
                var sx = 0;
                while (sx < iw) {
                  var sw = sx + d > iw ? iw - sx : d;
                  var dx = Math.floor(sx * width / iw);
                  var dw = Math.ceil(sw * width / iw);
                  var dy = Math.floor(sy * height / ih / vertSquashRatio);
                  var dh = Math.ceil(sh * height / ih / vertSquashRatio);
                  tmpCtx.clearRect(0, 0, d, d);
                  tmpCtx.drawImage(img, -sx, -sy);
                  ctx.drawImage(tmpCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
                  sx += d;
                }
                sy += d;
              }
              tmpCanvas = tmpCtx = null;
              ctx.restore();

              // if rotated width and height data replacing issue 
              var newcanvas = document.createElement('canvas');
              var x = size.cropped === 'h' ? (height - width) * .5 : 0;
              var y = size.cropped === 'w' ? (width - height) * .5 : 0;
              newcanvas.width = size.cropped === 'h' ? height : width;
              newcanvas.height = size.cropped === 'w' ? width : height;
              newcanvas.getContext('2d').drawImage(canvas, x, y, width, height);

              if (file.type === "image/png") {
                data = newcanvas.toDataURL(file.type);
              } else {
                data = newcanvas.toDataURL("image/jpeg", (options.quality * .01));
              }
              
              resolve({data: data, width: newcanvas.width, height: newcanvas.height})
              
              img = canvas = ctx = newcanvas = null;
            })
          }
          img.src = dataURL;
          dataURL = null
        }
        reader.readAsDataURL(file)
      })
    }
  }
  
  
})(this);
