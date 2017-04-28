"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-cuslist2",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-cuslist2');
    
      var type = query.type ? parseInt(query.type) : '';
      var awardtype = query.awardtype ? parseInt(query.awardtype) : '';
      var position = query.position ? parseInt(query.position) : '';
    
      var times = [['createtime','提交时间'],['visittime','到访时间'],['pledgetime','认筹时间'],['subscribetime','认购时间'],['dealtime','签约时间'],['paidtime','全款到账时间'],['expiretime','过期时间']];
    
      switch(awardtype){
        case 2:
          page.find('.common-topheader').text('到访客户列表');
          break;
        case 3:
          page.find('.common-topheader').text('认筹客户列表');
          break;
        case 4:
          page.find('.common-topheader').text('认购客户列表');
          break;
        case 5:
          page.find('.common-topheader').text('签约客户列表');
          break;
        default:
          page.find('.common-topheader').text('推荐客户列表');
          break;
      }
      var starttime = query.starttime ? query.starttime : ''
      var endtime = query.endtime ? query.endtime : ''
      var projectid = query.projectid ? parseInt(query.projectid) : ''
    
      var cusListEl = page.find('.cus-list');
      var body = document.body;
      var pageIndex = 0
      var pageSize = 10
      var pageCount = 0
      var loading = false
      var hasMore = true
      $(window).on('scroll', function(event) {
        var bottom = body.scrollHeight - (body.scrollTop + window.innerHeight);
        if (bottom <= 200 && !loading && hasMore) {
          loadData()
          DEBUG && console.debug('debug');
        }
      });
    
      //查询数据
      loadData();
      function loadData() {
        loading = true
    
        var params = {
          obj:{
            projectid: projectid
          },
          offset: pageIndex,
          size: pageSize,
        }
    
        if(starttime) {
          params.obj.starttime = starttime
        }
        if(endtime) {
          params.obj.endtime = endtime
        }
        if(awardtype > 0) {
          params.obj.state = awardtype
        }
    
        if (pageIndex == 0) {
          cusListEl.empty()
        }
    
        api.request.get("/hfz/HfzChannelManageAction/listCustomer", params).then(function(response){ var msg = response.data;
          if(true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'cus-nodata-item',
              text: '未找到相关记录'
            }, cusListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
    
              var time = times[obj.state > 0 ? obj.state-1 : 0];
    
              $.createElements({
                classes: 'cus-item',
                components: [{
                  classes: 'info-box',
                  components: [{
                    classes: 'username',
                    text: obj.name
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: '电话'
                  },{
                    tapHighlight: true,
                    onSingleTap: function() {
                      location.href = 'tel:' + obj.mobile;
                      return;
                    },
                    classes: 'mobile',
                    text: obj.mobile
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: '项目名称'
                  },{
                    text: obj.projectname
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: time[1]
                  },{
                    text: Fn.getFullTime(obj[time[0]])
                  }]
                },{
                  classes: 'info-box ' + (obj.brokerage ? '' : 'hide'),
                  components: [{
                    text: '佣金'
                  },{
                    text: (obj.brokerage ? '¥ '+obj.brokerage : '')
                  }]
                // },{
                //   classes: 'info-box ' + (type ? '' : 'hide'),
                //   components: [{
                //     text: '所属经纪人'
                //   },{
                //     text: (obj.agentname ? obj.agentname : '')
                //   }]
                }]
              }, cusListEl)
            })
            var size = msg.list.length
            var total = msg.total
            pageCount += size
            hasMore = (size >= pageSize && (total < 0 || pageCount < total))
            if (hasMore) {
              pageIndex += size
            }
          }
          loading = false
        })
      }
    
      // page.find('select').on('change', function() {
      //   $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
      //   status = parseInt(this.value);
      // });
    }
    
  }
})