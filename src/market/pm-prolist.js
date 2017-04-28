"use strict";
Page.ready(function ($, query) {

    var page
    var project = []
    var searchEl
    var teamroleid=null

    return {

        options: {
            wx: true,
            pagingEnabled: true
        },

        onRender: function () {
            page = this // 自动生成的代码
            searchEl = $('#search');

            this.paging.reset().load()

            //搜素
            page.find('.searchbt').singleTap(function () {
                page.paging.reset().load()
            });
        },
        onPaging: function (paging) {
            this.loadData(paging)
        },
        loadData: function (paging) {
            var self = this
            var listEl = page.find(".list");
            var search = searchEl.val()

            if (paging.isFirst()) {
                listEl.empty()
                page.find('.btn-bar').addClass('hide')
            }

            var params = {};
            if (search) {
                params.projectname = search
            }


            self.paging.setSize(10).start().then(function (paging) {
                var loadingEl = self.find('.loadding-bar')
                loadingEl.spin().text('')

                api.request.get('/hfz/HfzReportAction/listProject', {
                    obj: params,
                    offset: paging.count,
                    size: paging.size
                }).then(function (response) {
                    var obj = response.data

                    paging.done(obj.list.length, obj.total)

                    if (obj.total > 0) {
                        page.find('.btn-bar').removeClass('hide')
                    }


                    obj.list.forEach(function (item) {
                        page.tpl("project-item", item, listEl);
                    })


                    loadingEl.spin(false).text('载入更多')
                    if (!paging.hasMore) {
                        loadingEl.spin().text('已加载全部')
                    }
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

            if(teamroleid==null){
                api.request.get('/hfz/HfzReportAction/getTeamRoleInfo', {
                    obj: {}
                }).then(function (response) {
                    var data = response.data;
                    if(data && data.id){
                        if(data.roleid==10){
                            teamroleid= data.id;
                            _submit()
                        }
                    }

                });
            }else{
                _submit();
            }

            function _submit(){
                if (project.length <= 0) {
                    return v.ui.alert('请先选择项目');
                } else if (project.length > 5) {
                    return v.ui.alert('一次最多只能选择5个项目');
                }

                var projectids = []
                project.forEach(function (item) {
                    projectids.push({projectid: item.projectid,teamroleid:teamroleid})
                })

                var action = '/hfz/HfzReportAction/addTeamRoleProjectBat'
                api.request.get(action, {
                    list: projectids

                }).then(function (response) {
                    v.ui.alert('添加成功').then(function () {
                        Page.back();
                    });
                    // project=[];
                    // !function(){
                    //     page.paging.reset().load();
                    // }.defer(1500);
                }).catch(e => v.ui.alert(e.response.errmsg));
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