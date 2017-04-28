Page.ready({
  init: function(){
    var key;
    var url;
    if(app.menu){
      for(key in app.menu){
        if(v.own(app.menu, key) && !url){
          var value = app.menu[key];
          if(v.isString(value)){
            url = value;
          }else if(Array.isArray(value) && value[0] && value[0].action){
            url = value[0].action;
          }else{
            url = "/consumer2/house-prolist.html";
          }
        }
      }
    }else{
      url = "/consumer2/house-prolist.html";
    }
    Page.redirect(url);
  }
});
