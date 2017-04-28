var SearchHistory = {
  getList: function() {
    return v.storage.get('search-history') || []
  },
  
  add: function(word) {
    var list = this.getList()
    var newList = [word]
    for (var i=0; newList.length < 3 && i < list.length; i++) {
      if (list[i] != word) {
        newList.push(list[i])
      }
    }
    v.storage.set('search-history', newList)
  }
}

var SearchBar = View.extend({
  
  viewInit: function(el, context) {
    var self = this
    var text = el.data('text')
    
    el.addClass('search-bar')
    v.$([
      {classes: 'search-text', text: text || '请输入关键字'},
      {classes: 'icon-speech', tapHighlight: true},
      {classes: 'icon-sep'},
      {classes: 'icon-scan', tapHighlight: true}
    ], el)
    
    var textEl = el.find('.search-text')
    var speechEl = el.find('.icon-speech')
    var scanEl = el.find('.icon-scan')
    var sepEl = el.find('.icon-sep')
    
    if (v.env.aha || v.env.wechat) {
      speechEl.singleTap(function() {
        aha.speech()
      })
      scanEl.singleTap(function() {
        aha.scan()
      })
    }
    
    if (v.env.aha) {
      textEl.singleTap(function(event) {
        aha.search()
      })
    } else {
      if (!v.env.wechat) {
        el.addClass('input-only')
      }
      textEl.tap(function(event) {
        self.showSearchWindow()
      })
    }
  },
  
  search: function(text) {
    if (!text && this.win) {
      var inputEl = this.win.find('.search-input')
      text = inputEl.val();
    }
    if (text) {
      SearchHistory.add(text)
      Page.open('search.html', {word: text})
    }
  },
  
  showSearchWindow: function() {
    var self = this
    var win = v.$([
      {classes: 'search-window', components: [
        {classes: 'search-bar', components: [
          {tag: 'form', action: '#', classes: 'search-form', components:[
            {classes: 'search-input', tag: 'input', type: 'search', placeholder: '请输入关键字'}
          ]},
          {classes: 'icon-speech', tapHighlight: true},
          {classes: 'icon-sep hidable'},
          {classes: 'icon-scan', tapHighlight: true},
          {classes: 'bar-btn search hide', text: '搜索'},
          {classes: 'icon-sep'},
          {classes: 'bar-btn cancel', text: '取消'}
        ]},
        {classes: 'content', components: [
          {classes: 'history-box', components: [
            {classes: 'history-list', tag: 'ul'}
          ]},
          {classes: 'button-box', components: [
            {classes: 'btn selected', components: [
              {classes: 'icon history'},
              {classes: 'label', text: '搜索历史'}
            ]}
          ]}
        ]}
      ]}
    ], document.body)
    
    var btnCancelEl = win.find('.bar-btn.cancel')
    btnCancelEl.singleTap(function() {
      self.hideSearchWindow()
    })
    
    var btnSearchEl = win.find('.bar-btn.search')
    btnSearchEl.singleTap(function() {
      self.search()
    })
    
    var speechEl = win.find(".icon-speech")
    speechEl.singleTap(function() {
      aha.speech()
    })
    var scanEl = win.find(".icon-scan")
    scanEl.singleTap(function() {
      aha.scan()
    })
    
    if (!v.env.aha && !v.env.wechat) {
      speechEl.hide()
      scanEl.hide()
      win.find('.icon-sep.hidable').hide()
    }
    
    var inputEl = win.find('.search-input')
    inputEl[0].focus()
    !function() {
      inputEl[0].focus()
      inputEl.on('input', function() {
        var el = $(this)
        var text = el.val()
        if (text) {
          speechEl.hide()
          // win.find('.icon-sep.hidable').hide()
          scanEl.hide()
          btnSearchEl.show()
        } else {
          if (v.env.aha || v.env.wechat) {
            speechEl.show()
            // win.find('.icon-sep.hidable').show()
            scanEl.show()
          }
          btnSearchEl.hide()
        }
      })
    }.defer(200)
    
    var historyListEl = win.find('.history-list')
    SearchHistory.getList().forEach(function(text) {
      v.$({
        classes: 'history-item',
        text: text,
        onSingleTap: function(event) {
          self.search(text)
        }
      }, historyListEl)
    })
    
    var formEl = win.find('.search-form')
    formEl.on('submit', function(event) {
      self.search()
      event.preventDefault()
    })
    
    self.win = win
  },
  
  hideSearchWindow: function() {
    this.win.remove()
    this.win = null
  }
  
})