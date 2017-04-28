var Widget = View.extend({

  viewInit: function(el, context) {
    var self = this
    var remote = el.data('remote')
    var message = el.data('message')
    if (remote) {
      DEBUG && console.debug('widget init with data from url: ' + remote);
      v.get(remote).then(function(data) {
        self.process(data.response, el, context)
      })
    } else if (message) {
      DEBUG && console.debug('widget init with message from iframe: ' + message);
      var id = v.id()
      var messageHandler = function(event) {
        var data = event.data
        if (id == data.iframeId) {
          DEBUG && console.debug(data);
          self.process(data.data, el, context)
          v('#' + data.iframeId).remove()
          v(window).off('message_widget', messageHandler)
        }
      }
      v.$({
        id: id,
        tag: 'iframe', 
        src: v.url.build({_id_: id}, message), 
        style: 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;'
      }, document.body)
      v(window).on('message_widget', messageHandler)
    }
  },
  
  process: function(data, el, context) {
    var prepare = function(data) {
      v.each(data, function(value, key) {
        if (key == 'components') {
          data[key] = value.map(function(item) {
            return prepare(item)
          })
        } else if (/^on/.test(key)) {
          delete data[key]
        }
      })
      return data
    }
    var json = prepare(data)
    if (json) {
      v.$(json, el).find('img').forEach(function(img) {
        img.onload = function() {
          context.pageResize()
        }
      }).initView(context)
      context.pageResize()
    }
  }
  
})