var DEBUG = true
var DEVMODE = true

!function () {
	var EXP_URL  = /^(?:\.{1,2}|(?:\w+:)?\/)\//i;
	var src = document.querySelectorAll('script[data-require]')[0].getAttribute('src');
	var baseUrl = src.substring(0, src.lastIndexOf('/') + 1);

	var hash = (Date.now() % 1679615).toString(36);
	var loadScript = function(filename) {
		var url = EXP_URL.test(filename) ? filename : baseUrl + filename
		document.write('<script src="' + url + '?_=' + hash + '"></script>')
	}

	loadScript('setting.js')

	loadScript('lib/core/vee.js')
	loadScript('lib/core/md5.js')
	loadScript('lib/core/spin.js')
	loadScript('lib/core/animation.js')
	loadScript('lib/core/Loading.js')
	loadScript('lib/core/viewport.js')
	loadScript('lib/core/core.js')
	loadScript('lib/core/aha.js')

	loadScript('lib/util/api.js')
	loadScript('lib/util/Dialog.js')
	loadScript('lib/util/geo.js')
	loadScript('lib/util/wechat.js')
	loadScript('lib/util/Concurrency.js')
	loadScript('lib/util/Carousel.js')
	loadScript('lib/util/Fn.js')
	loadScript('lib/util/xkbMenu.js')
	loadScript('lib/util/share.js')
	loadScript('lib/util/Grid.js')

	loadScript('app.js')

	loadScript('js/view/DelayImage.js')
	loadScript('js/view/MainTab.js')
	loadScript('js/view/TimeSelectLayer.js')
	loadScript('js/view/PopupSelectBox.js')
	loadScript('js/view/QrCodeImage.js')
	loadScript('js/view/ErrorPage.js')

	loadScript('js/model/User.js')

	var pageEl = document.querySelector('article.vpage')
	var controller = pageEl.getAttribute('controller')
	if (controller) {
		loadScript('./' + controller + '.js')
	} else if (location.pathname.match(/\/([\w\-\.]*)\.html/i)) {
		loadScript('./' + location.pathname.match(/\/([\w\-\.]*)\.html/i)[1] + '.js')
	} else {
		loadScript('./index.js')
	}

}()

