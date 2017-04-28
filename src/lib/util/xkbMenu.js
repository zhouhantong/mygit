(function() {
  app.createXkbMenu = function(pid,url) {
    var list = {
      '评论': {name: 'comment', action:'./forum.html'},
      // '分享': {name: 'share', action:''},
      '房贷计算器': {name: 'fd', action:'./calculate.html'},
      '公众号': {name: 'add', action:''},
      '收藏': {name: 'favorite', action:'./favorites.html'}
    };  
    var items = [];
    v.each(list, function(value, key) {
      items.push({
        classes: 'main-menu-item-detail',
        flex: 1,
        dataAction: value.action,
        dataName: value.name,
        onTap: menuAction,
        components: [{
          classes: 'dbutton',
          components: [{          
            classes: 'icon ' + value.name,
            text: key
          }]
        }]
      });
    });
  
    $.createElements([{
      id: 'main-menu-detail',
      classes: 'hflexbox',
      onTouchmove: function() {
        return false;
      },
      components: items
    }], document.body);

    function menuAction(event) {
      event.stopPropagation();
      if($(this).data('name') == 'comment') {
        $$.addHistoryLog(pid,2);
        openUrl($(this).data('action'),{
          projectid: pid
        },false);
      }
      if($(this).data('name') == 'add') {
        $$.addHistoryLog(pid,11);
        if(url) {
          openUrl('./focus.html',{
            url: url
          },false);
          // $.createElements({
          //   classes: 'scrim',
          //   id: 'page-gz-add-xkb',
          // },'body');  
          (function() {
            $('#page-gz-add-xkb').remove();
            openUrl(url);
          }).defer(2000);
        } else {
          //判断是否关注
          // $$.api.getUserinfo(function() {
            if (!$$.api.isSubScr()) {
              openUrl($$.SUBS_URL);
            }else{
              //跳转到配置
              $.createElements({
                classes: 'scrim',
                id: 'page-gz-note-xkb',
                components: [{
                  classes: 'note-area-xkb',
                  components: [{
                    tag: 'img',
                    src: 'images/yang-yumen.png'
                  },{
                    classes: 'note-text',
                    text: '很抱歉，羊咩咩没能找到本项目官方微信号，我会继续努力的。'
                  },{
                    onTap: function() {
                      $('#page-gz-note-xkb').remove();
                    },
                    classes: 'close'
                  }]
                }]
              },'body'); 
              // $$.alert('很抱歉，羊咩咩没能找到本项目官方微信号，我会继续努力的：（');
              // return;
              // openUrl();
            }
          // });
        }
      }
      if($(this).data('name') == 'favorite') {
        api.addfavorite.get({projectid: pid}, {mask:false});
        openUrl($(this).data('action'));
      }
      if($(this).data('name') == 'share') {
        Fn.addHistoryLogh(pid,10);
        app.share.guideWxFriends();
      }  
      if($(this).data('name') == 'fd') {
        openUrl($(this).data('action'));
      }          
    }

  };
})();
