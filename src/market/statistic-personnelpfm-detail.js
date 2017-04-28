"use strict";
Page.ready(function($, query) {

  var self;
  var projectId = query.projectid | 0;
  var o = query.o || "";
  var salername = query.salername || "";
  var projectname = query.projectname || "";
  var reporttype = 'bb';
  var report,width1,width2;

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
      self.paging.reset();
      self.find(".stage").empty();
      self.tpl("stage", {}, self.find(".stage"));

      self.tpl('info-layer', {
        time: '日期：' + self.starttime + ' 至 ' + self.endtime,
        projectname: '项目：' + (projectname || "全部"),
        salername: '置业顾问：' + salername
      }, self.find('.statistic-info-layer'))

      self.tpl('tabs-layer', {}, self.find('.statistic-tabs-layer'))
      self.find('.statistic-tabs-layer .' + reporttype).addClass("selected")

      var reportObj = await '/hfz/HfzReportAction/getSalerScoreReport'.GET({
        obj: {
          reporttype: 'saler',
          openid: o,
          projectid: projectId,
          startdate: self.starttime,
          enddate: self.endtime
        }
      }).then(function (obj) {
        return Promise.resolve(obj && obj[0] ? obj[0] : {});
      });

      switch(reporttype){
        case "bb":
          app.Grid.create({
            len: 4,
            maxlen: 4,
            percentage: 0.25,
            parentNode: self.find(".grid")
          }).then(obj => {
            obj.find(".grid-item").forEach((item, index) => {
              switch(index) {
                case 0:
                  self.tpl("round-box", {
                    count: reportObj.bb_zjbb | 0,
                    name: "总计报备"
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 1:
                  self.tpl("round-box", {
                    count: reportObj.bb_yx | 0,
                    name: "有效"
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 2:
                  self.tpl("round-box", {
                    count: reportObj.bb_wx | 0,
                    name: "无效"
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 3:
                  self.tpl("round-box", {
                    count: reportObj.bb_dpk | 0,
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
        case "df":
          app.Grid.create({
            len: 3,
            maxlen: 3,
            percentage: 0.33,
            parentNode: self.find(".grid")
          }).then(obj => {
            obj.find(".grid-item").forEach((item, index) => {
              switch(index) {
                case 0:
                  self.tpl("round-box", {
                    count: reportObj.df_zjdf | 0,
                    name: "总计到访"
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 1:
                  self.tpl("round-box", {
                    count: reportObj.df_xxsk | 0,
                    name: "线下私客"
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 2:
                  self.tpl("round-box", {
                    count: reportObj.df_xslk | 0,
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
        case "cj":
          app.Grid.create({
            len: 3,
            maxlen: 3,
            percentage: 0.33,
            parentNode: self.find(".grid")
          }).then(obj => {
            obj.find(".grid-item").forEach((item, index) => {
              switch(index) {
                case 0:
                  self.tpl("round-box", {
                    count: reportObj.cj_zjcj | 0,
                    name: "总计成交"
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 1:
                  self.tpl("round-box", {
                    count: reportObj.cj_xxsk | 0,
                    name: "线下私客"
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 2:
                  self.tpl("round-box", {
                    count: reportObj.cj_xslk | 0,
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
      if(reporttype != 'bb'){
        width1 = 33;
        width2 = (100 - width1) / 2;
      }else{
        width1 = 25;
        width2 = (100 - width1) / 3;
      }

      var row = self.tpl('report-row-layout', {}, report);
      self.tpl('report-item-layout', {
        text1: "客户姓名",
        width: width1,
        ISHEADER: true
      }, row);
      self.tpl('report-item-layout', {
        text1: "客户电话",
        width: width2
      }, row);
      self.tpl('report-item-layout', {
        text1: "报备时间",
        width: width2
      }, row);
      if(reporttype == 'bb'){
        self.tpl('report-item-layout', {
          text1: "状态",
          width: width2
        }, row);
      }
      self.paging.load();
    },

    onPaging: function(paging) {
      paging.start().then(paging => {
        api.request.get('/hfz/HfzReportAction/getSalerScoreCustomerList', {
          obj: {
            openid: o,
            reporttype: reporttype,
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
              text1: item.mobile == item.srcmobile ? item.mobile : Fn.simpleRecoverMobile(item.mobile) || "",
              width: width2
            }, row);
            self.tpl('report-item-layout', {
              text1: Fn.getTime(item.submittime) || "",
              width: width2
            }, row);
            if(reporttype == 'bb'){
              self.tpl('report-item-layout', {
                text1: item.submitstatus == 1 ? "有效"
                      : item.submitstatus == 2 || item.submitstatus == 3 ? "无效"
                        : item.submitstatus == 0 || item.submitstatus == 4 ? "待判客" : "",
                width: width2
              }, row);
            }
          })

        })
      })
    },

    onTab: function(event, type){
      reporttype = type;
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