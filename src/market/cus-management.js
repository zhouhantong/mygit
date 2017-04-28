"use strict";
Page.ready(function ($, query) {

  var page
  // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
  var fopenid = query.fopenid ? query.fopenid : ''
  var name = query.name ? query.name : ''
  var project = query.project ? query.project : null
  var usertype = query.usertype ? parseInt(query.usertype) : ''
  var type = query.type ? parseInt(query.type) : 0
  var userObj, numObj
  var types
  var params
  var teamState = true //false表示冻结状态

  var paramsProject = [{isinvalid: 0}, {issubmit: 1}, {isvisit: 1}, {isdeal: 1}]
  var paramsTeamLeader = [{issubmit: 0}, {issubmit: 1}, {isvisit: 1}, {isdeal: 1}, {isinvalid: 1}, {}]
  var paramsTeamLeaderCus = [{isinvalid: 0}, {issubmit: 0}, {issubmit: 1}, {isvisit: 1}, {isdeal: 1}, {isinvalid: 1}, {}]
  var paramsTeamMember = [{isinvalid: 0}, {issubmit: 1}, {isvisit: 1}, {isdeal: 1}, {isinvalid: 1}, {}]

  var submitStatus = ['审核中', '<span style="color:#26AEE0">甲方通过</span>', '<span style="color:#FA432D">甲方拒绝</span>', '报备失败']

  var listEl
  var cusListEl
  var searchEl

  return {

    options: {
      wx: true,
      pagingEnabled: true
    },

    onRender: function () {
      page = this // 自动生成的代码

      //设置左侧滑动
      new IScroll(page.find('aside')[0]);

      listEl = page.find('.list');
      cusListEl = page.find('.cus-list');
      searchEl = $('#search');

      //查看某个队员的客户
      if (name) {
        Page.setTitle(name + '的客户列表')
      }

      Promise.all([
        api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
          obj: {
            openid: app.session.openid
          }
        }),
        api.request.get('/hfz/HfzTeamManageAction/getNewCustCnt')
      ]).then(datas => {
        userObj = datas[0].msg
        numObj = datas[1].msg
        if (userObj.team && userObj.team.state == 3) {
          teamState = false
        }
        if (userObj.team && (userObj.team.state == 1 || userObj.team.state == 3) && userObj.teammember && userObj.teammember.position == 1) {
          //队长
          usertype = 1
        } else {
          usertype = 2
        }
        this.setTypes();
        this.paging.load()
      });

      //搜素
      page.find('.searchbt').singleTap(() => {
        this.paging.reset().load()
      });


    },

    setTypes: function () {
      if (project && project.projectname) {
        //项目客户列表
        types = [{id: 1, name: '已推荐'}, {id: 2, name: '报备成功'}, {
          id: 3,
          name: '已到访'
        }, {id: 4, name: '已成交'}];
        page.find('.topheader').text(project.projectname)
        page.find('.topheader').removeClass('hide')
        page.find('aside').style('top', '2.5rem')
        page.find('.search-panel').style('top', '2.5rem')
        this.wrapperEl.style('padding-top', '5rem')
        //初始化状态列表
        this.initTypes();
      } else {
        //客户管理
        if (!fopenid && teamState) {
          //队长查看队员不显示添加客户
          page.tpl("addcus-layer", {}, page.el);
        }
        if (usertype == 1 && teamState) {
          page.tpl("appeal-layer", {}, page.find('.vpage-content'));
        }
        page.tpl("home-icon", {}, page.find('.vpage-content'));

        if (usertype == 1) {
          types = [{
            name: '未报备',
            hasunread: (!fopenid && numObj.notsubmit > 0 && type != 0)
          }, {
            name: '已报备',
            hasunread: (!fopenid && numObj.issubmit > 0 && type != 1)
          }, {
            name: '已到访',
            hasunread: (!fopenid && numObj.isvisit > 0 && type != 2)
          }, {
            name: '已成交',
            hasunread: (!fopenid && numObj.isdeal > 0 && type != 3)
          }, {name: '无效客户'}, {name: '无效成交'}];
          if (fopenid) {
            types.unshift({name: '已推荐'})
          }
        } else if (usertype == 2) {
          types = [{
            name: '已推荐',
            hasunread: (numObj.notsubmit > 0 && type != 0)
          }, {
            name: '已报备',
            hasunread: (numObj.issubmit > 0 && type != 1)
          }, {
            name: '已到访',
            hasunread: (numObj.isvisit > 0 && type != 2)
          }, {
            name: '已成交',
            hasunread: (numObj.isdeal > 0 && type != 3)
          }, {name: '无效客户'}, {name: '无效成交'}];
        }
        //初始化状态列表
        this.initTypes();
      }
    },

    initTypes: function () {
      types.forEach(function (item, index) {
        $.createElements({
          classes: 'item' + (index == type ? ' selected' : '') + ((item.hasunread && index != type) ? ' hasbefore' : ''),
          text: item.name,
          onSingleTap: function () {
            var el = $(this)
            listEl.find('.item').removeClass('selected')
            el.addClass('selected')
            el.removeClass('hasbefore')
            type = index
            page.paging.reset().load()
          }
        }, listEl)
      })
    },

    onPaging: function (paging) {
      var search = searchEl.val()

      if (paging.isFirst()) {
        cusListEl.empty()
      }

      this.setParams()

      params.keyword = ''
      if (search) {
        params.keyword = search
      }

      var aciton = '/hfz/HfzTeamManageAction/listRcmdCustomer'
      if (!project) {
        if (usertype == 1) {
          if (fopenid) {
            if (type == 6) {
              aciton = '/hfz/HfzTeamManageAction/listInvalidCust'
            }
          } else {
            if (type == 5) {
              aciton = '/hfz/HfzTeamManageAction/listInvalidCust'
            }
          }
        } else if (usertype == 2) {
          if (type == 5) {
            aciton = '/hfz/HfzTeamManageAction/listInvalidCust'
          }
        }
      }

      paging.start().then(function (paging) {
        return api.request.get(aciton, {
          obj: params,
          offset: paging.count,
          size: paging.size
        })
      }).then(function (response) {
        var obj = response.data
        paging.done(obj.list ? obj.list.length : 0, obj.total)

        if (obj.total == 0) {
          page.tpl("noitem", {}, cusListEl);
          page.find('.invalid-item').addClass('hide')
          return;
        }

        page.setInvalidItem()
        obj.list.forEach(function (item) {
          item.project = item.project || []
          item = page.setCommonShow(item)
          page.tpl("cus-item", item, cusListEl);
          if (item.PROJECTLAYER) {
            var projectEl = cusListEl.find('.project-layer .list')
            item.project.forEach(function (obj, index) {
              var canShow = true
              if (usertype == 1) {
                if (fopenid) {
                  if (type == 1) {
                    if (obj.issubmit != 0) {
                      canShow = false
                    } else {
                      obj.SHSTATUS = false
                      obj.CUSSTATUS = false
                      obj.BBBTN = false
                      obj.DELETEBTN = teamState
                      obj.TIME = false
                    }
                  } else if (type == 2) {
                    if (obj.issubmit != 1) {
                      canShow = false
                    } else {
                      obj.SHSTATUS = true
                      obj.shstatus = page.getSubmitStatus(obj)
                      obj.cusstatus = page.getCurStatus(obj)
                      obj.CUSSTATUS = (obj.cusstatus ? true : false)
                      obj.BBBTN = ((obj.submitstatus == 1 || obj.submitstatus == 0) && obj.submitexpire == 1 && teamState)
                      obj.DELETEBTN = false
                      obj.TIME = false
                      obj.LEFTDAY = (obj.leftday && (obj.submitstatus == 0 || obj.submitstatus == 1) && obj.submitexpire != 1 && obj.leftday > 0 && obj.isdeal != 1 && obj.isvisit != 1)
                    }
                  } else if (type == 3 || type == 4) {
                    if (type == 3 && obj.isvisit != 1) {
                      canShow = false
                    } else if (type == 4 && (obj.isdeal != 1 || obj.isinvaliddeal == 1)) {
                      canShow = false
                    } else {
                      obj.SHSTATUS = false
                      obj.CUSSTATUS = false
                      obj.BBBTN = false
                      obj.DELETEBTN = false
                      obj.TIME = true
                      obj.time = Fn.getFullTime(type == 3 ? obj.lastvisittime : obj.lastdealtime)
                      obj.GUIDEITEM = (type == 3)
                    }
                  } else if (type == 6) {
                    if (obj.isinvaliddeal != 1) {
                      canShow = false
                    } else {
                      obj.SHSTATUS = false
                      obj.CUSSTATUS = false
                      obj.BBBTN = false
                      obj.DELETEBTN = false
                      obj.TIME = true
                      obj.time = Fn.getFullTime(obj.lastdealtime)
                      obj.INVALIDDEAL = true
                      obj.invalidtime = Fn.getFullTime(obj.invalidtime)                      
                    }
                  }
                } else {
                  if (type == 0) {
                    if (obj.issubmit != 0) {
                      canShow = false
                    } else {
                      obj.SHSTATUS = false
                      obj.CUSSTATUS = false
                      obj.BBBTN = false
                      obj.DELETEBTN = teamState
                      obj.TIME = false
                    }
                  } else if (type == 1) {
                    if (obj.issubmit != 1) {
                      canShow = false
                    } else {
                      obj.SHSTATUS = true
                      obj.shstatus = page.getSubmitStatus(obj)
                      obj.cusstatus = page.getCurStatus(obj)
                      obj.CUSSTATUS = (obj.cusstatus ? true : false)
                      obj.BBBTN = ((obj.submitstatus == 1 || obj.submitstatus == 0) && obj.submitexpire == 1 && teamState)
                      obj.DELETEBTN = false
                      obj.TIME = false
                      obj.LEFTDAY = (obj.leftday && (obj.submitstatus == 0 || obj.submitstatus == 1) && obj.submitexpire != 1 && obj.leftday > 0 && obj.isdeal != 1 && obj.isvisit != 1)
                    }
                  } else if (type == 2 || type == 3) {
                    if (type == 2 && obj.isvisit != 1) {
                      canShow = false
                    } else if (type == 3 && (obj.isdeal != 1 || obj.isinvaliddeal == 1)) {
                      canShow = false
                    } else {
                      obj.SHSTATUS = false
                      obj.CUSSTATUS = false
                      obj.BBBTN = false
                      obj.DELETEBTN = false
                      obj.TIME = true
                      obj.time = Fn.getFullTime(type == 2 ? obj.lastvisittime : obj.lastdealtime)
                      obj.GUIDEITEM = (type == 2)
                    }
                  } else if (type == 5) {
                    if (obj.isinvaliddeal != 1) {
                      canShow = false
                    } else {
                      obj.SHSTATUS = false
                      obj.CUSSTATUS = false
                      obj.BBBTN = false
                      obj.DELETEBTN = false
                      obj.TIME = true
                      obj.time = Fn.getFullTime(obj.lastdealtime)
                      obj.INVALIDDEAL = true
                      obj.invalidtime = Fn.getFullTime(obj.invalidtime)                      
                    }
                  }
                }
              } else if (usertype == 2) {
                if (type == 1) {
                  if (obj.issubmit != 1) {
                    canShow = false
                  } else {
                    obj.SHSTATUS = true
                    obj.shstatus = page.getSubmitStatus(obj)
                    obj.cusstatus = page.getCurStatus(obj)
                    obj.CUSSTATUS = (obj.cusstatus ? true : false)
                    obj.BBBTN = false
                    obj.DELETEBTN = false
                    obj.TIME = false
                    obj.LEFTDAY = (obj.leftday && (obj.submitstatus == 0 || obj.submitstatus == 1) && obj.submitexpire != 1 && obj.leftday > 0 && obj.isdeal != 1 && obj.isvisit != 1)                    
                  }
                } else if (type == 2 || type == 3) {
                  if (type == 2 && obj.isvisit != 1) {
                    canShow = false
                  } else if (type == 3 && (obj.isdeal != 1 || obj.isinvaliddeal == 1)) {
                    canShow = false
                  } else {
                    obj.SHSTATUS = false
                    obj.CUSSTATUS = false
                    obj.BBBTN = false
                    obj.DELETEBTN = false
                    obj.TIME = true
                    obj.time = Fn.getFullTime(type == 2 ? obj.lastvisittime : obj.lastdealtime)
                    obj.GUIDEITEM = (type == 2)
                  }
                } else if (type == 5) {
                  if (obj.isinvaliddeal != 1) {
                    canShow = false
                  } else {
                    obj.SHSTATUS = false
                    obj.CUSSTATUS = false
                    obj.BBBTN = false
                    obj.DELETEBTN = false
                    obj.TIME = true
                    obj.time = Fn.getFullTime(obj.lastdealtime)
                    obj.INVALIDDEAL = true
                    obj.invalidtime = Fn.getFullTime(obj.invalidtime)                    
                  }
                }
              }
              if (canShow) {
                obj.rcmdcustid = item.id
                obj.guidename = (obj.guidename ? '带访人：' + obj.guidename : '')
                obj.guidemobile = (obj.guidemobile ? '（' + obj.guidemobile + '）' : '')
                if (obj.mobile && obj.mobile != item.mobile && obj.issubmit != 0) {
                  //前三后四报备
                  obj.bbClass = 'p1'
                } else {
                  obj.bbClass = ''
                }
                page.tpl("project-item", obj, projectEl)
              }
            })
          }
        })
      })
    },

    setParams: function () {
      if (project) {
        params = paramsProject[type];
        params.projectid = project.projectid;
      } else if (usertype == 1) {
        if (fopenid) {
          params = paramsTeamLeaderCus[type]
          params.openid = fopenid
        } else {
          params = paramsTeamLeader[type]
        }
      } else if (usertype == 2) {
        params = paramsTeamMember[type]
      }
    },

    setInvalidItem: function () {
      page.find('.invalid-item').addClass('hide')
      if (project) {
      } else if (usertype == 1) {
        if (fopenid) {
          if (type == 5) page.find('.invalid-item').removeClass('hide')
        } else {
          if (type == 4) page.find('.invalid-item').removeClass('hide')
        }
      } else if (usertype == 2) {
        if (type == 4) page.find('.invalid-item').removeClass('hide')
      }
    },

    getShowname: function () {
      if (usertype == 1) {
        if (fopenid) {
          var tmps = ['推荐项目', '推荐项目', '报备项目', '到访项目', '成交项目', '', '']
          return tmps[type]
        } else {
          var tmps = ['推荐项目', '报备项目', '到访项目', '成交项目', '', '']
          return tmps[type]
        }
      } else if (usertype == 2) {
        var tmps = ['推荐项目', '报备项目', '到访项目', '成交项目', '', '']
        return tmps[type]
      }
    },

    setCommonShow: function (item) {
      var canDelete = true
      var canSetInValid = true
      item.project.forEach(function (obj) {
        if (obj.issubmit == 1) {
          canDelete = false
        }
        if (obj.isvisit == 1 || obj.isdeal == 1) {
          canSetInValid = false
        }
      })
      // if(item.openid == app.session.openid || (usertype == 1 && fopenid && type == 4) || (usertype == 1 && !fopenid && type == 3)) {
      //   item.mobile = item.mobile
      // }else {
      //   item.mobile = item.mobile.substr(0,7) + '****'
      // }
      if (project) {
        item.SETINVALID = false
        item.PROJECTLAYER = false
        item.ACTBTNBAR = false
      } else if (usertype == 1) {
        if (fopenid) {
          item.SETINVALID = (type != 5 && type != 6 && canSetInValid && teamState)
          item.PROJECTLAYER = (type != 5 && item.project.length)
          item.ACTBTNBAR = (type < 4 && teamState)
          item.ADDBTN = (type < 4)
          item.YJBBBTN = (type == 1)
          item.EDIT = (type < 4 && app.session.openid == item.openid)
          item.DELETE = (type < 4 && app.session.openid == item.openid && canDelete)
          item.BBTRACK = (type == 4)
        } else {
          item.SETINVALID = (type != 4 && type != 5 && canSetInValid && teamState)
          item.PROJECTLAYER = (type != 4 && item.project.length)
          item.ACTBTNBAR = (type < 3 && teamState)
          item.ADDBTN = (type < 3)
          item.YJBBBTN = (type == 0)
          item.EDIT = (type < 3 && app.session.openid == item.openid)
          item.DELETE = (type < 3 && app.session.openid == item.openid && canDelete)
          item.BBTRACK = (type == 3)
        }
      } else if (usertype == 2) {
        item.SETINVALID = false
        item.PROJECTLAYER = (type != 4 && item.project.length)
        item.ACTBTNBAR = (type < 3 && teamState)
        item.ADDBTN = (type < 3)
        item.YJBBBTN = false
        item.EDIT = (type < 3 && app.session.openid == item.openid)
        item.DELETE = (type < 3 && app.session.openid == item.openid && canDelete)
        item.BBTRACK = (type == 3)
      }
      if (item.PROJECTLAYER) {
        item.showname = this.getShowname()
      }
      item.memo = item.memo || ''
      return item
    },

    getSubmitStatus: function (obj) {
      if (obj.submitstatus == 1 || obj.submitstatus == 0) {
        if (obj.submitexpire == 1) {
          return '已过报备时间'
        }
      }
      if (obj.submitstatus == 0) {
        if (obj.isdelivered == 1) {
          return '已报备'
        } else if (obj.isdelivered == 0) {
          return '报备中'
        }
      }
      return submitStatus[obj.submitstatus]
    },

    getCurStatus: function (obj) {
      if (obj.isinvaliddeal == 1) {
        return '无效成交'
      } else if (obj.isdeal == 1) {
        return '已成交'
      } else if (obj.isvisit == 1) {
        return '已到访'
      } else {
        return ''
      }
    },

    //设置无效
    setInvalid: function (event, id) {
      v.ui.confirm('您确定要设置该用户为无效用户？').then(function(e) {
        if(e) {
          api.request.get("/hfz/HfzTeamManageAction/updRcmdCustomerState", {
            obj: {
              ids: parseInt(id),
              isinvalid: 1
            }
          }).then(function (response) {
            var msg = response.data;
            if (true) {
              $(event.target).closest('.cus-item').remove()
              return v.ui.alert('设置成功');
            }
          });
        }
      })
    },

    //删除单个项目
    deleteProject: function (event, cid, pid) {
      api.request.get("/hfz/HfzTeamManageAction/delRcmdProject", {
        obj: {
          rcmdcustids: parseInt(cid),  //推荐客户ID,多个以,分隔
          projectids: parseInt(pid)    //楼盘ID,多个以,分隔
        }
      }).then(function (response) {
        var msg = response.data;
        // if($(event.target).closest('.cus-item').find('.project-item').length == 1) {
        //   $(event.target).closest('.cus-item').remove()
        // } else {
        $(event.target).closest('.project-item').remove()
        // }
        return v.ui.alert('删除成功');
      });
    },

    //单独报备
    report: function (event, cid, pid, pname) {
      var project = [{
        projectid: parseInt(pid),
        projectname: pname
      }]
      submitCus(project, {rcmdcustid: parseInt(cid)}, 2, function () {
        // $(event.target).closest('.project-item').find('.shstatus').html(submitStatus[msg])
        $(event.target).remove()
        // return v.ui.alert('操作成功');
        v.ui.alert('操作成功');
        !function () {
          loadData();
        }.defer(1000)
      })
      // api.request.get("/hfz/HfzTeamManageAction/submitCustomerSingle", {
      //   obj: {
      //     rcmdcustid: parseInt(cid),
      //     projectids: parseInt(pid)  //楼盘ID,多个以,分隔
      //   }
      // }).then(function(response){ var msg = response.data;
      //   if(true){
      //     $(event.target).closest('.project-item').find('.shstatus').html(submitStatus[msg])
      //     $(event.target).remove()
      //   }
      // });
    },

    //一键报备
    reportAll: function (event, id) {
      var project = []
      $('.ps-' + id).forEach(function (item) {
        project.push({
          projectid: $(item).data('pid'),
          projectname: $(item).find('.projectname').text()
        })
      })
      submitCus(project, {rcmdcustid: parseInt(id)}, 2, function () {
        $(event.target).closest('.cus-item').remove()
        return v.ui.alert('操作成功');
      })
      // api.request.get("/hfz/HfzTeamManageAction/submitCustomer", {
      //   obj: {
      //     rcmdcustids: parseInt(id)
      //   }
      // }).then(function(response){ var msg = response.data;
      //   if(true){
      //     $(event.target).closest('.cus-item').remove()
      //     return v.ui.alert('已报备');
      //   }
      // });
    },

    //添加项目
    addReportProject: function (event, id) {
      Page.open('./cus-prolist.html', {
        id: id,
        usertype: usertype,
        fopenid: fopenid,
        name: name
      }, true)
    },

    //删除客户
    deleteCustomer: function (event, id) {
      v.ui.confirm('您确定要删除该客户吗？').then(function(e) {
        if(e) {
          api.request.get("/hfz/HfzTeamManageAction/delRcmdCustomer", {
            obj: {
              id: parseInt(id)
            }
          }).then(function (response) {
            var msg = response.data;
            if (true) {
              $(event.target).closest('.cus-item').remove()
              return v.ui.alert('删除成功');
            }
          });
        }
      })
    },

    //编辑客户
    editCustomer: function (event, id) {
      Page.open('./cus-add.html', {
        id: id,
        type: type,
      })
    },

    //返回微店主页
    goHome: function () {
      Page.open(usertype == 1 ? './wd-leaderhome.html' : './wd-memberhome.html')
    },

    addCustomer: function () {
      Page.open('./cus-add.html')
    },

    //查看报备轨迹
    cusTrack: function (event, id) {
      api.request.get("/hfz/HfzTeamManageAction/getCustomerDealLog", {
        obj: {
          rcmdid: parseInt(id)
        }
      }).then(function (response) {
        var msg = response.data;
        if (true) {
          if (msg && msg.total) {
            $.createElements({
              classes: 'popup-track-layer',
              components: [{
                classes: 'track-layer',
                components: [{
                  classes: 'track-title',
                  text: '报备轨迹'
                }, {
                  classes: 'track-item',
                  components: [{
                    html: '<span>' + msg.list[0].name + '</span>'
                  }, {
                    classes: 'ellipsis flex',
                    html: '<span>' + msg.list[0].srcmobile + '</span>'
                  }]
                }, {
                  classes: 'track-block',
                  components: msg.list.map(function (item) {
                    return {
                      classes: 'track-item-layer',
                      components: [{
                        classes: 'track-item dashed',
                        components: [{
                          html: '成交项目：'
                        }, {
                          classes: 'ellipsis flex',
                          html: item.projectname
                        }]
                      }, {
                        classes: 'track-item',
                        components: [{
                          html: '推荐人：'
                        }, {
                          classes: 'ellipsis flex',
                          html: item.rcmdname
                        }, {
                          html: (item.rcmdmobile ? ' (' + item.rcmdmobile + ')' : '')
                        }]
                      }, {
                        classes: 'track-item ' + (item.rcmdtime ? '' : 'hide'),
                        components: [{
                          html: '推荐时间：'
                        }, {
                          classes: 'ellipsis flex',
                          html: (item.rcmdtime ? Fn.getFullTime(item.rcmdtime) : '')
                        }]
                      }, {
                        classes: 'track-item ' + (item.submittime ? '' : 'hide'),
                        components: [{
                          html: '报备时间：'
                        }, {
                          classes: 'ellipsis flex',
                          html: (item.submittime ? Fn.getTime(item.submittime) : '')
                        }]
                      }, {
                        classes: 'track-item ' + (item.submittime ? '' : 'hide'),
                        components: [{
                          html: '报备人：'
                        }, {
                          classes: 'ellipsis flex',
                          html: (item.submitname ? item.submitname : '')
                        }]
                      }, {
                        classes: 'track-item ' + (item.approvetime ? '' : 'hide'),
                        components: [{
                          html: '判客时间：' + (item.approvetime ? Fn.getTime(item.approvetime) : '')
                        }, {
                          classes: 'ellipsis flex',
                          html: '操作人：' + (item.approvename ? item.approvename : '')
                        }]
                      }, {
                        classes: 'track-item ' + (item.visittime ? '' : 'hide'),
                        components: [{
                          html: '到访时间：' + (item.visittime ? Fn.getTime(item.visittime) : '')
                        }, {
                          classes: 'ellipsis flex',
                          html: '操作人：' + (item.visitname ? item.visitname : '')
                        }]
                      }, {
                        classes: 'track-item ' + (item.dealtime ? '' : 'hide'),
                        components: [{
                          html: '成交时间：' + (item.dealtime ? Fn.getTime(item.dealtime) : '')
                        }, {
                          classes: 'ellipsis flex',
                          html: '操作人：' + (item.dealname ? item.dealname : '')
                        }]
                      }]
                    }
                  })
                }, {
                  classes: 'close-bar',
                  components: [{
                    classes: 'close',
                    onSingleTap: function () {
                      $('.popup-track-layer').remove()
                      return
                    }
                  }]
                }]
              }]
            }, document.body)
          }
        }
      });
    }

  };
})