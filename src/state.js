Page.ready({
  
  options: {
    wxSharable: false
  },
  
  init: function() {
    var key = app.id + "-oauth-state";
    var url = v.cookie.get(key);
    if(!url){
      return v.ui.alert('认证失败')
    }
    v.cookie.remove(key);
    new Image().src = "state-cache:" + url;
    new Image().src = "state-openUrl:" + url;
    Page.redirect(url, {});
  }
  
});
