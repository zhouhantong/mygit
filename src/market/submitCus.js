function submitCus(data, params, type, callback) {
  var _q3h4 = true
  api.request.get('/global/Select/listItemFromCache', {
    titleids:[20160513]
  }, {
    ljsonp: true,
    jdomain: 'g.justhante.com',
    japi: "/qc-webapp/qcapi.do"
  }).then(function(response){
    var msg = response.data;
      if(msg[20160513] && msg[20160513].length > 0) {
        var json = JSON.parse(msg[20160513][0].itemtext)
        v.each(json, function(item){
          if(item.appid == app.id) {
            _q3h4 = false
          }
        })
      }

      if(_q3h4) {
        //需要弹出提示
        $.createElements({
          classes: 'fixed-layer',
          components: [{
            classes: 'box-layer',
            components: [{
              classes: 'title',
              text: '客户设置'
            },{
              classes: 'item-layer mh-scroll-13',
              components: data.map(function(item) {
                return {
                  classes: 'item',
                  dataPid: item.projectid,
                  onSingleTap: function(event) {
                    var el = $(event.target).closest('.item').find('.flag')
                    if(el.hasClass('selected')) {
                      el.removeClass('selected')
                    }else {
                      el.addClass('selected')
                    }
                  },
                  components: [{
                    classes: 'lt',
                    text: item.projectname
                  },{
                    classes: 'flag'
                  },{
                    classes: 'rt',
                    text: '取前三后四报备'
                  }]
                }
              })
            },{
              classes: 'btn-layer',
              components: [{
                classes: 'btn',
                onSingleTap: function() {
                  var pids = []
                  $('.fixed-layer .item').forEach(function(item) {
                    pids.push({
                      projectid: $(item).data('pid'),
                      isShort: $(item).find('.flag').hasClass('selected')
                    })
                  })
                  doFunc(pids, params, type, callback)
                },
                text: '确认报备'
              }]
            }]
          }]
        }, document.body)
      } else {
        doFunc(data, params, type, callback)
      }
    }
  );
}


function doFunc(data, params, type, callback) {
  var projectInfo = []
  v.each(data, function(item){
    var tmp = {projectid: item.projectid, isShort: false}
    if(item.isShort) {
      tmp.isShort = true
    }
    projectInfo.push(tmp)
  })
  if(projectInfo.length) {
    params.projectInfo = projectInfo
    if(type == 1) {  
      var action = '/hfz/HfzTeamManageAction/submitRcmdCustomer' 
    } else if(type == 2) {
      var action = '/hfz/HfzTeamManageAction/submitCustomerSingle'
    }
    api.request.get(action, {
      obj: params
    }).then(function(response){
      $('.fixed-layer').remove()
      callback()
    }).catch(function (e) {
      v.ui.alert(e.response.errmsg).then(() => {
        v.storage.remove(app.session.openid + app.id + 'recommend-data')
        Page.back();
      });
    });
  }
}

// function getShortMobile(mobile) {
//   return mobile.substring(0,3) + mobile.substr(-4)
// }


