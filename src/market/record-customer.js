"use strict";
Page.ready(function ($, query) {

  var page
  var pagetype = parseInt(query.pagetype) || 1;

  var action = [
    "/hfz/HfzAppointmentAction/listMyAppointment", //我的预约
    "/hfz/HfzAppointmentAction/listReportedCustomer", //我的报备
    "/hfz/HfzAppointmentAction/listReportedCustomer", //我的成交
    "/hfz/HfzAppointmentAction/listMyProjectCustomer" //我的客户
  ];
  var paramsList = [{}, {}, {state: 5}, {projectid: query.projectid}];
  var keyword, state, approvestate;

  var states = {
    // 0: "待定",
    // 1: "来电",
    // 2: "来访",
    // 3: "认筹",
    // 4: "认购",
    5: "成交" //"合同",
    // 6: "放款"
  };

  return {

    options: {
      scroller: true,
      wx: true,
      pagingEnabled: true
    },

    onRender: function () {
      page = this

      if (pagetype == 4) {
        page.tpl("item-btn", {}, page.find(".topHeader"));
      }

      page.paging.reset().load()
    },

    onPaging: function (paging) {
      var listEl = page.find(".list");
      if (paging.isFirst()) {
        listEl.empty()
      }

      keyword = page.find('.search').val() ? page.find('.search').val() : '';
      paramsList[3].keyword = keyword;
      paramsList[3].state = state;
      if (approvestate == '1') {
        paramsList[3].approvestate = 1;
      } else {
        paramsList[3].approvestate = '';
      }

      paging.start().then(function (paging) {
        api.request.get(action[pagetype - 1], {
          obj: paramsList[pagetype - 1],
          offset: paging.count,
          size: paging.size
        }).then(function (response) {
          var obj = response.data
          paging.done(obj.list.length, obj.total)

          if (obj.total == 0) {
            return page.tpl("noitem", {}, listEl);
          }
          
          obj.list.forEach(function (item) {
            item.mobile2 = item.mobile;
            if (pagetype == 1) {
              if (item.reportstate == 1) {
                item.typename = "报备成功"
                item.type = 1
              } else if (item.reportstate == 0) {
                item.typename = "未报备"
                item.type = 0
              }
            } else if (pagetype == 2) {
              if (item.state >= 5) {
                item.typename = "交易成功"
                item.type = 1
              } else {
                item.typename = "已报备"
                item.type = 0
              }
            } else if (pagetype == 4) {
              if (item.state >= 5) {
                item.typename = "成交"
                item.type = 1
              } else {
                item.typename = "已报备"
                item.type = 0
              }
              if (item.isprivate == 1) {
                item.mobile2 = item.mobile.substr(0, 3) + '****' + item.mobile.substr(7, 4);
              }
            }
            item.comment = (item.comment ? item.comment : '');
            item.STATETEXT = (item.approvestate == 0 ? '客户状态：待审核' : (item.approvestate == -1 ? '客户状态：无效客户' : ''));
            item.FOOTERSHOW = (pagetype == 4);
            item.APPROVESTATE = (item.state == 0 && item.approvestate == 0);
            item.CHGSTATE = (page.checkChgState(item.state) && item.approvestate == 1);
            item.FOOTERSHOW2 = (pagetype != 4);
            item.MEMO = (item.comment ? true : false);
            item.CONTRACTRECORD = (item.contractrecord && item.contractrecord != 'null' && item.approvestate == 1);

            page.tpl("item", item, listEl);
          })
        })
      })
    },

    updateStatus: function (event, id) {
      if (pagetype != 4) {
        return;
      }
      api.request.get("/hfz/HfzAppointmentAction/getReportedCustomerInfo", {
        obj: {
          id: id
        }
      }).then(function (obj) {
        obj = obj.msg;
        var select = [];
        for (var index in states) {
          var name = states[index];
          if (index > obj.state) {
            select.push({
              value: index,
              html: name
            })
          }
        }
        if (select.length <= 0) {
          return;
        }
        $.createElements({
          classes: 'scrim popup-manage-price',
          components: [{
            classes: 'rank-wrapper',
            components: [{
              classes: 'info-box',
              components: [{
                classes: 'info-head',
                text: '可变状态列表'
              }, {
                classes: 'info-top',
                components: [{
                  classes: 'scroll-list',
                  components: [{
                    classes: 'rank-list',
                    components: select.map(function (item) {
                      return {
                        classes: "rank-item",
                        html: item.html,
                        onTap: function () {
                          api.request.get("/hfz/HfzAppointmentAction/updateReportedCustomerState", {
                            obj: {
                              id: id,
                              state: item.value
                            }
                          }).then(function (obj) {
                            var dom = page.find("#item-" + id + " .typename");
                            dom.html(function () {
                              if (item.value >= 5) {
                                dom.removeClass("value2");
                                dom.removeClass("value3");
                                dom.addClass("value3");
                                return "成交";
                              } else {
                                dom.removeClass("value2");
                                dom.removeClass("value3");
                                dom.addClass("value2");
                                return "已报备";
                              }
                            }())
                            $('.popup-manage-price').remove();
                            page.search();
                          })
                        }
                      }
                    })
                  }]
                }]
              }, {
                classes: 'info-bottom',
                text: '关 闭',
                onSingleTap: function () {
                  $('.popup-manage-price').remove();
                }
              }]
            }]
          }]
        }, document.body);
        new IScroll('.scroll-list');
      })
    },

    updateMemo: function (event, id, comment) {
      console.log('==>', comment);
      // api.request.get("/hfz/HfzAppointmentAction/getReportedCustomerInfo", {
      //   obj: {
      //     id: id
      //   }
      // }).then(function(obj){
      //   obj = obj.msg;
      //   var memo = obj.comment;
      $.createElements({
        classes: 'scrim popup-manage-price',
        components: [{
          classes: 'rank-wrapper',
          components: [{
            classes: 'info-box',
            components: [{
              classes: 'info-head',
              text: '修改备注'
            }, {
              classes: 'info-top2',
              components: [{
                tag: 'textarea',
                rows: 4,
                text: comment
              }]
            }, {
              classes: 'info-bottom2',
              components: [{
                text: '关 闭',
                onSingleTap: function () {
                  $('.popup-manage-price').remove();
                }
              }, {
                text: '保存',
                onSingleTap: function () {
                  api.request.get("/hfz/HfzAppointmentAction/updateCustomerComment", {
                    obj: {
                      id: id,
                      comment: $('.popup-manage-price textarea').val()
                    }
                  }).then(function (obj) {
                    $('.popup-manage-price').remove();
                    page.search();
                  })
                }
              }]
            }]
          }]
        }]
      }, document.body);
      // })
    },

    updateApproveState: function (event, id, state) {
      api.request.get("/hfz/HfzAppointmentAction/approveCustomer", {
        obj: {
          ids: id,
          approvestate: parseInt(state)
        }
      }).then(function (obj) {
        page.search();
      })
    },

    call: function (event, mobile, isprivate) {
      if (!(pagetype == 4 && isprivate == 1)) {
        location.href = 'tel:' + mobile;
      }
    },

    selectState: function (event, id, astate) {
      page.find('li').removeClass('selected');
      $(event.target).addClass('selected');
      page.find('.list').empty();
      state = id;
      approvestate = astate;
      page.paging.reset().load();
    },

    search: function (event) {
      page.find('.list').empty();
      page.paging.reset().load();
    },

    checkChgState: function (state) {
      for (var index in states) {
        // var name = states[index];
        if (index > state) {
          return true;
        }
      }
      return false;
    }

  }
})