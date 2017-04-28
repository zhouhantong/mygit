"use strict";
Page.ready(function($, query) {

  var rcmdcustid = query.id ? parseInt(query.id) : ''
  var type = query.type ? parseInt(query.type) : ''
  var from = query.from ? query.from : ''
  var preproject = query.project ? query.project : null
  var userinfo = query.userinfo
  var project = []
  var userObj
  var cusObj
  var usertype
  var cacheKey;
  
  return {

    options: {
      wx: true
    },

    onRender: function() {
      var page = this // 自动生成的代码

      cacheKey = app.session.openid + app.id + 'recommend-data';

      if (aha.isReady) {
        page.find(".address-book-layer").show()
        page.find(".info-layer").addClass("hasborder")
      }

      if (!from) {
        v.storage.remove(cacheKey)
      }

      if (preproject && preproject.projectname) {
        project.push({
          projectid: parseInt(preproject.projectid),
          projectname: preproject.projectname
        })
      }

      if (userinfo) {
        page.find('#mname').val(userinfo.name)
        page.find('#telnum').val(userinfo.mobile)
      }

      init();

      function init() {
        var list = [api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
          obj: {
            openid: app.session.openid
          }
        })];
        if (rcmdcustid) {
          list.push(api.request.get('/hfz/HfzTeamManageAction/getCustomerInfo', {
            obj: {
              id: rcmdcustid
            }
          }))
        }
        Promise.all(list).then(function(datas) {
          Page.setTitle('报备')
          userObj = datas[0].msg
          if (rcmdcustid) {
            page.find('.btn').text('确 定')
            cusObj = datas[1].msg
            initCache(cusObj)
          } else {
            if (!userObj.teammember) {
              if(aha.isReady){
                return ErrorPage.popup();
              }
              if (userObj.agent && userObj.agent.type != 3) {
                v.ui.alert('您还不是微店成员').then(function() {
                  Page.open('../consumer2/myhome.html', {
                    open: 1
                  }, true)
                })
              } else {
                v.ui.alert('您还不是注册经纪人').then(function() {
                  Page.open('../consumer2/register-agent.html', {}, true)
                });
              }
            } else if (userObj.team && userObj.team.state != 1) {
              if(aha.isReady){
                return ErrorPage.popup();
              }
              v.ui.alert('微店不是审核通过状态').then(function() {
                Page.open('../consumer2/myhome.html', {}, true)
              })
            }
            page.find('.rcmd-box .add-item').removeClass('hide')
            if (userObj.team && userObj.team.state == 1 && userObj.teammember && userObj.teammember.position == 1) {
              //队长
              usertype = 1
              page.find('.btn').text('一键报备')
            } else {
              Page.setTitle('推荐客户')
              usertype = 2
              page.find('.btn').text('推荐客户')
            }
            //缓存
            initCache();
          }
        });
      }

      function initCache(obj) {
        if (obj) {
          //编辑客户
          $('#mname').val(obj.name);
          $('#telnum').val(obj.mobile);
          $('#memo').val(obj.memo);
          $('#telnum').attr('disabled', 'disabled');
          obj.projectlist = obj.projectlist || []
          obj.projectlist.forEach(function(item) {
            page.tpl('project-item', item, page.find('.rcmd-box .list'))
          })
        } else {
          var data = v.storage.get(cacheKey);
          if (data) {
            var json = JSON.parse(data);
            $('#mname').val(json.name);
            $('#telnum').val(json.mobile);
            $('#memo').val(json.memo);
            project = json.project
            project.forEach(function(item) {
              page.tpl('project-item', item, page.find('.rcmd-box .list'))
            })
          } else {
            project.forEach(function(item) {
              page.tpl('project-item', item, page.find('.rcmd-box .list'))
            })
          }
        }
      }
    },
    isSpecialMobile: function(){
      return /^1[3-8]+\d{1}\*{4}\d{4}$/.test(
        String(mobile).replace(/^0+/g, '')
      );
    },
    report: function() {
      var name = $('#mname').val();
      var mobile = $('#telnum').val();
      var memo = $('#memo').val();
      if (!name || !mobile) {
        return v.ui.alert('姓名、电话为必填项');
      }

      if (usertype == 1) {
        if (!Fn.isMobile(mobile) && !this.isSpecialMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
      } else {
        if (!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
      }

      if (rcmdcustid) {
        //修改客户
        api.request.get("/hfz/HfzTeamManageAction/updRcmdCustomer", {
          obj: {
            id: rcmdcustid,
            name: name,
            memo: memo
          }
        }).then(function(response) {
          var msg = response.data;
          v.ui.alert('修改成功').then(function(){
            if(aha.isReady){
              Page.back();
            }else{
              Page.open('./cus-management.html', {
                type: type
              }, true)
            }
          });
        }).catch(e => {
          v.ui.alert(e.response.errmsg);
        });
      } else {
        //新增客户
        var ids = []
        var projectids
        project.forEach(function(item) {
          ids.push(item.projectid)
        })
        if (ids.length <= 0) {
          return v.ui.alert('请选择推荐项目');
        } else {
          projectids = ids.join(',')
        }

        if (usertype == 1) {
          // var action = '/hfz/HfzTeamManageAction/submitRcmdCustomer'
          var params = {
            mobile: mobile,
            name: name,
            memo: memo
          }
          submitCus(project, params, 1, function() {
            v.storage.remove(cacheKey)
            v.ui.alert('操作成功').then(function() {
              if(aha.isReady){
                Page.back();
              }else{
                Page.open('./cus-management.html', {
                  type: (usertype == 1 ? 1 : 0)
                }, true)
              }
            })
          })
        } else {
          var action = '/hfz/HfzTeamManageAction/rcmdCustomer'
          api.request.get({
            obj: {
              mobile: mobile,
              name: name,
              memo: memo,
              projectids: projectids
            }
          }, {
            action: action
          }).then(function(response) {
            var msg = response.data;
            v.storage.remove(cacheKey)
            v.ui.alert('操作成功').then(function() {
              if(aha.isReady){
                Page.back();
              }else{
                Page.open('./cus-management.html', {
                  type: (usertype == 1 ? 1 : 0)
                }, true)
              }
            });
          }).catch(e => {
            v.storage.remove(cacheKey)
            v.ui.alert(e.response.errmsg).then(() => Page.back());
          });
        }
      }

    },
    addProject: function() {
      var obj = {
        name: $('#mname').val(),
        mobile: $('#telnum').val(),
        memo: $('#memo').val(),
        project: project
      }
      v.storage.set(cacheKey, JSON.stringify(obj));
      Page.open('./cus-prolist.html', {
        fromsrc: 1
      }, true);
    },
    openAddressBook: function(event) {
      aha.selectContact().then(function(result) {
        var msg = result.msg;
        if (msg) {
          if (msg.name) {
            $('#mname').val(msg.name)
          }
          if (msg.mobile) {
            $('#telnum').val(msg.mobile)
          }
        }
      })
    }

  }
})