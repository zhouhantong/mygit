/**
 * Created by cator on 7/28/16.
 */

var PopupSelectBox = View.extend({

  viewInit: function(el, context) {
    el.addClass('popup-select-box')

    el.singleTap(this.popup.bind(this))
  },

  popup: function () {
    function inputChanged(event) {
      var text = $(event.target).val()
      v('.psb-popup-wrapper li.row').forEach(function (item) {
        var el = $(item);
        var label = el.data('label')
        if (!text || label.indexOf(text) >= 0) {
          el.show()
        } else {
          el.hide()
        }
      })
    }

    function selectFn(event) {
      var el = $(event.target)
      var value = el.data('value')
      var label = el.data('label')
      var callback = self.context.psbSelect
      if (v.isFunction(callback)) {
        callback.bind(self.context)(self.el, value, label)
      }
      self.close()
    }

    var self = this
    var loader = this.context.psbLoadData
    if (this.list) {
      loader = Promise.resolve(this.list)
    } else if (loader) {
      loader = loader.bind(this.context)(this.el)
    } else {
      loader = Promise.resolve([])
    }
    loader.then(function(data) {
      self.list = data
      var el = v.$(
        {classes: 'psb-popup-wrapper', style: `z-index:${++v.ui.z}`, components: [
          {classes: 'psb-input-wrapper', components: [
            {tag: 'input', placeholder: '请输入筛选文字', onInput: inputChanged},
            {tag: 'button', text: '取消', onSingleTap: function(event) {
              self.close()
            }}
          ]},
          {classes: 'psb-table-wrapper', tag: 'ul', components: data.map(function (item) {
            return {
              classes: 'row',
              tag: 'li',
              text: item.label,
              dataLabel: item.label,
              dataValue: item.value,
              tapHighlight: true,
              onSingleTap: selectFn
            }
          })}
        ]},
        document.body
      )
      el.find('button')[0].focus()
    })
  },

  close: function () {
    var el = v('.psb-popup-wrapper')
    el.animation({opacity: 0}).then(function () {
      el.remove()
    })
  }

})
