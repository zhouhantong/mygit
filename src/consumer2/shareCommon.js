
function setShareUrl(query) {
  var self = this
  api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function (response) {
    var userObj = response.data
    //设置分享链接
    if(userObj.agent && userObj.agent.state == 1 && userObj.agent.workstate != 0 && (userObj.agent.type != 3)) {
      //是经纪人
      delete query.fopenid
      delete query.memberopenid
      query.fopenid = app.session.openid
      query.memberopenid = app.session.openid
      app.wechat.SHARE_LINK = v.url.build(query)
    } else if(userObj.teammember && userObj.teammember.state == 1) {
      //是队员或队长
      delete query.fopenid
      delete query.memberopenid
      query.fopenid = userObj.teammember.leaderopenid     
      query.memberopenid = app.session.openid     
      app.wechat.SHARE_LINK = v.url.build(query)       
    }        
  })
}