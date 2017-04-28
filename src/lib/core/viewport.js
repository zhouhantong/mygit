function viewportInit(viewWidth) {
  var html = $('html')
  var body = $(document.body);
  var screenWidth = screen.width
  var screenHeight = screen.height
  var sw = Math.min(screenWidth, screenHeight)
  var sh = Math.max(screenWidth, screenHeight)
  var documentElement = document.documentElement
  var clientWidth = documentElement.clientWidth
  var clientHeight = documentElement.clientHeight
  var ww = Math.min(clientWidth, clientHeight)
  var wh = Math.max(clientWidth, clientHeight)

	var ratio = v.env.screen.pixelRatio
  if (sw != ww && sh != wh) {
    sw /= ratio
    sh /= ratio
  }

  var originFontSize = +html.style('font-size').slice(0, -2)

  var android = v.env.android;

  // alert([sw, sh, ww, wh].join(' '))
  function viewport() {
    var width = Math.abs(window.orientation) == 90 ? sh : sw
    var scale = viewWidth ? (width / viewWidth) : 1
    var viewportSettings = [
			'width=device-width',
			// 'initial-scale=' + scale,
			// 'maximum-scale=' + scale,
      'initial-scale=1.0',
      'maximum-scale=1.0',
			'user-scalable=' + (android ? 0 : 'no')
		];
    var realFontSize = originFontSize * scale;

		v.ui.scale = scale
		html.data('base-px', originFontSize)
    html.data('real-px', realFontSize)

		if (android) {
			viewportSettings.push('target-densitydpi=' + (android > 4.3 ? 'medium' : 'device') + '-dpi')
		}
		// if (v.env.android && v.env.android <= 4.3 ||
		// 		v.env.ios && v.env.ios <= 6 || window !== top) {
			// width = Math.min(screenHeight, screenWidth)
			// viewportSettings[1] = 'initial-scale=1.0'
			// viewportSettings[2] = 'maximum-scale=1.0'
			html.style('font-size', realFontSize + 'px')
		// }
		$('meta[name=viewport]').attr('content', viewportSettings.join(','))
		width = document.body.offsetWidth;
  }

	v.each(v.env, function(value, key) {
		if (!v.isObject(value) && value) {
			body.addClass('env-' + key)
			if (value !== true) {
				var name = 'env-' + key + '-' + value
        body.addClass(name.replace(/\..*$/, ''))
				if (name.indexOf('.') >= 0) {
					body.addClass(name.replace('.', '-'))
				}
			}
		}
	});

	if (v.env.mobile) {
		viewport()
		if (!v.env.android || v.env.android > 4.3) {
			$(window).on('orientationchange', viewport)
		}
	} else {
		body.addClass('env-desktop')
	}
}