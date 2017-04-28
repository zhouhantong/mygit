"use strict";
Page.ready(function($, query) {

  return {
    name: 'wd-membermanager',

    options: {
      pagingEnabled: true
    },

    type: 0,

    onRender: function() {
      var self = this

      new IScroll(this.find('aside')[0]);

      api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function(response) {
        self.userObj = response.data
        if (!self.userObj.team) {
          v.ui.alert('您还没有开通微店').then(function() {
            Page.open('../consumer2/myhome.html')
          });
        }
        self.tpl('header-layer', self.userObj.team, self.find('.header-layer'))
        self.tpl('addcus-layer', {}, self.el)
        self.tpl('common-home-icon', {}, self.find('.vpage-content'))
        self.listEl = self.find('.list')
        self.cusListEl = self.find('.cus-list')
        self.setTypes()
        self.loadData()
      })
    },

    setTypes: function() {
      var self = this
      self.types = [{
        id: 1,
        name: '正式店员'
      }, {
        id: 2,
        name: '失效店员'
      }, {
        id: 3,
        name: '有关删除<br>店员说明'
      }];
      self.find('aside').style('top', '2.5rem')
      self.find('section').style('padding-top', '2.5rem')
      self.initTypes();
    },

    initTypes: function() {
      var self = this
      self.types.forEach(function(item, index) {
        $.createElements({
          classes: 'item' + (index == self.type ? ' selected' : '') + ((item.hasunread && index != self.type) ? ' hasbefore' : ''),
          html: item.name,
          onSingleTap: function() {
            var el = $(this)
            self.listEl.find('.item').removeClass('selected')
            el.addClass('selected')
            el.removeClass('hasbefore')
            self.type = index
            self.reloadData()
          }
        }, self.listEl)
      })
    },

    onPaging: function() {
      this.loadData()
    },

    loadData: function() {
      var self = this
      if (self.type == 0) {
        self.paging.setSize(10).start().then(function(paging) {
          var loadingEl = self.find('.loadding-bar')
          loadingEl.spin().text('')
          api.request.get('/hfz/HfzTeamManageAction/listMyTeamMember', {
            obj: {
              state: 1
            },
            offset: paging.count,
            size: paging.size
          }, {
            quiet: true
          }).then(function(result) {
            var data = result.data || []
              //列表
            data.list.forEach(function(item) {
              item.DELBTN = item.openid == app.session.openid
              item.HIDE = (item.memo && item.openid != app.session.openid)
              item.BZ = (item.openid != app.session.openid)
              self.tpl('item-layer', item, self.cusListEl)
            })
            paging.done(data.list.length, data.total)
              // paging.done(data.list.length, -1)
            loadingEl.spin(false).text('载入更多')
            if (!paging.hasMore) {
              loadingEl.spin().text('已加载全部')
            }
          })
        })
      } else if (self.type == 1) {
        self.paging.setSize(10).start().then(function(paging) {
          var loadingEl = self.find('.loadding-bar')
          loadingEl.spin().text('')
          api.request.get('/hfz/HfzTeamManageAction/listMyInvalidMember', {
            obj: {
              state: 2
            },
            offset: paging.count,
            size: paging.size
          }, {
            quiet: true
          }).then(function(result) {
            var data = result.data || []
              //列表
            data.list.forEach(function(item) {
              self.tpl('invalid-layer', v.mixin({
                reason: item.reason == 1 ? "已拒绝" : item.reason == 2 ? "已删除" : ""
              }, item), self.cusListEl)
            })
            paging.done(data.list.length, data.total)
              // paging.done(data.list.length, -1)
            loadingEl.spin(false).text('载入更多')
            if (!paging.hasMore) {
              loadingEl.spin().text('已加载全部')
            }
          })
        })
      } else if (self.type == 2) {
        self.find('.loadding-bar').spin().text('')
        self.tpl('del-layer', {}, self.cusListEl)
      }
    },

    reloadData: function() {
      var self = this
      self.paging.reset()
      self.cusListEl.empty()
      self.loadData()
    },

    del: function(event, id) {
      v.ui.confirm('您确定要删除该店员吗？').then(function(e) {
        if (e) {
          api.request.get("/hfz/HfzTeamManageAction/delTeamMember", {
            obj: {
              ids: parseInt(id)
            }
          }).then(function(response) {
            // var msg = response.data;
            $(event.target).closest('.item-layer').remove()
            return v.ui.alert('删除成功');
          }).catch(function (e) {
            v.ui.alert(e.response.errmsg);
          });
        }
      })
    },

    editMemo: function(event, id, memo) {
      var self = this
      v.$({
        classes: 'popup-appeal-layer',
        components: [{
          classes: 'appeal-layer',
          components: [{
            classes: 'appeal-title',
            text: '备注'
          }, {
            components: [{
              classes: 'view-layer',
              components: [{
                tag: 'label',
                text: '内容：'
              }, {
                tag: 'textarea',
                rows: '8',
                html: (memo ? memo : '')
              }]
            }]
          }, {
            classes: 'act-bar',
            components: [{
              text: '取消',
              onSingleTap: function() {
                $('.popup-appeal-layer').remove()
              }
            }, {
              text: '提交',
              onSingleTap: function(event) {
                event.stopPropagation();
                var content = $('textarea').val();
                if (!content) {
                  return v.ui.alert('内容不能为空');
                }
                $('.popup-appeal-layer').remove();
                api.request.get("/hfz/HfzTeamManageAction/updTeamMemberMemo", {
                  obj: {
                    id: parseInt(id),
                    memo: content
                  }
                }).then(function(response) {
                  v.ui.alert('操作成功').then(()=>{
                    self.reloadData()
                  })
                }).catch(e=>v.ui.alert(e.response.errmsg));
              }
            }]
          }]
        }]
      }, document.body);
    }
  }
})