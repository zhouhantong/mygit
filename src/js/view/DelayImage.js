var DelayImage = View.extend(function() {
  var ready = false
  var views = {}
  var count = 0
  var concurrency = new Concurrency(4)
  
  var whiteList = [
    'res.ahasou.com', 'dev.res.ahasou.com', 
    'm.ahasou.com', 'dev.ahasou.com', 
    'ahasou.com'
  ]
  
  var imageLoading = false
  function onScroll() {
    if (imageLoading || count == 0) {
      return
    }
    imageLoading = true
    !function() {
      imageLoading = false
      v.each(views, function(view, id) {
        var el = view.el
        var context = view.context
        var src = el.data('src').trim()
        var rect = el.rect()
        if (src && rect.top < window.innerHeight) {
          // var loaderName = el.data('loader')
          // var loader = loaderName && v.isFunction(context[loaderName])
          //               ? context[loaderName]
          //               : loadImage
          // loader.call(context, el, src)
          concurrency.add(loadImage, [el, src])
          delete views[id]
          --count
        }
      })
    }.buffer(300)
  }
  
  function loadImage(data, next) {
    var el = data[0]
    var src = data[1]
    
    if (whiteList.indexOf(v.url.parse(src).hostname) >= 0) {
      return onImageLoad()
    }
    
    Image.load(src).then(onImageLoad).catch(next)
    
    function onImageLoad(image) {
      if (el[0].tagName == 'IMG') {
        el.attr('src', src)
      } else {
        el.style('background-image', 'url(' + src + ')')
      }
      next()
    }
  }
  
  return {
    viewInit: function(el, context) {
      if (!ready) {
        ready = true
        $(window).on('scroll', onScroll)
      }
      views[v.id()] = this
      ++count
      onScroll()
    }
  }
})