(function () {
  app.share = {
    createButtons: function (parentNode, basic) {
      $.createElements({
        tag: 'ul',
        classes: 'share-bar',
        components: [{
          tag: 'li',
          classes: 'button-share friends',
          onTap: function () {
            _guideWxFriends();
          },
          text: '给大家'
        }, {
          tag: 'li',
          classes: 'button-share share',
          onTap: function () {
            _guideShare();
          },
          text: '给好友'
        }, {
          tag: 'li',
          classes: 'button-share add',
          onTap: function () {
            _guideAdd();
          },
          text: '关注我'
        }]
      }, parentNode);

      app.share.basic = basic || false;

      if ($.env.ios && app.share.basic) {
        $('.share-bar .friends').off('tap')[0].addEventListener('click', _guideWxFriends, false);
        $('.share-bar .share').off('tap')[0].addEventListener('click', _guideShare, false);
        $('.share-bar .add').off('tap')[0].addEventListener('click', _guideAdd, false);
      }
    },

    basic: false,

    guideWxFriends: _guideWxFriends,
    guideShare: _guideShare,
    guideAdd: _guideAdd,

    closeGuide: function () {
      var el = $('.guide-wxfriends');
      if (!el.length) {
        el = $('.guide-share');
      }
      if (el.length) {
        _close.call(el[0]);
      }
    }
  };

  function _guideWxFriends(text) {
    $.createElements({
      classes: 'vpopup guide-wxfriends',
      onTap: _close,
      onTouchstart: function () {
        return false;
      },
      components: [{
        classes: 'text1',
        html: ($.isString(text) ? text : '点击右上角的按钮')
      }, {
        classes: 'text2 ' + ($.isString(text) ? 'hide' : ''),
        html: '就可以分享到<span class="icon">朋友圈</span>哦！'
      }, {
        classes: 'mascot'
      }, {
        classes: 'heart'
      }]
    }, document.body);
    $(document.body).addClass('guide-blur');
    if ($.env.ios && app.share.basic) {
      $('.vpopup.guide-wxfriends').off('tap')[0].addEventListener('click', _close, false);
    }
  }

  function _guideShare() {
    $.createElements({
      classes: 'vpopup guide-share',
      onTap: _close,
      onTouchstart: function () {
        return false;
      },
      components: [{
        classes: 'text1',
        html: '点击右上角的<span class="icon"></span>按钮'
      }, {
        classes: 'text2',
        html: '就可以<span class="icon">发送</span>给小伙伴哦！'
      }, {
        classes: 'mascot'
      }, {
        classes: 'heart'
      }]
    }, document.body);
    $(document.body).addClass('guide-blur');
    if ($.env.ios && app.share.basic) {
      $('.vpopup.guide-share').off('tap')[0].addEventListener('click', _close, false);
    }
  }

  function _guideAdd() {
    openUrl(app.SUBS_URL);
  }

  function _close() {
    $(this).off('tap', _close).remove();
    if ($.env.ios && app.share.basic) {
      $(this).off('tap')[0].removeEventListener('click', _close, false);
      $(this).remove();
    }
    $(document.body).removeClass('guide-blur');
  }
})();
