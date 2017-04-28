"use strict";
Page.ready(function($, query) {

  var page = this // 自动生成的代码
  var fopenid = (query.fopenid ? query.fopenid : '')
  var memberopenid = (query.memberopenid ? query.memberopenid : '')
  var projectid = query.projectid | 0

  var popup = $('.appointment-popup2')
  var count = 59
  var projectroomid
  var appmemo
  var listEl;
  var self;

  return {
    options: {
      wxShareUrl: true,
      autoRender: false,
      pagingEnabled: true
    },

    init: function(){
      self = this;
      self.render();
      //设置分享链接
      setShareUrl(query)      
    },

    onRender: function(){
      listEl = self.find(".list");
      api.request.get("/global/Project/info", {
        projectid: projectid
      }, {
        mask: false
      }).then(function(response) {
        var msg = response.data;
        if (msg.base) {
          self.tpl("header", msg.base, self.find(".header-layer"));
        }
        self.paging.load();
      })

      popup.find('.cancel').singleTap(function() {
        popup.addClass('hide');
      });

      popup.find('.submit').singleTap(function() {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
        var vericode = $('#vericode').val();

        if (!name || !mobile) {
          return v.ui.alert('所有项均为必填项');
        }
        if (!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        if (!vericode) {
          return v.ui.alert('请输入短信验证码');
        }
        var parames = {
          obj: {
            name: name,
            mobile: mobile,
            ispublic: 1,
            projectid: projectid
          }
        };
        if (memberopenid) {
          $.mixin(parames.obj, {
            memberopenid: memberopenid,
            ispublic: 2
          }, true);
        }
        if (projectroomid) {
          $.mixin(parames.obj, {
            projectroomid: projectroomid
          }, true);
        }
        if (appmemo) {
          $.mixin(parames.obj, {
            memo: appmemo
          }, true);
        }
        app.session.vericode = vericode;

        api.request.get("/hfz/HfzTeamManageAction/addAppointment", parames).then(function(response) {
          var msg = response.data;
          $('#vericode').val('')
          v.ui.alert('预约成功');
          popup.addClass('hide');
        });
      });
    },

    onPaging: function(paging){

      if(paging.isFirst()){
        listEl.empty();
      }

      var params = {
        preprojectid: projectid,
        // state: 1
      };

      api.request.get('/hfz/HfzAppointmentAction/listHouse', {
        obj: params,
        offset: paging.count,
        size: paging.size
      }).then(function(response){
        var obj = response.data;
        paging.done(obj.list.length, obj.total)
        if (obj.total == 0) {
          self.tpl("noitem", {}, self.find(".list"));
          return;
        }
        obj.list.forEach(function(item) {
          // var tmp_datetime = item.deadline.replace(/:/g,'-');
          // tmp_datetime = tmp_datetime.replace(/ /g,'-');
          // var arr = tmp_datetime.split("-");
          // var now = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
          // var time = now.getTime();
          item.booknum = (item.owneropenid ? item.reportcnt : item.num);
          // item.time = self.getRTime(time);
          item.time = '';
          self.tpl("item", item, self.find(".list"));
        })
      });
    },

    getRTime: function(){
      var timestamp = new Date().getTime();
      var t = time - timestamp;
      if (t > 24 * 60 * 60 * 1000) {
        return '剩' + Math.ceil(t / (24 * 60 * 60 * 1000)) + '天'
      } else {
        return '今日截止'
      }
    },

    book: function(event,id) {
      projectroomid = parseInt(id)
      this.appointment('')
    },

    appointment: function(){
      popup.removeClass('hide')
    },

    goDetail: function(event, id) {
      Page.open("./house-preferential-detail.html", {
        projectid: id,
        fopenid: fopenid,
        memberopenid: memberopenid,
      });
    }
  }
  
  // return {

  //   options: {
  //     wxShareUrl: true
  //   },
    
  //   onRender: function() {
  //     var page = this // 自动生成的代码
  //     var fopenid = (query.fopenid ? query.fopenid : '')
  //     var memberopenid = (query.memberopenid ? query.memberopenid : '')
  //     var projectid = query.projectid | 0
    
  //     var popup = $('.appointment-popup2')
  //     var count = 59
  //     var projectroomid
  //     var appmemo
    
  //     initPage();
    
  //     function initPage(){
  //       api.request.get("/global/Project/info", {
  //         projectid: projectid
  //       }, {mask:false}).then(function(response){ var msg = response.data;
  //         if(msg.base) {
  //           page.tpl("header", msg.base, page.find(".header-layer"));
  //         }
  //       })
    
  //       var params = {
  //         preprojectid: projectid,
  //         // state: 1
  //       };
  //       Paging.getPaging().reset().setFactory(function(){
  //         return api.request.get('/hfz/HfzAppointmentAction/listHouse', {
  //           obj: params,
  //           offset: this.pageIndex * this.pageSize - this.pageSize,
  //           size: this.pageSize
  //         });
  //       }, function(obj){
  //         if(obj.total == 0){
  //           page.tpl("noitem", {}, page.find(".list"));
  //           return;
  //         }
  //         obj.list.forEach(function(item){
  //           // var tmp_datetime = item.deadline.replace(/:/g,'-');
  //           // tmp_datetime = tmp_datetime.replace(/ /g,'-');
  //           // var arr = tmp_datetime.split("-");
  //           // var now = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
  //           // var time = now.getTime();
  //           item.booknum = (item.owneropenid ? item.reportcnt : item.num);
  //           // item.time = getRTime(time);
  //           item.time = '';
  //           page.tpl("item", item, page.find(".list"));
  //         })
  //       }).start();
  //     }
    
  //     function getRTime(time) {
  //       var timestamp = new Date().getTime();
  //       var t = time - timestamp;
  //       if(t > 24 * 60 * 60 * 1000) {
  //         return '剩' + Math.ceil(t/(24 * 60 * 60 * 1000)) + '天'
  //       }else{
  //         return '今日截止'
  //       }
  //     }
    
  //     page.book = function(event,id) {
  //       projectroomid = parseInt(id)
  //       appointment('')
  //     }
    
  //     //预约
  //     function appointment() {
  //       popup.removeClass('hide')
  //     }
    
  //     popup.find('.cancel').singleTap(function(){
  //       popup.addClass('hide');
  //     });
    
  //     //发送验证码 按钮
  //     popup.find('.btn-vericode').singleTap(function() {
  //       if(popup.find('.btn-vericode').hasClass('disabled')) {
  //         return;
  //       }
  //       var mobile = $('#telnum').val();
  //       if (app.isMobile(mobile)) {
    
  //         popup.find('.btn-vericode').addClass('disabled');
  //         var ival = window.setInterval(function(){
  //           popup.find('.btn-vericode').html(count+'秒后重新获取');
  //           if(count <= 0) {
  //             count = 59;
  //             clearInterval(ival);
  //             popup.find('.btn-vericode').removeClass('disabled');
  //             popup.find('.btn-vericode').html('免费获取验证码');
  //           }else {
  //             count--;
  //           }
  //         },1000);
    
  //         api.request.get("/global/App/getHfzVericode", {
  //           mobile: mobile
  //         }).then(function(response){ var msg = response.data;
  //           v.ui.alert(code === 0 ? '验证码已通过短信发送到您的手机，稍等一会儿哦' : msg);
  //         });
  //       } else if (mobile) {
  //         return v.ui.alert('请输入正确的手机号码');
  //       } else {
  //         return v.ui.alert('请输入手机号码');
  //       }
  //     });
    
  //     popup.find('.submit').singleTap(function() {
  //       var name = $('#mname').val();
  //       var mobile = $('#telnum').val();
  //       var vericode = $('#vericode').val();
    
  //       if(!name || !mobile) {
  //         return v.ui.alert('所有项均为必填项');
  //       }
  //       if(!app.isMobile(mobile)) {
  //         return v.ui.alert('请输入正确的手机号码');
  //       }
  //       if (!vericode) {
  //         return v.ui.alert('请输入短信验证码');
  //       }
  //       var parames = {
  //         obj:{
  //           name: name,
  //           mobile: mobile,
  //           ispublic: 1,
  //           projectid: projectid
  //         }
  //       };
  //       if(memberopenid){
  //         $.mixin(parames.obj,{memberopenid:memberopenid, ispublic: 2},true);
  //       }
  //       if(projectroomid) {
  //         $.mixin(parames.obj,{projectroomid:projectroomid},true);
  //       }
  //       if(appmemo) {
  //         $.mixin(parames.obj,{memo:appmemo},true);
  //       }
  //       session.vericode = vericode;
    
  //       api.request.get("/hfz/HfzTeamManageAction/addAppointment", parames).then(function(response){ var msg = response.data;
  //         $('#vericode').val('')
  //         if(true){
  //           v.ui.alert('预约成功');
  //           popup.addClass('hide');
  //         }
  //       });
  //     });
    
    
  //     page.goDetail = function(event, id) {
  //       Page.open("./house-preferential-detail.html", {
  //         projectid: id,
  //         fopenid: fopenid,
  //         memberopenid: memberopenid,
  //       });
  //     }
  //   }
    
  // }
})