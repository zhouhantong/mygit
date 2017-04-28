(function () {

  var SPOTLIGHT_CLASS = 'spotlight-mask'

  var body = $(document.body)
  var promise = Promise.resolve()

  v.x(v.ui, {
    // 提示框
    alert: function (msg, title) {
      return promise = promise.then(function () {
        return new Promise(function (resolve, reject) {
          if (v.isObject(msg)) {
            try {
              msg = JSON.stringify(msg)
            } catch (e) {
              if(DEVMODE) v.ui.alert(e);
              msg = "";
            }
          }
          if (aha.isReady) {
            alert(msg)
            resolve()
          } else {
            new v.ui.Dialog().open({
              title: title || '提示',
              classes: 'alert-view',
              content: {text: msg},
              buttons: [
                {text: '好', value: 1}
              ],
              onButtonTapped: function (dialog, value) {
                resolve()
                dialog.close()
              }
            })
          }
        })
      })
      // alert(msg)
      // return Promise.resolve()
    },

    confirm: function (msg, title) {
      return promise = promise.then(function () {
        return new Promise(function (resolve, reject) {
          if (aha.isReady) {
            resolve(confirm(msg))
          } else {
            new v.ui.Dialog().open({
              title: title || app.ui.title,
              classes: 'confirm-view',
              content: {text: msg},
              buttons: [
                {text: '否', value: 0},
                {text: '是', value: 1}
              ],
              onButtonTapped: function (dialog, value) {
                resolve(value == 1)
                dialog.close()
              }
            })
          }
        })
      })
      // return Promise.resolve(confirm(msg))
    },

    prompt: function (text, defaultText) {
      return Promise.resolve(prompt(text, defaultText))
    },

    toast: function (text, duration) {
      var toast = new v.ui.Toast();
      toast.open({content: {text: text}, modal: false})
      !function () {
        toast.el.removeClass('animation-fly-up')
          .animation({opacity: 0})
          .then(function () {
            toast.close()
          })
      }.defer(duration || 3000)
    },

    spotlight: function (el) {
      if (el) {
        el = $(el)
        if (el.has()) {
          var rect = el.rect()
          var brect = $(document.body).rect()
          var top = rect.top + window.scrollY
          return v.$([
            {classes: SPOTLIGHT_CLASS, top: 0, left: 0, right: 0, height: top},
            {classes: SPOTLIGHT_CLASS, top: top, left: 0, height: rect.height, width: rect.left},
            {classes: SPOTLIGHT_CLASS, top: top, left: rect.left + rect.width, height: rect.height, right: 0},
            {
              classes: SPOTLIGHT_CLASS,
              top: top + rect.height,
              left: 0,
              height: brect.bottom - top - rect.height + window.scrollY,
              right: 0
            },
          ], body)
        }
      } else {
        body.children('.' + SPOTLIGHT_CLASS).remove()
      }
    }
  })

  // Popup View
  v.ui.Popup = Object.extend({

    init: function (options) {
      this.options = v.x(options || {}, {
        modal: true
      })
    },

    createView: function (options) {
      var self = this
      if (options.modal) {
        this.scrimEl = v.$({
          classes: 'scrim',
          style: 'opacity:0;z-index:' + (v.ui.z++)
        }, body)
        self.scrimEl.animation({opacity: 1})
      }

      var content = options.content || []
      if (!Array.isArray(content)) {
        content = [content]
      }

      this.el = v.$({
        classes: 'popup-view' + (options.classes ? ' ' + options.classes : ''),
        style: 'z-index:' + (v.ui.z++),
        left: options.x,
        top: options.y,
        components: content
      }, body)
    },

    open: function (options) {
      if (!this.el) {
        this.createView(v.x(options || {}, this.options))
      }
      return this
    },

    close: function () {
      var self = this
      if (this.scrimEl) {
        self.scrimEl.animation({opacity: 0}).then(function (data) {
          self.scrimEl.remove()
          self.scrimEl = null
        })
      }
      if (this.el) {
        this.el.remove()
        this.el = null
      }
    }

  })

  // Toast View
  v.ui.Toast = v.ui.Popup.extend({
    open: function (options) {
      if (!this.el) {
        this.super('open', arguments)
        this.el.addClass('toast-view')
          .addClass('animation-fly-up')
          .style('margin-left', '-' + this.el.rect().width / 2 + 'px')
      }
    }
  })

  // Dialog
  v.ui.Dialog = v.ui.Popup.extend({
    init: function (options) {
      this.super('init', arguments)
      this.updateOptions(options)
    },
    createView: function (options) {
      var content = options.content
      options.content = []
      this.super('createView', arguments)

      if (!Array.isArray(content)) {
        content = [content]
      }

      var self = this
      var el = this.el
      var buttons = options.buttons
      var hasButtons = buttons.length > 0
      v.$([
        options.title && {classes: 'title', text: options.title},
        {classes: 'content', components: content},
        hasButtons && {
          classes: 'buttons', components: buttons.map(function (button) {
            return {
              classes: 'button',
              text: button.text,
              dataValue: button.value,
              tapHighlight: true,
              onSingleTap: function (event) {
                options.onButtonTapped && options.onButtonTapped(self, button.value)
              }
            }
          })
        }
      ], el)

      if (hasButtons) {
        el.addClass('with-buttons')
      }

      el.addClass('dialog-view')
      var rect = el.rect()
      el.style('margin-left', '-' + rect.width / 2 + 'px')
        .style('margin-top', '-' + rect.height / 2 + 'px')
    },
    updateOptions: function (options) {
      v.x(this.options, options || {}, {
        title: '',
        content: [],
        buttons: []
      })
    }
  })
})()