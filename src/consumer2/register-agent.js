"use strict";
Page.ready(function($, query) {

  var ival

  return {
    name: 'register-agent',

    options: {
      // menu: true
      // pagingEnabled: true
    },

    totalLevel: 20,
    companyData: '',
    type: 1, //０-待定;1-中原员工;2-外部渠道员工;3-普通店员

    companyId: null,

    onRender: function() {
      var self = this

      var params = self.params
      self.type = (self.params.type ? self.params.type | 0 : 1)

      Page.setTitle(self.type == 3 ? '中原员工认证' : (self.type == 2 ? '申请渠道经纪人' : '申请中原经纪人'))

      api.request.get('/hfz/HfzChannelManageAction/getAppConfig').then(function(response) {
        self.data = response.data

        var formEl = self.tpl('form-layer', {
          CCHR: (self.data.cchr && self.type != 2),
          CEMPNO: self.type == 2,
          CANSHOW: self.type == 3
        }, '.vpage-content')

        for (var i = 2; i <= self.totalLevel; i++) {
          self.tpl('company-layer', {
            index: i
          }, formEl.find('.company-layer'))
        }

        self.tpl('reg-layer', {
          btntxt: (self.type == 3 ? '确认认证' : '提交')
        }, '.vpage-content')

        if (!self.data.cchr || self.type == 2) {
          self.find('.type-position > select').attr('disabled', 'disabled')
          self.find('select').on('change', function() {
            $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML)
          })
        }
        self.find('#telnum').on('input', function() {
          var mobile = $('#telnum').val();
          if (mobile) {
            clearInterval(ival)
            self.find('.btn-vericode').removeClass('disabled')
            self.find('.btn-vericode').html('获取验证码')
          }
        })
      })
    },

    async psbLoadData(el) {
      var preid = el.data('preid')
      var data = await '/hfz/HfzCompanyManageAction/layerCompany'.GET({
        obj: {
          preid: preid,
          type: (this.type == 2 ? 2 : 1)
        }
      })

      var list = data.list;
      if (list && list.length && preid == '0') {
        this.companyData = list
      }

      return Promise.resolve(list.map(item => ({
        value: item.id,
        label: item.name
      })))
    },

    psbSelect(el, value, label) {
      el.find('.text-value').text(label)
      var self = this
      var index = el.data('index') | 0
      self.find('.type-position > select').removeAttr('disabled')
      self.companyId = value

      self.resetSelectBox(value, index + 1)

      if (index == 1) {
        self.find('.type-position > select').empty()
        self.find('.type-position .text-value').html('请选择职位')
        self.companyData.forEach(function(item, index) {
          if (item.id == value) {
            self.createAgentPostion(item.type)
          }
        })
      }
    },

    resetSelectBox(preid, index) {
      var el = this.find(`.select-company-${index}`)
      el.data('preid', preid).hide()
      el.find('.text-value').html('请选择部门')
      '/hfz/HfzCompanyManageAction/layerCompany'.GET({
        obj: {
          preid: preid,
          type: (this.type == 2 ? 2 : 1)
        }
      }).then(data => {
        var list = data.list;
        if (list && list.length) {
          el.show()
          this.view(el).list = list.map(item => ({
            value: item.id,
            label: item.name
          }));
        }
      })

      for (var i = index + 1; i <= this.totalLevel; i++) {
        this.find(`.select-company-${i}`).hide().data('preid', '')
        this.find(`.select-company-${i} .text-value`).html('请选择部门')
      }
    },

    createAgentPostion: function(type) {
      api.request.quiet().get("/hfz/HfzChannelManageAction/listCompanyPosition", {
        obj: {
          type
        }
      }).then(function(response) {
        var msg = response.data
        if (msg.total) {
          msg.list.unshift({
            id: '',
            name: ''
          })
          $.createElements(msg.list.map(function(item, index) {
            return {
              tag: 'option',
              value: item.id,
              text: item.name
            }
          }), '.type-position > select')
        }
      })
    },

    getVericode: function() {
      var self = this
      if (self.find('.btn-vericode').hasClass('disabled')) {
        return
      }
      var count = 60
      var mobile = $('#telnum').val()
      if (Fn.isMobile(mobile)) {
        self.find('.btn-vericode').addClass('disabled')
        ival = window.setInterval(function() {
          self.find('.btn-vericode').html(count + '秒后重新获取')
          if (count <= 0) {
            count = 59
            clearInterval(ival)
            self.find('.btn-vericode').removeClass('disabled')
            self.find('.btn-vericode').html('获取验证码')
          } else {
            count--
          }
        }, 1000)
        api.request.get("/global/App/getHfzVericode", {
          mobile: mobile
        }).then(function(response) {
          v.ui.alert('验证码已通过短信发送到您的手机，稍等一会儿哦')
        })
      } else if (mobile) {
        v.ui.alert('请输入正确的手机号码')
      } else {
        v.ui.alert('请输入您的手机号码')
      }
    },

    register: function() {
      var self = this
      var name = self.find('#mname').val()
      var mobile = self.find('#telnum').val()
      var cempno = self.find('#cempno').val()
      var vericode = self.find('#vericode').val()
      var position = self.find('.type-position select')[0].value
      var companyid = self.companyId
        // for (var i = 1; i <= self.totalLevel; i++) {
        //   var value = self.find(`.select-company-${i} >  select`)[0].value
        //   if (value) {
        //     companyid = value
        //   }
        // }
      if (!name) {
        return v.ui.alert('请输入姓名');
      }
      if (!cempno && self.type != 2) {
        return v.ui.alert('请输入员工号');
      }
      if (!self.data.cchr || self.type == 2) {
        if (!companyid) {
          return v.ui.alert('请选择部门');
        }
        if (!position) {
          return v.ui.alert('请选择职位');
        }
      }
      if (self.type != 3) {
        if (!mobile) {
          return v.ui.alert('请输入手机号');
        }
        if (!vericode) {
          return v.ui.alert('请输入验证码');
        }
        if (!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        app.session.vericode = vericode
      }
      var params = {
        type: self.type,
        name: name
      }
      if (mobile) params.mobile = mobile
      if (cempno) params.cempno = cempno
      if (position) params.position = position
      if (companyid) params.companyid = companyid
      self.action = (self.type == 3 ? '/hfz/HfzChannelManageAction/cchrAuthentication' : '/hfz/HfzChannelManageAction/addAgent')
      api.request.get(self.action, {
        obj: params
      }).then(function(response) {
        var noteMsg = '操作成功';
        if (self.type == 3) {
          noteMsg = response.data.msg || noteMsg
        }
        v.ui.alert(noteMsg).then(function() {
          Page.open('./myhome.html', {}, true);
        })
      }).catch(e => v.ui.alert(e.response.errmsg));
    }
  }
})