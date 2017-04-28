(function(global) {
  var EARTH_RADIUS = 6378245 //6371.004;//地球半径
  var CURRENT_POSITION_TIMEOUT = 10000
  var iframe
  var api

  v.geo = {
    distance: function(lat1, lng1, lat2, lng2) {
      var dLat = _rad(lat2 - lat1);
      var dLon = _rad(lng2 - lng1);
      var rLat1 = _rad(lat1);
      var rLat2 = _rad(lat2);

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var s = c * EARTH_RADIUS;
      return s;
    },
    
    getCurrentPosition: function() {
      return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var coords = position.coords
          var latitude = coords.latitude
          var longitude = coords.longitude
          DEBUG && console.debug('geo: ' + latitude + ', ' + longitude, position)
          resolve(position)
        }, function (err) {
          if (err && err.code) {
            switch (err.code) {
              case 1: // PERMISSION_DENIED (数值为1) 表示没有权限使用地理定位API
                err.desc = '没有权限获取您的位置信息，请同意我们使用您的当前位置信息，或者在设置中打开定位功能并确保浏览器拥有读取位置信息的权限'
                break;
              case 3: // TIMEOUT (数值为3) 表示超时
                err.desc = '获取到您的位置信息超时，请稍后重试'
                break;
              // case 2: // POSITION_UNAVAILABLE (数值为2) 表示无法确定设备的位置
              default:
                err.desc = '暂时无法获取到您的位置信息，请稍后重试'
                break;
            }
          }
          reject(err)
        }, {
          timeout: CURRENT_POSITION_TIMEOUT
        })
      })
    },
    
    getApi: function() {
      return new Promise(function(resolve, reject) {
        if (!api) {
          _createIFrame(function(qq) {
            api = qq
            resolve(api)
          })
        } else {
          resolve(api)
        }
      })
    },
    
    translateCoords: function(latitude, longitude) {
      return v.geo.getApi().then(function(api) {
        return new Promise(function(resolve, reject) {
          var latlng = new api.maps.LatLng(latitude, longitude)
          api.maps.convertor.translate(latlng, 1, function(res) {
            DEBUG && console.debug('geo: translateCoords', res[0]);
            resolve(res[0])
          })
        })
      })
    },
    
    getAddress: function(latitude, longitude) {
      return v.geo.getApi().then(function(api) {
        return new Promise(function(resolve, reject) {
          var geocoder = new api.maps.Geocoder({
            complete: function(result) {
              DEBUG && console.debug('geo: getAddress', result);
              resolve(result)
            }
          });
          var latLng = new api.maps.LatLng(latitude, longitude);
          geocoder.getAddress(latLng);
        })
      })
    }
  };

  function _rad(d) {
    return d * Math.PI / 180.0;
  }
  
  function _createIFrame(callback) {
    if (iframe) {
      _removeIFrame()
    }
    
    var name = v.id()
    var id = 'iframe' + name
    
    window['cb' + name] = callback
    
    window[name] = '<html><head></head>' +
        '<script charset="utf-8" src="http://map.qq.com/api/js?v=2.exp&libraries=convertor">' + decodeURIComponent('%3C%2Fscript%3E') +
        '<script>' +
        'function init() {' + 
          'delete parent.' + name + ';' +
          'var el = parent.document.getElementById("' + id + '");' +
          // 'setTimeout(function(){el.parentNode.removeChild(el);}, 3000);' +
          'parent.cb' + name + '(qq);' +
          'delete parent.cb' + name + ';' +
        '}' +
        decodeURIComponent('%3C%2Fscript%3E') + 
        '<body onload="init()"></body></html>';
    
    iframe = v.$({
      tag: 'iframe',
      id: id,
      width: 1,
      height: 1,
      top: -90000000,
      style: 'position:fixed;opacity:0',
      src: 'javascript:parent.' + name + ''
    }, document.body);
  }
  
  function _removeIFrame() {
    if (iframe) {
      iframe.remove()
      iframe = null
    }
  }
  
})(window);