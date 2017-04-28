var QrCodeImage = View.extend({
  viewInit(el){
    var data = (el.data('obj') || "").trim();
    var type = parseInt(el.data('type')) | 1;
    var loadingColor = el.data('lColor') || "#ccc";
    var isImg = el[0].tagName == 'IMG';
    if (data) {
      if(!isImg){
        el.spin({color: loadingColor});
      }
      (function () {
        switch (type) {
          case 1:
          default:
            return '/global/Qrcode/getQRCodeByKey'.GET({
              obj: data
            }, {
              quiet: true
            })
        }
      })().then(src => {
        return Image.load(src);
      }).then(image => {
        if (isImg) {
          el.attr('src', image.src);
        } else {
          el.spin(false).remove();
          el.style({
            'background-image': 'url(' + image.src + ')',
            'background-size': 'cover'
          });
        }
      }).catch(e => {
        if (DEVMODE) v.ui.alert(e);
      })
    }
  }
})
