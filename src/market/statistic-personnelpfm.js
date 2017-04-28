"use strict";
Page.ready(function($, query) {

  var self;
  var projectId = 0;
  var projectname = "";

  return {
    name: 'statistic-personnelpfm',

    options: {
      // pagingEnabled: true
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
        }, self.find('.statistic-info-layer'))
        //项目
      api.request.get('/hfz/HfzReportAction/getManagerProjectCombo', {
        obj: {},
        offset: 0,
        size: 1000
      }).then(function(response) {
        var obj = response.data
        if (obj.list && obj.list.length) {
          obj.list.unshift({
            id: 0,
            projectname: '全部项目'
          })
          $.createElements(obj.list.map(function(item, index) {
            if (item.id == projectId) {
              self.find('select').parent().find('div.text-value').text(item.projectname)
              return {
                tag: 'option',
                value: item.id,
                text: item.projectname,
                selected: 'selected'
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
            projectname = this.options[this.selectedIndex].text || "";
            self.initPage();
          })
        }
      })

      var reportObj = await '/hfz/HfzReportAction/getSalerScoreReport'.GET({
        obj: {
          reporttype: 'salermanager',
          projectid: projectId,
          startdate: self.starttime,
          enddate: self.endtime
        }
      })

      self.tpl('report-layer', {
        infotxt: '下属店长'
      }, self.find(".stage"))

      var report = self.find('.statistic-grid-layer');
      var width1 = 19, width2 = (100 - width1) / 4;

      var row = self.tpl('report-row-layout', {}, report);
      self.tpl('report-item-layout', {
        width: width1,
        ISHEADER: true,
        fontClass: "font-transparent"
      }, row);
      self.tpl('report-item-layout', {
        text1: "店员数",
        width: width2
      }, row);
      self.tpl('report-item-layout', {
        text1: "报备",
        text2: "(线上)",
        width: width2
      }, row);
      self.tpl('report-item-layout', {
        text1: "到访",
        text2: "(线上)",
        width: width2
      }, row);
      self.tpl('report-item-layout', {
        text1: "成交",
        text2: "(线上)",
        width: width2
      }, row);

      (reportObj || []).forEach((item, index) => {
        row = self.tpl('report-row-layout', {
          url: index == 0 ? "" : $.url.build({
            projectid: projectId,
            o: item.openid,
            salername: item.name,
            projectname: projectname
          }, "./statistic-personnelpfm-detail.html")
        }, report);
        self.tpl('report-item-layout', {
          width: width1,
          ISHEADER: true,
          text1: item.name || ""
        }, row);
        self.tpl('report-item-layout', {
          text1: item.membercount | 0,
          width: width2,
          fontClass: index == 0 ? "font-red" : ""
        }, row);
        self.tpl('report-item-layout', {
          text1: $.tpl("${a}(${b})",{a:item.submitcount | 0,b:item.submitlinecount | 0}),
          width: width2,
          fontClass: index == 0 ? "font-red" : ""
        }, row);
        self.tpl('report-item-layout', {
          text1: $.tpl("${a}(${b})",{a:item.visitcount | 0,b:item.visitlinecount | 0}),
          width: width2,
          fontClass: index == 0 ? "font-red" : ""
        }, row);
        self.tpl('report-item-layout', {
          text1: $.tpl("${a}(${b})",{a:item.dealcount | 0,b:item.deallinecount | 0}),
          width: width2,
          fontClass: index == 0 ? "font-red" : ""
        }, row);
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