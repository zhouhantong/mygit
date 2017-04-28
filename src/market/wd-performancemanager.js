"use strict";
Page.ready(function($, query) {

  var self, report1, report2, row;
  var projectId = 0;

  return {

    options: {
      // pagingEnabled: true
    },

    init: function(){
      self = this

      self.starttime = Fn.getTime(new Date().getTime())
      self.endtime = Fn.getTime(new Date().getTime())
    },

    onRender: async function() {

      self.userObj = await '/hfz/HfzChannelManageAction/getRegisterInfo'.GET();

      if (!self.userObj.teammember || self.userObj.teammember.position != 1) {
        return v.ui.alert('您不是店长').then(function() {
          Page.back();
        });
      }

      self.initPage();
    },

    initPage: async function() {

      self.find(".stage").empty();
      self.tpl("stage", {}, self.find(".stage"));

      self.find('.statistic-header-layer.time').html('日期：' + self.starttime + ' 至 ' + self.endtime)
      self.tpl('info-layer-time', {
        infotxt: '日期：' + self.starttime + ' 至 ' + self.endtime
      }, self.find('.statistic-info-layer.time'))

      var listProject = await '/hfz/HfzTeamManageAction/listProject'.GET({
        obj: {
          followed: 1
        },
        offset: 0,
        size: 1000
      })

      if (listProject.list && listProject.list.length) {
        listProject.list.unshift({
          id: 0,
          projectname: '全部项目'
        })
        v.$(listProject.list.map((item, index) => {
          if(item.id == projectId){
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
          self.initPage();
        });
      }

      var reportObj = await '/hfz/HfzReportAction/getTeamReport'.GET({
        obj: {
          teamuuid: self.userObj.team.teamuuid,
          startdate: self.starttime,
          enddate: self.endtime,
          projectid: projectId
        }
      })

      app.Grid.create({
        len: 2,
        maxlen: 2,
        percentage: 0.5,
        parentNode: self.find(".grid")
      }).then(obj => {
        obj.find(".grid-item").forEach((item, index) => {
          switch(index) {
            case 0:
              self.tpl("round-box", {
                count: reportObj.clickVolume | 0,
                name: "微店点击量"
              }, $(item));
              break;
            case 1:
              self.tpl("round-box", {
                count: reportObj.shareVolume | 0,
                name: "微店分享次数"
              }, $(item));
              break;
          }
        })
      })

      self.tpl('info-layer-booking', {
        booking: reportObj.bespokeVolume | 0
      }, self.find('.statistic-info-layer.booking'))

      self.tpl('report-layer', {
        infotxt: '店长',
        type: "manager",
        HAS_LINE: true
      }, self.find(".stage"))
      report1 = self.find('.statistic-grid-layer.manager');
      var width1 = 19, width2 = (100 - width1) / 3;

      row = self.tpl('report-row-layout', {}, report1);
      self.tpl('report-item-layout', {
        width: width1,
        ISHEADER: true,
        fontClass: "font-transparent"
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
      row = self.tpl('report-row-layout', {}, report1);
      self.tpl('report-item-layout', {
        width: width1,
        ISHEADER: true,
        text1: "店长"
      }, row);
      self.tpl('report-item-layout', {
        text1: $.tpl("${a}(${b})",{a:reportObj.recordVolume | 0,b:reportObj.recordVolume2 | 0}),
        width: width2,
        fontClass: "font-red"
      }, row);
      self.tpl('report-item-layout', {
        text1: $.tpl("${a}(${b})",{a:reportObj.visitVolume | 0,b:reportObj.visitVolume2 | 0}),
        width: width2,
        fontClass: "font-red"
      }, row);
      self.tpl('report-item-layout', {
        text1: $.tpl("${a}(${b})",{a:reportObj.dealVolume | 0,b:reportObj.dealVolume2 | 0}),
        width: width2,
        fontClass: "font-red"
      }, row);

      self.tpl('report-layer', {
        infotxt: '店员',
        type: "staff"
      }, self.find(".stage"))

      report2 = self.find('.statistic-grid-layer.staff');
      width1 = 19, width2 = (100 - width1) / 4;

      row = self.tpl('report-row-layout', {}, report2);
      self.tpl('report-item-layout', {
        width: width1,
        ISHEADER: true,
        fontClass: "font-transparent"
      }, row);
      self.tpl('report-item-layout', {
        text1: "推荐",
        width: width2
      }, row);
      self.tpl('report-item-layout', {
        text1: "报备",
        width: width2
      }, row);
      self.tpl('report-item-layout', {
        text1: "到访",
        width: width2
      }, row);
      self.tpl('report-item-layout', {
        text1: "成交",
        width: width2
      }, row);

      reportObj.members.forEach((item, index) => {
        row = self.tpl('report-row-layout', {}, report2);
        self.tpl('report-item-layout', {
          width: width1,
          ISHEADER: true,
          text1: (index == 0 ? '汇总': item.nickname) || ""
        }, row);
        self.tpl('report-item-layout', {
          text1: item.recommendVolume | 0,
          width: width2,
          fontClass: index == 0 ? "font-red" : ""
        }, row);
        self.tpl('report-item-layout', {
          text1: item.recordVolume | 0,
          width: width2,
          fontClass: index == 0 ? "font-red" : ""
        }, row);
        self.tpl('report-item-layout', {
          text1: item.visitVolume | 0,
          width: width2,
          fontClass: index == 0 ? "font-red" : ""
        }, row);
        self.tpl('report-item-layout', {
          text1: item.dealVolume | 0,
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