var Fn = (function () {

  function formatDate(format) {
    return (time => new Date(time).format(format))
  }

  return {
    getPassport(openid){
      if (DEVMODE) {
        return v.post("http://htfw.dev.wx.webhante.com/qc-webapp/qcapi.do", {
          j: JSON.stringify({
            openid: app.session.openid,
            passport: app.session.passport,
            action: "/global/App/getPassport",
            requestParam: {
              key: "wkelawer234",
              openid: openid
            }
          })
        }).then(e=>e.response.obj)
      }
      return Promise.resolve(openid);
    },
    isMobile(mobile) {
      return /^0*1[3-8]+\d{9}$/.test('' + mobile)
    },
    simpleRecoverMobile(mobile){
      return Fn.recoverMobile(mobile, "*", 3, 4);
    },
    recoverMobile(mobile, symbol, start, len){
      symbol = symbol || "*";
      start = start || 3;
      len = len || 4;
      var m = mobile.substring(0, start);
      var n = mobile.substring(start);
      for (var i = 0; i < len; i++) {
        m += symbol;
      }
      return m + n;
    },
    isInArray(array, obj) {
      return Array.isArray(array) && array.includes(obj)
    },
    addHistoryLog(projectId, partid) {
      api.addlog.get({
        projectid: projectId,
        partid: partid
      }, {
        mask: false
      });
    },
    getClassName(obj, classname) {
      return obj ? " " + classname : ""
    },
    getHideClassName(obj) {
      return Fn.getClassName(obj, "hide");
    },
    getHostName() {
      var host
      var url = app.API_URL
      var regex = /.*\:\/\/([^\/]*).*/;
      var match = url.match(regex);
      if (typeof match != "undefined" && null != match)
        host = match[1]
      if (host == undefined || host == null)
        host = location.host
      return host
    },
    getPicUrl(url) {
      if (!url) {
        return ""
      }
      if (url.indexOf('http://') >= 0) {
        return url
      } else {
        return 'http://' + Fn.getHostName() + url
      }
    },
    getTime: formatDate('yyyy-mm-dd'),
    getTime2: formatDate('yyyy.mm.dd'),
    getFullTime: formatDate('yyyy-mm-dd HH:ii:ss'),
    shareLink() {
      var link = app.SHARE_LINK
      if (!link) {
        var q = v.x({}, v.url.query());
        if (q.wechatUserInfo || q.cmd || q.fake) {
          if (q.wechatUserInfo) {
            delete q.wechatUserInfo;
          }
          if (q.cmd) {
            delete q.cmd;
          }
          if (q.fake) {
            delete q.fake;
          }
        }
        link = v.url.build(q)
      }
      if (!v.env.wechat) {
        return link;
      }
      return Fn.getWechatLink(link);
    },
    getWechatLink(link) {
      return v.url.build({}, v.tpl(setting.share.url, {
        url: v.url.encode(link),
        openid: app.session.openid,
        appid: setting.appid
      }, ''))
    },
    add(arg1, arg2) {
      arg1 = arg1 || 0;
      arg2 = arg2 || 0;
      var len = arguments.length;
      var r1, r2, m, c;
      try {
        r1 = arg1.toString().split(".")[1].length;
      } catch (e) {
        r1 = 0;
      }
      try {
        r2 = arg2.toString().split(".")[1].length;
      } catch (e) {
        r2 = 0;
      }
      c = Math.abs(r1 - r2);
      m = Math.pow(10, Math.max(r1, r2));
      if (c > 0) {
        var cm = Math.pow(10, c);
        if (r1 > r2) {
          arg1 = Number(arg1.toString().replace(".", ""));
          arg2 = Number(arg2.toString().replace(".", "")) * cm;
        } else {
          arg1 = Number(arg1.toString().replace(".", "")) * cm;
          arg2 = Number(arg2.toString().replace(".", ""));
        }
      } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
      }
      var result = (arg1 + arg2) / m;
      if (len > 2) {
        return Number.add.apply(this, [result].concat(arguments.toArray().slice(2)))
      } else {
        return result;
      }
    },
    sub(arg1, arg2) {
      arg1 = arg1 || 0;
      arg2 = arg2 || 0;
      var len = arguments.length;
      var r1, r2, m, n;
      try {
        r1 = arg1.toString().split(".")[1].length;
      } catch (e) {
        r1 = 0;
      }
      try {
        r2 = arg2.toString().split(".")[1].length;
      } catch (e) {
        r2 = 0;
      }
      m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
      n = (r1 >= r2) ? r1 : r2;
      var result = Number(((arg1 * m - arg2 * m) / m).toFixed(n));
      if (len > 2) {
        return Number.sub.apply(this, [result].concat(arguments.toArray().slice(2)))
      } else {
        return result;
      }
    },
    mul(arg1, arg2) {
      arg1 = arg1 || 0;
      arg2 = arg2 || 0;
      var len = arguments.length;
      var m = 0,
        s1 = arg1.toString(),
        s2 = arg2.toString();
      try {
        m += s1.split(".")[1].length;
      } catch (e) {
      }
      try {
        m += s2.split(".")[1].length;
      } catch (e) {
      }
      var result = Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
      if (len > 2) {
        return Number.mul.apply(this, [result].concat(arguments.toArray().slice(2)))
      } else {
        return result;
      }
    },
    div(arg1, arg2) {
      arg1 = arg1 || 0;
      arg2 = arg2 || 0;
      var len = arguments.length;
      var t1 = 0,
        t2 = 0,
        r1, r2;
      try {
        t1 = arg1.toString().split(".")[1].length;
      } catch (e) {
      }
      try {
        t2 = arg2.toString().split(".")[1].length;
      } catch (e) {
      }
      r1 = Number(arg1.toString().replace(".", ""));
      r2 = Number(arg2.toString().replace(".", ""));
      var result = (r1 / r2) * Math.pow(10, t2 - t1);
      if (len > 2) {
        return Number.div.apply(this, [result].concat(arguments.toArray().slice(2)))
      } else {
        return result;
      }
    },
    getDynShortUrl(url){
      return Promise.resolve(url);
      //TODO 还未生效暂时关闭
      // var cacheKey = md5(`shortUrl-${url}-${app.session.openid}`);
      // if (cacheKey) {
      //   var cache = v.cache.get(cacheKey);
      //   if (cache) {
      //     return Promise.resolve(cache);
      //   }
      // }
      // return "/global/App/getDynShortUrl".POST({
      //   obj: url
      // }).then(function (url) {
      //   v.cache.set(cacheKey, url, 60 * 60);
      //   return Promise.resolve(url);
      // }).catch(function (e) {
      //   if (DEVMODE) v.ui.alert(e.errmsg);
      //   return Promise.resolve(url);
      // })
    },
    getImageData(data){
      return data && /^data:image/i.test(data) && data.substring(data.indexOf(',') + 1);
    },
    getImageBase64(width, height, image, imgScroller, center, compress, bgColor, origin){

      var opts = {};

      if(v.isObject(width)){
        opts = v.x({}, opts, width)
      }else{
        opts = {
          width: width,
          height: height,
          image: image,
          imgScroller: imgScroller,
          center: center,
          compress: compress,
          bgColor: bgColor,
          origin: origin
        };
      }
      
      var scale = opts.image.width / opts.width;
      var offset = -opts.imgScroller.y * scale * 2
      var inch = opts.width / opts.height;
      var offsetY = 0;
      compress = opts.compress | 1;

      var canvas = document.createElement('canvas')
      var context = canvas.getContext('2d')

      opts.width = Math.min(opts.image.width, opts.width * scale) | 0
      opts.height = Math.min(opts.image.height, opts.height * scale) | 0

      var canvasHeight = opts.origin ? opts.height : (opts.width / inch);

      canvas.width = opts.width
      canvas.height = canvasHeight;
      context.fillStyle = opts.bgColor || '#fff'
      context.fillRect(0, 0, opts.width, canvasHeight)

      if(canvasHeight > opts.height && opts.center){
        offsetY = (canvasHeight - opts.height) / 2 | 0;
      }

      context.drawImage(opts.image, 0, offset, opts.width, opts.height,
                               0, offsetY, opts.width, opts.height)

      if(opts.covers && opts.covers.length > 0){
        opts.covers.forEach(function(item){
          context.drawImage(
            item.image,
            item.x || 0,
            item.y || 0,
            item.width || canvas.width,
            item.height || canvas.height
          );
        })
      }
      
      var data = canvas.toDataURL("image/jpeg", opts.compress);
      return Fn.getImageData(data)
    },
    random(min, max) {
      var rand = Math.floor(min + Math.random() * (max - min));
      rand = isNaN(rand) ? (function(a, b) {
        $.defined(b) || (b = a, a = 0);
        var c = b - a,
          e = Math.random();
        return a + e * c | 0
      })(min || 9999999) : rand;
      return rand;
    }
  }
})()