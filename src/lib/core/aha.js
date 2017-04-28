var aha = function(v) {

  var AHA_JSSDK
  if (v.env.aha) {
    if (v.env.ios) {
      AHA_JSSDK = window.webkit && webkit.messageHandlers && webkit.messageHandlers.__AHA_JSSDK
    } else if (v.env.android) {
      AHA_JSSDK = __AHA_JSSDK
    }
  }

  var EXP_URL = /^(?:(?:http|https|tel|mailto):)?\/\//i;

  var aha = {
    isReady: typeof AHA_JSSDK !== 'undefined',
    client: {
      notice: function() {
        var openApp = function(url) {
          var el = v.$({
            tag: 'iframe',
            style: 'display:none;',
            src: url
          }, document.body);
          ! function() {
            el.remove()
          }.defer(1000)
        }
        var downloadApp = function(url) {
          location.href = url
        }
        if (v.env.ios) {
          v.ui.alert('网页版不支持该功能，iOS版的APP客户端将很快为您送上。')
        } else if (v.env.android) {
          var dialog = new v.ui.Dialog().open({
            title: app.ui.title,
            classes: 'confirm-view',
            content: {
              text: '网页版不支持该功能，是否现在使用客户端？'
            },
            buttons: [{
              text: '取消',
              value: 0
            }, {
              text: '下载安装',
              value: 1
            }, {
              text: '打开',
              value: 2
            }],
            onButtonTapped: function(dialog, value) {
              if (value == 1) {
                openApp(app.client.dl.android)
              } else if (value == 2) {
                openApp(app.client.check.android)
              }
              dialog.close()
            }
          })
        }
      },

      createDownloadBar() {
        if(!aha.isReady && setting.client && setting.client.allowDownload){
          var body = v(document.body)
          body.addClass('show-client-download-bar')
          v.$({
            classes: 'client-download-bar',
            components: [
              {classes: 'button', tapHighlight: true, onSingleTap: function () {
                Page.open('client/download.html')
              }}
            ]
          }, body)
        }
      }
    },
    onShare: function (obj) {
      v(window).trigger('share-event', obj)
    }
  }

  var sdk = aha.isReady ? AHA_JSSDK : null

  var simulator = {
    openUrl: function(options) {
      var provider = options.provider
      if (!provider || provider !== '大众点评') {
        Page.open(options.url)
        return false
      }
      return true
    },
    getLocation: function(options) {
      v.geo.getCurrentPosition().then(function(position) {
        var coords = position.coords
        var latitude = coords.latitude
        var longitude = coords.longitude
        return v.geo.translateCoords(latitude, longitude)
      }).then(function(latLng) {
        return v.geo.getAddress(latLng.lat, latLng.lng)
      }).then(function(address) {
        DEBUG && console.debug(address);
        var detail = address.detail
        var location = detail.location
        var addressComponents = detail.addressComponents
        var result = {
          success: true,
          msg: v.x({
            address: detail.address,
            latitude: location.lat,
            longitude: location.lng
          }, addressComponents)
        }
        _success(result, options)
      }).catch(function(err) {
        _fail({
          success: false,
          msg: err.desc
        }, options)
      })
    },
    // addFavorite: function(options) {
    //   DEBUG && console.debug(options);
    // },
    previewImages: function(options) {
      if (v.env.wechat) {
        wechat.ready(function() {
          var urls = options.images.map(function(item) {
            return item.url
          })
          wechat.previewImage({
            urls: urls,
            current: urls[options.index]
          })
        })
      }
    },
    scan: function(options) {
      if (v.env.wechat) {
        wechat.ready(function() {
          wx.scanQRCode({
            needResult: 1,
            scanType: ["qrCode", "barCode"],
            success: function(res) {
              var text = res.resultStr;
              if (options.needResult == 1) {
                _success({
                  success: true,
                  msg: {
                    result: text
                  }
                })
              } else {
                if (EXP_URL.test(text)) {
                  Page.open(text)
                } else {
                  if (text) {
                    SearchHistory.add(text)
                    Page.open('search.html', {
                      word: text
                    })
                  }
                }
              }
            },
            fail: function(err) {
              _fail({
                success: false,
                msg: '扫描失败'
              })
            }
          });
        })
      } else {
        aha.client.notice()
      }
    },
    speech: function(options) {
      if (v.env.wechat) {
        wechat.ready(function() {
          var process = function(res) {
            dialog.close()
            wechat.translateVoice({
              localId: res.localId,
              success: function(res) {
                var text = res.translateResult.replace(/。$/, '');
                if (options.needResult == 1) {
                  _success({
                    success: true,
                    msg: {
                      result: text
                    }
                  })
                } else {
                  if (EXP_URL.test(text)) {
                    Page.open(text)
                  } else {
                    if (text) {
                      SearchHistory.add(text)
                      Page.open('search.html', {
                        word: text
                      })
                    }
                  }
                }
              },
              fail: function(err) {
                _fail({
                  success: false,
                  msg: '语音识别失败'
                })
              }
            });
          }
          var dialog = new v.ui.Dialog().open({
            // title: '倾听中',
            classes: 'speech-view',
            content: [{
              classes: 'text',
              text: '倾听中'
            }, {
              classes: 'image'
            }, {
              classes: 'btn-close',
              onSingleTap: function() {
                dialog.close()
                wechat.stopRecord({
                  success: v.nop
                })
              }
            }],
            buttons: [
              // {text: '取消', value: 0},
              {
                text: '说完了',
                value: 1
              }
            ],
            onButtonTapped: function(view, value) {
              if (value == 1) {
                wechat.stopRecord({
                  success: process
                })
              } else {
                dialog.close()
              }
            }
          })
          wechat.onVoiceRecordEnd({
            complete: process
          });
          wechat.startRecord({
            fail: function() {
              _fail({
                success: false,
                msg: '录音失败'
              })
              dialog.close()
            },
            cancel: function() {
              _fail({
                success: false,
                msg: '拒绝授权录音'
              })
              dialog.close()
            }
          })
        })
      } else {
        aha.client.notice()
      }
    }
  }

  function createCallback(fn) {
    var name = 'CB' + v.id()
    window[name] = fn
    return name
  }

  function _call(method, options) {
    if (sdk && v.env.ios) {
      options.__AHA__METHOD__NAME__ = method
      method = 'postMessage'
    }
    if (sdk && sdk[method]) {
      v.each(options, function(value, key) {
          if (v.isFunction(value)) {
            options[key] = createCallback(value)
          }
        })
        // aha.log(method, options)
      sdk[method](JSON.stringify(options))
    } else {
      var hasError = simulator[method] ? simulator[method](options) : true
      if (hasError) {
        DEBUG && aha.debug(method, JSON.stringify(options))
        aha.error('Aha JSSDK is not ready.')
        aha.client.notice()
      }
    }
  }

  function _success(result, options) {
    options.success && options.success(result)
    options.complete && options.complete(result)
  }

  function _fail(result, options) {
    options.fail && options.fail(result)
    options.complete && options.complete(result)
  }

  function _cancel(result, options) {
    options.cancel && options.cancel(result)
  }

  ;
  ['log', 'error', 'warn', 'debug'].forEach(function(name) {
    aha[name] = function() {
      if (DEVMODE) {
        if (v.env.aha) {
          v.ui.alert(Array.from(arguments).map(function(value) {
            try {
              return v.isObject(value) ? JSON.stringify(value) : value
            } catch (e) {
              return value
            }
          }).join(' '))
        } else {
          console[name].apply(console, arguments)
        }
      }
    }
  })

  ;
  ['getAppVersion', 'getSession', 'search', 'openUrl', 'previewImages',
    'scan', 'speech', 'fetchWeb', 'addFavorite', 'getLocation', 'callApi',
    'share', 'searchImageChooser', 'initShare',
    'openContact', 'openRecommendCustomer', 'selectContact',
    'historyBack'
  ].forEach(function(name) {
    aha[name] = function(options) {
      return new Promise(function(resolve, reject) {
        options = options || {}
        var complete = options.complete
        options.complete = function(result) {
          complete && complete(result)
          result.success ? resolve(result) : reject(result)
        }
        _call(name, options)
      })
    }
  });

  return aha
}(vee)