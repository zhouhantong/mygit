"use strict";
Page.ready(function($, query) {

  var self,width1, width2, report;
  var projectId = 0;

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
        }, self.find('.statistic-info-layer.time'))
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

          var reportObj = await '/hfz/HfzReportAction/getProjectAchievementReport'.GET({
            obj: {
              projectid: projectId,
              startdate: self.starttime,
              enddate: self.endtime
            }
          });

          app.Grid.create({
            len: 6,
            maxlen: 3,
            percentage: 0.33,
            parentNode: self.find(".grid")
          }).then(obj => {
            obj.find(".grid-item").forEach((item, index) => {
              switch(index){
                case 0:
                  self.tpl("round-box", {
                    count: reportObj.shareVolume | 0,
                    name: "分享量",
                    suffix: '次'
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 1:
                  self.tpl("round-box", {
                    count: reportObj.clickVolume | 0,
                    name: "点击量",
                    suffix: '次'
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 2:
                  self.tpl("round-box2", {
                    count1: reportObj.publicBespokeVolume | 0,
                    count2: reportObj.privateBespokeVolume | 0,
                    name: "预约量",
                    suffix: '批'
                  }, $(item)).style({
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 3:
                  self.tpl("round-box", {
                    count: reportObj.recordVolume | 0,
                    name: "报备量",
                    suffix: '批'
                  }, $(item)).style({
                    marginTop: "0.4em",
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 4:
                  self.tpl("round-box", {
                    count: reportObj.visitVolume | 0,
                    name: "到访量",
                    suffix: '批'
                  }, $(item)).style({
                    marginTop: "0.4em",
                    width: "3em",
                    height: "3em"
                  });
                  break;
                case 5:
                  self.tpl("round-box", {
                    count: reportObj.dealVolume | 0,
                    name: "成交量",
                    suffix: '批'
                  }, $(item)).style({
                    marginTop: "0.4em",
                    width: "3em",
                    height: "3em"
                  });
                  break;
              }
            })

            self.tpl('report-layer', {}, self.find(".stage"))

            report = self.find('.statistic-grid-layer');
            width1 = 30;
            width2 = (100 - width1) / 3;

            var row = self.tpl('report-row-layout', {}, report);
            self.tpl('report-item-layout', {
              width: width1,
              ISHEADER: true
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

            (reportObj.members || []).forEach((item, index) =>{
              row = self.tpl('report-row-layout', {}, report);
                self.tpl('report-item-layout', {
                width: width1,
                ISHEADER: true,
                text1: item.name || ""
              }, row);
              self.tpl('report-item-layout', {
                text1: $.tpl("${a}(${b})",{a:item.recordVolume | 0,b:item.recordVolume2 | 0}),
                fontClass: index == 0 ? "font-red" : "",
                width: width2
              }, row);
              self.tpl('report-item-layout', {
                text1: $.tpl("${a}(${b})",{a:item.visitVolume | 0,b:item.visitVolume2 | 0}),
                fontClass: index == 0 ? "font-red" : "",
                width: width2
              }, row);
              self.tpl('report-item-layout', {
                text1: $.tpl("${a}(${b})",{a:item.dealVolume | 0,b:item.dealVolume2 | 0}),
                fontClass: index == 0 ? "font-red" : "",
                width: width2
              }, row);
            })

          })
        }
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