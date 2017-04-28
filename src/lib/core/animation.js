(function(v) {
  function parseDest(name, value) {
    var mode = ''
    if (v.isString(value)) {
      value = value.trim()
      if (EXP_DEC.test(value)) {
        mode = 'dec'
        value = +value.substring(2)
      } else if (EXP_INC.test(value)) {
        mode = 'inc'
        value = +value.substring(2)
      } else if (EXP_COLOR.test(value)) {
        mode = 'color'
        value = parseColor(value)
      }
    }
    return {value: value, mode: mode}
  }
  
  function hex2dec(str) {
    return parseInt(str, 16)
  }
  function parseColor(str) {
    str = str.replace(/\s/g, '')
    if (str == 'transparent') {
      return [0, 0, 0, 0]
    } if (/^#/.test(str)) {
      if (str.length == 4) {
        return [hex2dec(str[1] + str[1]), hex2dec(str[2] + str[2]), hex2dec(str[3] + str[3]), 1]
      }
      return [hex2dec(str[1] + str[2]), hex2dec(str[3] + str[4]), hex2dec(str[5] + str[6]), 1]
    } else if (/^rgba?\((.*?)\)/.test(str)) {
      var result = RegExp.$1.split(',').map(function(value, index) {
        return +value
      })
      if (result.length < 4) {
        result.push(1)
      }
      return result
    }
    return [0, 0, 0, 1]
  }
  function toColor(color) {
    return 'rgba(' + (color[0] | 0) + ',' + (color[1] | 0) + ',' + (color[2] | 0) + ',' + color[3] + ')'
  }
  
  var EXP_SIZE = /^(left|right|top|bottom|width|height)$/
  var EXP_SIZE2 = /(Left|Right|Top|Bottom|Width|Height)$/
  var EXP_NUMBER = /^opacity$/
  var EXP_COLOR = /^(#[0-9a-z]{3}|#[0-9a-z]{6}|rgba?\(.*?\))$/i
  var EXP_INC = /^\+\=/
  var EXP_DEC = /^\-\=/
  
  v.fn.animation = function(dest, options) {
    var self = this
    var source = []
    
    options = options || {}
    
    dest = v.map(dest, function(value, name) {
      return parseDest(name, value)
    })
    
    self.forEach(function(element, index) {
      var el = $(element)
      var src = source[index] = {}
      v.each(dest, function(value, key) {
        var style = el.style(key)
        if (EXP_SIZE.test(key) || EXP_SIZE2.test(key)) {
          src[key] = +style.slice(0, -2) || 0
        } else if (EXP_NUMBER.test(key)) {
          src[key] = +style
        } else if (value.mode == 'color') {
          src[key] = parseColor(style)
        }
      })
    })
    
    return new v.Animator({
      duration: options.duration,
      easing: options.easing,
      reversed: options.reversed,
      onStep: function(step) {
        self.forEach(function(element, index) {
          var el = $(element)
          v.each(source[index], function(value, key) {
            var d = dest[key]
            switch (d.mode) {
              case 'dec':
                value -= step * d.value
                break
              case 'inc':
                value += step * d.value
                break
              case 'color':
                var color = [0, 0, 0, 1]
                for (var i = 0; i < 4; i++) {
                  color[i] = value[i] + step * (d.value[i] - value[i])
                }
                el.style(key, toColor(color))
                break;
              default:
                value += step * (d.value - value)
            }
            if (EXP_SIZE.test(key) || EXP_SIZE2.test(key)) {
              el.style(key, Math.round(value) + 'px')
            } else {
              el.style(key, value)
            }
          })
        })
        options.onStep && options.onStep.call(self, step)
      }
    }).start()
  }
})(vee)