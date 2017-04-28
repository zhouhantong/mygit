"use strict";
Page.ready(function ($, query) {

  var page
  var projectid = query.projectid ? parseInt(query.projectid) : ''
  var projectname = query.projectname
  var type = query.type ? parseInt(query.type) : 0

  var types
  var status = ['报备', '未知', '到访', '未知', '未知', '成交', '未知', '无效成交']
  var dfid = ''
  var popup

  var listEl
  var cusListEl
  var searchEl

  return {
    name: 'cus-management',

    options: {
      wx: true,
      pagingEnabled: true
    },

    onRender: function () {
      page = this // 自动生成的代码
      popup = $('.appointment-popup2')

      //设置左侧滑动
      new IScroll(page.find('aside')[0]);

      listEl = page.find('.list');
      cusListEl = page.find('.cus-list');
      searchEl = $('#search');

      // var list = [{
      //       action: "/hfz/HfzChannelManageAction/getRegisterInfo",
      //       params: {
      //         obj: {
      //           openid: app.session.openid
      //         }
      //       }
      //     },{
      //       action: '/hfz/HfzTeamManageAction/getNewCustCnt'
      //     }];
      // Page.magic({
      //   list: list
      // }).then(function(datas){
      //   userObj = datas[0].msg
      //   numObj = datas[1].msg
      //   if(userObj.team && userObj.team.state == 3) {
      //     teamState = false
      //   }
      //   if(userObj.team && (userObj.team.state == 1 || userObj.team.state == 3) && userObj.teammember && userObj.teammember.position == 1) {
      //     //队长
      //     usertype = 1
      //   }else {
      //     usertype = 2
      //   }
      this.setTypes();
      // });


      //搜素
      page.find('.searchbt').singleTap(function () {
        page.paging.reset().load();
      });


      popup.find('.cancel').singleTap(function () {
        popup.addClass('hide');
      });


      popup.find('.submit').singleTap(function () {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();

        if (!name || !mobile) {
          return v.ui.alert('所有项均为必填项');
        }
        if (!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }

        var parames = {
          obj: {
            ids: dfid,
            state: 2,
            guidename: name,
            guidemobile: mobile
          }
        };

        api.request.get("/hfz/HfzCustomerAction/updCustomerState", parames).then(function (response) {
          $('#mname').val('');
          $('#telnum').val('');
          popup.addClass('hide');
          v.ui.alert('操作成功');
          !function () {
            page.paging.reset().load()
          }.defer(1000)
        });
      });

    },

    setTypes: function () {
      page.find('.topheader').text(projectname)
      page.find('aside').style('top', '2.5em')
      page.find('.search-panel').style('top', '2.5em')
      this.wrapperEl.style('padding-top', '5em')
      types = [
        {type: 0, name: '待处理'},
        {type: 1, name: '已审核'},
        {type: 2, name: '已到访'},
        {type: 3, name: '已成交'},
        {type: 4, name: '无效客户'},
        {type: 5, name: '公告'}
      ];
      //初始化状态列表
      this.initTypes();
    },

    initTypes: function () {
      types.forEach(function (item, index) {
        $.createElements({
          classes: 'item' + (item.type == type ? ' selected' : ''),
          html: item.name,
          onSingleTap: function () {
            var el = $(this)
            listEl.find('.item').removeClass('selected')
            el.addClass('selected')
            el.removeClass('hasbefore')
            type = item.type
            if (type == 5) {
              page.showProInfo();
            } else {
              page.wrapperEl.style('padding-top', '5em')
              page.paging.reset().load()
            }
          }
        }, listEl)
      })
      if (type == 5) {
        this.showProInfo();
      } else {
        this.paging.reset().load()
      }
    },

    onPaging: function (paging) {
      page.find('.search-panel').removeClass("hide");
      page.find('.proinfo').empty();
      var search = searchEl.val()

      if (paging.isFirst()) {
        cusListEl.empty()
      }

      var action = '/hfz/HfzChannelManageAction/listCustomer';
      var params = {
        mode: 'SALER',
        projectid: projectid
      };

      switch (type) {
        case 0:
          action = '/hfz/HfzTeamManageAction/listMyTodayCustomer';
          delete params.mode
          params.approvestate = 0
          break;
        case 1:
          params.state = 0
          break;
        case 2:
          params.state = 2
          break;
        case 3:
          params.state = 5
          break;
        case 4:
          params.approvestate = -1
          break;
      }

      if (search) {
        params.keyword = search
      }

      paging.start().then(function (paging) {
        api.request.get(action, {
          obj: params,
          offset: paging.count,
          size: paging.size
        }).then(function (response) {
          var obj = response.data
          paging.done(obj.list.length, obj.total)

          if (obj.total == 0) {
            page.tpl("noitem", {}, cusListEl);
            return;
          }
          obj.list.forEach(function (item) {
            if(item.companyid1name && item.companyname) {
              item.deptname = (item.companyid1name != item.companyname ? item.companyid1name + '-' + item.companyname : item.companyname)              
            }else if(item.companyid1name || item.companyname) {
              item.deptname = item.companyid1name || item.companyname
            }else {
              item.deptname = ''
            }            
            switch (type) {
              case 0:
                item.ITEM1 = true;
                item.ITEM2 = true;
                item.ITEM3 = true;
                item.FZBBXX = true;
                item.YZFKFS = true;
                item.YX = true;
                item.WX = true;
                break;
              case 1:
                item.ITEM1 = true;
                item.ITEM2 = true;
                item.ITEM3 = true;
                item.ITEM5 = true;
                item.ITEM6 = (item.rcmdmobile && item.rcmdmobile != item.agentmobile);
                item.CJ = true;
                item.DF = true;
                item.ITEM9 = (item.leftday && item.leftday > 0 && item.state < 2)
                item.ITEMDEPT = true
                break;
              case 2:
                item.ITEM1 = true;
                item.ITEM2 = true;
                item.ITEM5 = true;
                item.ITEM6 = (item.rcmdmobile && item.rcmdmobile != item.agentmobile);
                item.ITEM8 = true;
                item.CJ = true;
                item.CXDF = true;
                item.ITEM7 = true;
                item.ITEMDEPT = true
                break;
              case 3:
                item.ITEM1 = true;
                item.ITEM2 = true;
                item.ITEM5 = true;
                item.ITEM6 = (item.rcmdmobile && item.rcmdmobile != item.agentmobile);
                item.ITEM8 = true;
                item.ITEM4 = true;
                item.SWWXCJBTN = true;
                item.ITEMDEPT = true
                break;
              case 4:
                item.ITEM1 = true;
                item.ITEM2 = true;
                item.ITEM3 = true;
                break;
            }
            item.showmobile = item.mobile
            if (item.srcmobile && item.mobile != item.srcmobile) {
              item.isSrcMobile = true;
              if (item.mobile.indexOf('*') < 0) {
                item.showmobile = item.mobile.substr(0, 3) + '****' + item.mobile.substring(3);
              }
            }
            if (item.submittime) {
              item.submittime = Fn.getTime(item.submittime);
            } else {
              item.submittime = ''
            }
            if (item.visittime) {
              item.visittime = Fn.getTime(item.visittime);
            }
            if (item.dealtime) {
              item.dealtime = Fn.getTime(item.dealtime);
            }
            item.status = status[item.state]
            page.tpl("cus-item", item, cusListEl);
            // if(item.PROJECTLAYER) {
            //   var projectEl = cusListEl.find('.project-layer .list')
            //   item.STATUS = status[item.state]
            //   item.GUIDETXT = ((item.guidename && item.guidemobile) ? '带访人：' + item.guidename + '(' + item.guidemobile + ')' : '')
            //   page.tpl("project-item",item,projectEl)
            // }
          })
        })
      })
    },

    showProInfo: function () {
      this.wrapperEl.style('padding-top', '40px')
      page.find('.search-panel').addClass("hide");
      page.find('.proinfo').empty();
      cusListEl.empty()

      api.request.get("/hfz/HfzTeamManageAction/getTeamProInfo", {
        obj: {
          projectid: projectid
        }
      }).then(function (response) {
        var msg = response.data;
        page.tpl('proinfo', {
          content: ((msg && msg.information) ? msg.information : ""),
          date: ((msg && msg.updinfotime) ? Fn.getTime(msg.updinfotime) : "")
        }, page);
      });
    },

    approve: function (event, projectid, mobile) {
      v.ui.confirm("您确定要设置该用户为甲方通过？").then(function (ok) {
        if (ok) {
          api.request.get("/hfz/HfzTeamManageAction/approveCustomer", {
            obj: {
              projectid: projectid,
              mobile: mobile,
              approvestate: 1
            }
          }).then(function (response) {
            $(event.target).closest('.cus-item').remove()
            v.ui.alert('操作成功');
          });
        }
      });
    },

    reject: function (event, projectid, mobile) {
      v.ui.confirm("您确定要设置该用户为甲方拒绝？").then(function (ok) {
        if (ok) {
          api.request.get("/hfz/HfzTeamManageAction/approveCustomer", {
            obj: {
              projectid: projectid,
              mobile: mobile,
              approvestate: -1
            }
          }).then(function (response) {
            $(event.target).closest('.cus-item').remove()
            return v.ui.alert('操作成功');
          });
        }
      });
    },

    swdf: function (event, id) {
      // dfid = id
      // popup.removeClass('hide')

      api.request.get("/hfz/HfzCustomerAction/updCustomerState", {
        obj: {
          ids: id,
          state: 2
        }
      }).then(function (response) {
        popup.addClass('hide');
        v.ui.alert('操作成功');
        !function () {
          page.paging.reset().load();
        }.defer(1000)
      });
    },

    swcj: function (event, id) {
      v.ui.confirm("您确定要设置该用户为成交客户？").then(function (ok) {
        if (ok) {
          api.request.get("/hfz/HfzCustomerAction/updCustomerState", {
            obj: {
              ids: id,
              state: 5
            }
          }).then(function (response) {
            v.ui.alert('操作成功');
            !function () {
              page.paging.reset().load();
            }.defer(1000)
          });
        }
      });
    },

    cxdf: function (event, id, teamsubmitid) {
      v.ui.confirm("您确定要撤销该用户的到访？").then(function (ok) {
        if (ok) {
          api.request.get("/hfz/HfzCustomerAction/rollbackCustomerStateUnVisit", {
            list: [{id: id, teamsubmitid: parseInt(teamsubmitid)}]
          }).then(function (response) {
            v.ui.alert('操作成功');
            !function () {
              page.paging.reset().load();
            }.defer(1000)
          });
        }
      });
    },

    swwxcj: function (event, id, teamsubmitid) {
      $.createElements({
        classes: 'popup-appeal-layer',
        components: [{
          classes: 'appeal-layer',
          components: [{
            classes: 'appeal-title',
            text: '变更无效成交理由'
          },{
            components: [{
              classes: 'view-layer',
              components: [{
                tag: 'label',
                text: '内容：'
              },{
                tag: 'textarea',
                rows: '8'
              }]
            }]
          },{
            classes: 'act-bar',
            components: [{
              text: '取消',
              onSingleTap: function() {
                !function(){
                  $('.popup-appeal-layer').remove()
                  return
                }.defer(200)                
              }
            },{
              text: '提交',
              onSingleTap: function(event) {
                event.stopPropagation();
                var content = $('textarea').val();
                if(!content) {
                  return v.ui.alert('内容不能为空');
                }
                $('.popup-appeal-layer').addClass('hide')

                api.request.get("/hfz/HfzCustomerAction/rollbackCustomerStateInvalidDeal", {
                  list: [{
                    id: id, 
                    teamsubmitid: parseInt(teamsubmitid),
                    invalidreason: content
                  }]
                }).then(function (response) {
                  v.ui.alert('操作成功');
                  $('.popup-appeal-layer').remove()
                  !function () {
                    page.paging.reset().load();
                  }.defer(1000)
                }); 
              }
            }]
          }]
        }]
      },document.body);
      // v.ui.confirm("您确定要设置该用户为无效成交？").then(function (ok) {
      //   if (ok) {
      //     api.request.get("/hfz/HfzCustomerAction/updCustomerState", {
      //       obj: {
      //         ids: id,
      //         state: 7
      //       }
      //     }).then(function (response) {
      //       v.ui.alert('操作成功');
      //       !function () {
      //         page.paging.reset().load();
      //       }.defer(1000)
      //     });
      //   }
      // });
    },

    deliver: function (event, projectid, mobile) {
      if ($(event.target).closest('span').hasClass('disable')) {
        return;
      }
      v.ui.confirm("是否转发到开发商？").then(function (ok) {
        if (ok) {
          api.request.get("/hfz/HfzTeamManageAction/deliverCustomer", {
            obj: {
              projectid: projectid,
              mobile: mobile.replace('****', '')
            }
          }).then(function (response) {
            v.ui.alert('转发成功');
            !function () {
              page.paging.reset().load();
            }.defer(1000)
          });
        }
      });
    },

    getDeliverInfo: function (event, projectid, mobile) {
      v.ui.confirm("是否获取报备信息？").then(function (ok) {
        if (ok) {
          api.request.get("/hfz/HfzTeamManageAction/getDeliverInfo", {
            obj: {
              projectid: projectid,
              mobile: mobile
            }
          }).then(function (response) {
            v.ui.alert('获取成功');
          });
        }
      });
    },

    editTeamProInfo: function () {
      page.find(".proinfo textarea").removeAttr('disabled');
    },

    updateTeamProInfo: function () {
      var content = page.find(".proinfo textarea").val();
      if (!content) {
        return v.ui.alert('内容不能为空');
      }
      api.request.get("/hfz/HfzTeamManageAction/updateTeamProInfo", {
        obj: {
          projectid: projectid,
          information: content
        }
      }).then(function (response) {
        v.ui.alert('发布成功');
      });
    }

  }
})