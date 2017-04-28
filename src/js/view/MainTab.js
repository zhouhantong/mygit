var MainTab = View.extend({
  
  viewInit: function(el, context) {
    var self = this
    // var selected = el.data('selected') || 'album'
    
    el.addClass('main-tab')
    
    self.tapToClose = function(event) {
      self.hideSubmenu();
    }
    
    var buttons = [{
      classes: 'button back', 
      tapHighlight: true, 
      onSingleTap: self.onBack
    }]
    v.each(app.menu, function(value, key) {
      buttons.push({classes: 'sep'})
      buttons.push({
        classes: 'button',
        dataName: key,
        tapHighlight: true,
        components: [{classes: 'label', text: key }]
      })
    })
    
    v.$(buttons, el)
    
    // this.select(selected)
    
    self.el.find('.button').singleTap(function(event) {
      var button = v(this)
      var name = button.data('name')
      var items = app.menu[name]
      if (v.isString(items)) {
        Page.open(items)
      } else {
        self.showSubmenu(button, name, items)
      }
    })
  },
  
  // select: function(name) {
  //   this.el.find('.button.selected').removeClass('selected')
  //   this.el.find('.button.' + name).addClass('selected')
  // },
  
  onBack: function() {
    history.go(-1)
  },
  
  showSubmenu: function(button, name, items) {
    if (this.submenu) {
      if (this.lastName && this.lastName == name) {
        this.lastName = null
        return this.hideSubmenu()
      }
      this.submenu.remove();
    }
    
    this.lastName = name;
    
    var self = this
    var rect = button.rect()
    // var width = 176
    var width = (v(document.body).rect().width - rect.height) / 3 | 0
    var left = rect.left + (rect.width - width) / 2

    if (left + width > window.innerWidth) {
      left = window.innerWidth - width - 1;
    }
    
    this.submenu = v.$({
      id: 'main-submenu',
      left: left + 4,
      style: 'width:' + (width - 8) + 'px',
      components: items.map(function(value) {
        return {
          classes: 'main-menu-item',
          tapHighlight: true,
          dataAction: value.action,
          onSingleTap: function(event) {
            self.hideSubmenu();
            var action = $(this).data('action');
            Page.open(action && action !== '#' ? action : '404.html');
          },
          components: [{
            classes: 'label',
            text: value.name
          }]
        };
      })
    }, this.context.el);

    // alert(width)
    // alert(this.submenu.rect().width)
    $(document.body).on('tap', this.tapToClose).addClass('main-submenu-showing');
  },
  
  hideSubmenu: function() {
    var self = this
    self.lastName = null;
    (function(){
      self.submenu.addClass('hide-main-submenu');
    }).defer(200);
    $(document.body).off('tap', this.tapToClose).removeClass('main-submenu-showing');
  }
  
})