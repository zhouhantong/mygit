"use strict";
Page.ready(function($, query) {

  var self, width1, width2, report;
  var projectId = 0,
    state = 0;

  return {
    name: 'statistic-personnelpfm',

    options: {
      pagingEnabled: true
    },

    init: function() {
      self = this
      self.starttime = Fn.getTime(new Date().getTime())
      self.endtime = Fn.getTime(new Date().getTime())
    },

    onRender: function() {

      api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function(response) {
        self.userObj = response.data
        if (!self.userObj.isSaleManager) {
          v.ui.alert('您不是销售经理权限').then(function() {
            Page.open('../consumer2/myhome.html', {}, true)
          });
        }
        self.initPage();
      })
    },

    initPage: async function() {
      self.find(".stage").empty();
      self.tpl("stage", {}, self.find(".stage"));

      self.tpl('info-layer', {
        infotxt: '日期：' + self.starttime + ' 至 ' + self.endtime
      }, self.find('.statistic-info-layer.time'))

      self.tpl('tabs-layer', {}, self.find('.statistic-tabs-layer'))
      self.find('.statistic-tabs-layer .state' + state).addClass("selected")

      //项目
      api.request.get('/hfz/HfzReportAction/getManagerProjectCombo', {
        obj: {},
        offset: 0,
        size: 1000
      }).then(async function(response) {
        var obj = response.data
        if (obj.list && obj.list.length) {
          $.$(obj.list.map(function(item, index) {
            if(projectId){
              if(projectId == item.id){
                self.find('select').parent().find('div.text-value').text(item.projectname)
                return {
                  tag: 'option',
                  value: item.id,
                  text: item.projectname,
                  selected: 'selected'
                }
              }
            }else{
              if (index == 0) {
                projectId = item.id
                self.find('select').parent().find('div.text-value').text(item.projectname)
                return {
                  tag: 'option',
                  value: item.id,
                  text: item.projectname,
                  selected: 'selected'
                }
              }
            }
            return {
              tag: 'option',
              value: item.id,
              text: item.projectname
            }
          }), self.find('select'))
          self.find('select').on('change', function() {
            projectId = this.options[this.selectedIndex].value | 0;
            self.initPage();
          })

          var reportObj = await "/hfz/HfzReportAction/getManagerProjectTotal".GET({
            obj: {
              projectid: projectId,
              startdate: self.starttime,
              enddate: self.endtime,
              state: state
            }
          });

          switch (state) {
            case 0:
              app.Grid.create({
                len: 4,
                maxlen: 4,
                percentage: 0.25,
                parentNode: self.find(".grid")
              }).then(obj => {
                obj.find(".grid-item").forEach((item, index) => {
                  switch (index) {
                    case 0:
                      self.tpl("round-box", {
                        count: reportObj.cnt | 0,
                        name: "总计报备"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                    case 1:
                      self.tpl("round-box", {
                        count: reportObj.validcnt | 0,
                        name: "有效"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                    case 2:
                      self.tpl("round-box", {
                        count: reportObj.invalidcnt | 0,
                        name: "无效"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                    case 3:
                      self.tpl("round-box", {
                        count: reportObj.indetercnt | 0,
                        name: "待判客"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                  }
                })
              })
              break;
            case 2:
              app.Grid.create({
                len: 3,
                maxlen: 3,
                percentage: 0.33,
                parentNode: self.find(".grid")
              }).then(obj => {
                obj.find(".grid-item").forEach((item, index) => {
                  switch (index) {
                    case 0:
                      self.tpl("round-box", {
                        count: reportObj.cnt | 0,
                        name: "总计到访"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                    case 1:
                      self.tpl("round-box", {
                        count: reportObj.pricnt | 0,
                        name: "线下私客"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                    case 2:
                      self.tpl("round-box", {
                        count: reportObj.pubcnt | 0,
                        name: "线上来客"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                  }
                })
              })
              break;
            case 5:
              app.Grid.create({
                len: 3,
                maxlen: 3,
                percentage: 0.33,
                parentNode: self.find(".grid")
              }).then(obj => {
                obj.find(".grid-item").forEach((item, index) => {
                  switch (index) {
                    case 0:
                      self.tpl("round-box", {
                        count: reportObj.cnt | 0,
                        name: "总计成交"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                    case 1:
                      self.tpl("round-box", {
                        count: reportObj.pricnt | 0,
                        name: "线下私客"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                    case 2:
                      self.tpl("round-box", {
                        count: reportObj.pubcnt | 0,
                        name: "线上来客"
                      }, $(item)).style({
                        width: "3em",
                        height: "3em"
                      });
                      break;
                  }
                })
              })
              break;
          }

          self.tpl('report-layer', {}, self.find(".stage"))

          report = self.find('.statistic-grid-layer');
          width1 = 20;
          width2 = (100 - width1) / 4;

          var row = self.tpl('report-row-layout', {}, report);
          self.tpl('report-item-layout', {
            width: width1,
            ISHEADER: true
          }, row);
          self.tpl('report-item-layout', {
            text1: "所属店长",
            width: width2
          }, row);
          self.tpl('report-item-layout', {
            text1: "店长部门",
            width: width2
          }, row);
          self.tpl('report-item-layout', {
            text1: "来源",
            width: width2
          }, row);
          self.tpl('report-item-layout', {
            text1: "报备时间",
            width: width2
          }, row);

          self.paging.reset().load();
        }
      })

    },

    onPaging: function(paging) {
      paging.start().then(paging => {
        api.request.get('/hfz/HfzReportAction/listManagerProjectCustomer', {
          obj: {
            state: state,
            projectid: projectId,
            startdate: self.starttime,
            enddate: self.endtime
          },
          offset: paging.count,
          size: paging.size
        }).then(response => {
          var obj = response.data;
          paging.done(obj.list.length, obj.total);

          (obj.list || []).forEach((item, index) => {
            var row = self.tpl('report-row-layout', {}, report);
              self.tpl('report-item-layout', {
              width: width1,
              ISHEADER: true,
              text1: item.name || ""
            }, row);
            self.tpl('report-item-layout', {
              text1: item.agentname || "",
              width: width2
            }, row);
            self.tpl('report-item-layout', {
              text1: item.companyname || "",
              width: width2
            }, row);
            self.tpl('report-item-layout', {
              text1: item.type ? ["","预约公客","预约私客","店长私客","店员推荐"][item.type]: "",
              width: width2
            }, row);
            self.tpl('report-item-layout', {
              text1: Fn.getTime(item.submittime),
              width: width2
            }, row);
          })

        })
      })
    },

    onTab: function(event, type) {
      state = Number(type);
      self.initPage();
    },

    reloadData: function(starttime, endtime) {
      var self = this
      self.starttime = starttime
      self.endtime = endtime
      self.initPage();
    }

  }
})