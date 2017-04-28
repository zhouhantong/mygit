"use strict";
Page.ready(function ($, query) {

  var page
  var fromsrc = query.fromsrc ? parseInt(query.fromsrc) : ''
  var rcmdcustid = query.id ? parseInt(query.id) : ''
  var usertype = query.usertype ? parseInt(query.usertype) : ''
  var fopenid = query.fopenid ? query.fopenid : ''
  var name = query.name ? query.name : ''
  var project = []
  var json = {}

  return {

    options: {
      wx: true,
      pagingEnabled: true
    },

    onRender: function () {
      page = this // 自动生成的代码

      if (rcmdcustid) {
        page.find('.btn').text(usertype == 1 ? '添加并报备' : '添加项目')
      }
      if (fromsrc == 1) {
        page.find('.btn').text('添加项目')
        var data = $.storage.get(app.session.openid + app.id + 'recommend-data');
        if (data) {
          json = JSON.parse(data);
          project = json.project
        }
      }

      this.paging.reset().load()
    },

    onPaging: function (paging) {
      var listEl = page.find(".list");
      if (paging.isFirst()) {
        listEl.empty()
      }

      var params = {
        followed: 1
      }
      if (rcmdcustid) {
        params.rcmdcustid = rcmdcustid
      }

      paging.start().then(function (paging) {
        api.request.get('/hfz/HfzTeamManageAction/listProject', {
          obj: params,
          offset: paging.count,
          size: paging.size
        }).then(function (response) {
          var obj = response.data
          paging.done(obj.list.length, obj.total)

          page.find('.btn-bar').removeClass('hide')
          if (obj.total == 0) {
            page.tpl("noitem", {}, listEl);
            return;
          }
          obj.list.forEach(function (item) {
            item.ISSELECTED = page.isSelected(item.id)
            page.tpl("project-item", item, listEl);
          })
        })
      })
    },

    selectPro: function (event, id, projectname) {
      var el = $(event.target).closest('.project-item').find('.selectbox')
      if (el.hasClass('selected')) {
        el.removeClass('selected')
        page.removeSelected(id, projectname)
      } else {
        el.addClass('selected')
        project.push({projectid: parseInt(id), projectname: projectname})
      }
    },

    report: function () {
      if (project.length <= 0) {
        return v.ui.alert('请先选择项目');
      } else if (project.length > 5) {
        return v.ui.alert('一次最多只能选择5个项目');
      }
      if (fromsrc == 1) {
        var obj = {
          name: json.name,
          mobile: json.mobile,
          memo: json.memo,
          project: project
        }
        $.storage.set(app.session.openid + app.id + 'recommend-data', JSON.stringify(obj));
        Page.open('./cus-add.html', {
          from: 'list'
        },true);
      }
      if (rcmdcustid) {
        var ids = []
        var projectids
        var action, returnType
        project.forEach(function (item) {
          ids.push(item.projectid)
        })
        if (ids.length <= 0) {
          return v.ui.alert('请先选择项目');
        } else {
          projectids = ids.join(',')
        }
        if (usertype == 1) {
          action = '/hfz/HfzTeamManageAction/submitRcmdProject'
          returnType = (fopenid ? 2 : 1)

          var params = {
            rcmdcustid: rcmdcustid
          }
          submitCus(project, params, 2, function () {
            v.ui.alert('操作成功').then(function () {
              Page.open('./cus-management.html', {
                type: returnType,
                fopenid: fopenid,
                name: name
              }, true)
            });
          })
        } else {
          action = '/hfz/HfzTeamManageAction/addRcmdProject'
          returnType = 0
          api.request.get(action, {
            obj: {
              rcmdcustids: rcmdcustid,
              projectids: projectids
            }
          }).then(function (response) {
            v.ui.alert('添加成功').then(()=>{
              Page.open('./cus-management.html', {
                type: returnType,
                fopenid: fopenid,
                name: name
              }, true)
            });
          });
        }
      }
    },

    removeSelected: function (id, projectname) {
      var tmp = []
      project.forEach(function (obj) {
        if (obj.projectid != id) {
          tmp.push(obj)
        }
      })
      project = tmp
    },

    isSelected: function (id) {
      var isIn = false
      project.forEach(function (obj) {
        if (obj.projectid == id) {
          isIn = true
        }
      })
      return isIn
    }

  }
})