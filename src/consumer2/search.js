"use strict";
Page.ready(function($, query) {

  var scroller;
  
  return {
    name: "zy-search",
    options: {
      menu: true,
      trademark: true,
      wx: true,
      sharable: true
    },

    onRender: function() {
      var page = $('#page-zy-search')
      var classify = query.classify
      var search = query.search
      var settings = {
        school: {id: 1, title: '学区优房'},
        map: {id: 1, title: '地图找房'},
        brand: {id: 9, title: '品牌选房'},
        subway: {id: 8, title: '轨道快房'},
        common: {id: -1, title: '搜索好房'}
      }
      var setting = classify ? settings[classify] : settings.common
      var types = []
      var areas = {}
    
      var listEl = page.find('.list')
      var houseListEl = page.find('.house-list')
      var searchEl = $('#search')
    
      var type = 0;
    
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
      })
    
      page.addClass('classify-' + (classify || 'common'))
      scroller = new IScroll(page.find('aside')[0])
    
      if (search) {
        searchEl.val(search)
      }
    
      Page.setTitle(query.title ? query.title : setting.title)
    
      page.find('.searchbt').singleTap(function() {
        pageIndex = 0
        pageCount = 0
        hasMore = true
        loadData()
      })
    
      //设置学区、地铁、品牌显示
      getListItem(11,getInfo);
    
      function getInfo() {
        if (setting.id >= 0) {
          // 初始化分类
          var titleid = setting.id
          api.request.get("/global/Select/listItem", {
            obj: {titleid: titleid}
          }).then(function(response){ var msg = response.data;
            if (true) {
              if (titleid == 1 || titleid == 9) {
                msg.list.forEach(function(item) {
                  if (titleid == 1) {
                    types.push([item.itemid, item.itemtext])
                  } else {
                    types.push([item.itemtext, item.itemtext])
                  }
                })
                loadData()
              } else { // titleid = 8
                var list = JSON.parse(msg.list[0].itemtext)
                list.forEach(function(obj, index) {
                  var key = 'subway' + (index + 1)
                  types.push([key, obj[key].split('=')[0]])
                })
    
                api.request.get("/global/Select/listItem", {
                  obj: {titleid: 1}
                }).then(function(response){ var msg = response.data;
                  if (true) {
                    msg.list.forEach(function(item) {
                      areas[item.itemid] = item.itemtext
                    });
                    loadData()
                  }
                });
              }
              initTypes()
            }
          })
        } else {
          loadData()
        }
      }
    
      function initTypes() {
        types.forEach(function(item, index) {
          $.createElements({
            classes: 'item' + (index == type ? ' selected' : ''),
            text: item[1],
            onSingleTap: function() {
              var el = $(this)
              listEl.find('.item').removeClass('selected')
              el.addClass('selected')
              type = index
              pageIndex = 0
              pageCount = 0
              hasMore = true
              loadData()
            }
          }, listEl)
        })
        scroller.refresh();
      }
    
      function loadData() {
        loading = true
    
        search = searchEl.val()
    
        var data = types[type]
        var params = {
          offset: pageIndex,
          size: pageSize
        }
    
        if (pageIndex == 0) {
          houseListEl.empty()
        }
    
        if (setting.id >= 0) {
          switch (classify) {
            case 'school':
              params.isxuequ = 1,
              params.area = data[0]
              break
            case 'map':
              params.area = data[0]
              break
            case 'brand':
              params.brand = data[0]
              break
            case 'subway':
              params.issubway = 1
              params[data[0]] = 1
              break
          }
        }
    
        if (search) {
          params.keyword = search
        }
    
        api.request.get("/global/Project/search", params).then(function(response){ var msg = response.data;
          if (msg.total == 0) {
            if(classify) {
              page.find('.house-list').append(<div className="noitem" >暂无数据</div>)
            } else {
              page.find('.house-list').append(<div className="noitem noleft" >暂无数据</div>)
            }
            return;
          }          

          if (true && msg.list) {
    
            msg.list.forEach(function(house) {
              var tags = []
    
              if (setting.id >= 0) {
                switch (classify) {
                  case 'school':
                    if (house.schooldesc) {
                      tags = house.schooldesc.split(',')
                    }
                    break
                  case 'map':
                    house.areadesc && tags.push(house.areadesc)
                    break
                  case 'brand':
                    break
                  case 'subway':
                    tags.push(areas[house.area])
                    if (house.subwaystation) {
                      tags = tags.concat(house.subwaystation.split(','))
                    }
                    break
                }
              }
    
              $.createElements({
                classes: 'house-item',
                onSingleTap: function(event){
                  // if(!$(event.target).hasClass('online-txt')){
                  if(house.cooporatetype == 100) {
                    Page.open('./house-online.html?projectid=' + house.id);
                  }else {
                    Page.open('./detail-new.html?projectid=' + house.id);
                  }
                  // }
                },
                components: [
                  {classes: 'info-box', components: [
                    {classes: 'img', style: house.picurl ? 'background-image: url(' + house.picurl + ')' : ''},
                    {classes: 'content', components: [
                      {classes: 'title', text: house.projectname},
                      {classes: 'value', text: '价 格：' + house.price},
                      {classes: 'value', text: '地 址：' + house.address},
                      {classes: 'value ' + (house.hasmanagerprice ? 'hasmanagerprice' : ' hide'), text: '本周经理报价'},
                      {classes: 'tag-box-inline', tag: 'ul', components: [
                        {classes: 'tag' + (house.issubway ? '' : ' hide'), tag: 'li', text: commonListItem[1]},
                        {classes: 'tag' + (house.isxuequ ? '' : ' hide'), tag: 'li', text: commonListItem[2]},
                        {classes: 'tag' + (house.brand ? '' : ' hide'), tag: 'li', text: commonListItem[0]},
                        // {classes: 'tag' + (house.hasmanagerprice ? '' : ' hide'), tag: 'li', text: '经理报价'}
                      ]}
                    ]},
                    {classes: 'arrow'},
                    {classes: 'online-logo ' + (house.cooporatetype == 100 ? '' : 'hide')}
                    // {
                    //   classes: 'online-txt ' + (house.cooporatetype == 100 ? '' : 'hide'),
                    //   text: '进入线上售楼部>>',
                    //   onSingleTap: function() {
                    //     Page.open('./house-online.html?projectid=' + house.id);
                    //   }
                    // }
                  ]},
                  {classes: 'tag-box' + (tags.length ? '' : ' hide'), components: [
                    {classes: 'tag', components:[
                      {text: tags.join(' | ')}
                    ]}
                  ]}
                ]
              }, houseListEl)
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
    }
    
  }
})