"use strict";
Page.ready(function($, query) {

  var fopenid = (query.fopenid || '')
  var memberopenid = (query.memberopenid || '')

  var keyword = query.keyword || ''
  var area = query.area | 0
  var price = query.price | 0
  var property = query.property | 0

  var listEl, searchEl

  return {

    options: {
      menu: true,
      wxShareUrl: true,
      pagingEnabled: true,
      sharable: true
    },

    ini() {
      setShareUrl(query)
    },

    onRender() {
      listEl = this.find('.list')
      searchEl = v('#search')
      searchEl.val(keyword);

      this.initFilters()

      var self = this
      $('select').on('change', function () {
        var vtxt = this.options[this.selectedIndex].innerHTML;
        var parent = $(this).parent();
        parent.find('div.text-value').text(vtxt);
        if (!vtxt) {
          if (parent.hasClass('type-area')) {
            $('.type-area .text-value').text('按区域');
          }
          if (parent.hasClass('type-price')) {
            $('.type-price .text-value').text('按价格');
          }
          if (parent.hasClass('type-property')) {
            $('.type-property .text-value').text('按类型');
          }
        }
        self.paging.reset().load()
      });

      $('form').on('submit', () => {
        this.search()
        return false
      })
      $('.search-icon').singleTap(() => this.search());
    },

    async onPaging(paging) {
      if (paging.isFirst()) {
        listEl.empty()
      }

      await paging.start()

      var obj = await '/global/Project/search'.GET({
        cooporatetype: 100,
        keyword: searchEl.val() || undefined,
        area: $('.type-area select')[0].value | 0 || undefined,
        filterprice: $('.type-price select')[0].value | 0 || undefined,
        properties: $('.type-property select')[0].value | 0 || undefined,
        offset: paging.count,
        size: paging.size
      })

      paging.done(obj.list.length, obj.total)

      if (paging.count == 0) {
        listEl.append(<div className="noitem">暂无数据</div>)
        return;
      }

      obj.list.forEach(item => {
        var onlineLogo
        if (item.displaytype == 10) { //专场
          onlineLogo = 'zc'
        } else if (item.displaytype == 20) { //主打
          onlineLogo = 'zd'
        } else {
          onlineLogo = 'hide'
        }

        listEl.append(
          <div class="item" v-link={"*goOnline " + item.id}>
            <DelayImage tag="img" data-src={item.picurl}/>
            <div class="right-pannel">
              <div class="title">{item.projectname}</div>
              <div class="citem">{item.price}</div>
              <div class='citem'>{item.address}</div>
              <div class="infobar">
                { item.isxuequ == 1 && <div>学区房</div> }
                { item.issubway == 1 && <div>地铁房</div> }
                { item.brand && <div>大品牌</div> }
              </div>
            </div>
            <div class={"online-logo " + onlineLogo}></div>
            <div class="online hide" v-link={"*goOnline " + item.id}>进入线上售楼部>></div>
          </div>
        )
      })
    },

    search() {
      var keyword = $('#search').val() || undefined;
      var area = $('.type-area select').val() || undefined;
      var price = $('.type-price select').val() || undefined;
      var property = $('.type-property select').val() || undefined;
      // $('form').attr('action', v.url.build({keyword, area, price, property}))
      // if(keyword){
        Page.open(null, {keyword, area, price, property}, true)
      // }
    },

    async initFilters() {
      var settings = ['', [area, 'area'], [price, 'price'], [property, 'property']]
      var msg = (await api.listItemCache.get({ titleids:[1,2,3] })).data

      v.each(msg, (item, key) => {
        var [itemid, name] = settings[key]
        v.$([{itemid: '', itemtext: ''}].concat(item).map(item => {
          var el = <option value={item.itemid}>{item.itemtext}</option>
          if (itemid && itemid == item.itemid) {
            $(`.type-${name} .text-value`).text(item.itemtext)
            el.attr('selected', 'selected')
          }
          return el
        }), `.type-${name} > select`)
      });

      this.paging.load()
    },

    goDetail(event, projectid) {
      Page.open("./detail-new.html", {fopenid, memberopenid, projectid})
    },

    goOnline(event, projectid) {
      Page.open('./house-online.html', {fopenid, memberopenid, projectid})
    }
  }
})