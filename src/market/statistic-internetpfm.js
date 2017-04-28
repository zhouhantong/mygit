"use strict";
Page.ready(function($, query) {

  var self,width1, width2, report;

  return {
    name: 'statistic-personnelpfm',

    options: {
      pagingEnabled: true
    },

    init: function(){
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

    initPage: async function(){
      self.find(".stage").empty();
      self.tpl("stage", {}, self.find(".stage"));

      self.tpl('info-layer', {
          infotxt: '日期：' + self.starttime + ' 至 ' + self.endtime
        }, self.find('.statistic-info-layer.time'))

      self.tpl('report-layer', {}, self.find(".stage"))

      report = self.find('.statistic-grid-layer');
      width1 = 30;
      width2 = (100 - width1) / 2;

      var row = self.tpl('report-row-layout', {}, report);
      self.tpl('report-item-layout', {
        width: width1,
        ISHEADER: true
      }, row);
      self.tpl('report-item-layout', {
        text1: "分享微店",
        width: width2
      }, row);
      self.tpl('report-item-layout', {
        text1: "点击量",
        width: width2
      }, row);

      self.paging.reset().load();

    },

    onPaging: function(paging){
      paging.start().then(paging => {
        api.request.get('/hfz/HfzReportAction/getManagerNetPerformace', {
          obj: {
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
              text1: item.sharecnt | 0,
              width: width2
            }, row);
            self.tpl('report-item-layout', {
              text1: item.clickcnt | 0,
              width: width2
            }, row);
          })

        })
      })
    },

    reloadData: function(starttime, endtime) {
      var self = this
      self.starttime = starttime
      self.endtime = endtime
      self.initPage();
    }

  }
})