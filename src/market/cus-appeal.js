"use strict";
Page.ready(function ($, query) {

  var page
  var type = query.type ? parseInt(query.type) : 0

  var types
  var listComplaint

  var listEl
  var cusListEl

  return {
    name: 'cus-management',

    options: {
      wx: true,
      pagingEnabled: true
    },

    onRender: function () {
      page = this // 自动生成的代码
      listEl = page.find('.list');
      cusListEl = page.find('.cus-list');

      //设置左侧滑动
      new IScroll(page.find('aside')[0]);

      api.request.get("/hfz/HfzCommAction/listComplaintType").then(response => {
        listComplaint = response.msg.list
        this.setTypes();
      });

      page.find('.btn-appeal').singleTap(function () {
        $.createElements({
          classes: 'popup-appeal-layer',
          components: [{
            classes: 'appeal-layer',
            components: [{
              classes: 'appeal-title',
              text: '我要申诉'
            }, {
              // classes: 'form-view',
              components: [{
                classes: 'view-layer',
                components: [{
                  tag: 'label',
                  text: '申诉类型：'
                }, {
                  classes: 'text-value'
                }, {
                  tag: 'select',
                  components: [{
                    tag: 'option',
                    id: -1,
                    text: ''
                  }].concat(listComplaint.map(function (item, index) {
                    return {
                      tag: 'option',
                      value: item.id,
                      text: item.name
                    };
                  }))
                }]
              }, {
                classes: 'view-layer',
                components: [{
                  tag: 'label',
                  text: '申诉图片：'
                }, {
                  tag: 'form',
                  method: 'post',
                  enctype: 'multipart/form-data',
                  components: [{
                    classes: 'img-layer',
                    components: [{
                      classes: 'img-area',
                      components: [{
                        tag: 'input',
                        type: 'file',
                        accept: 'image/*',
                        classes: 'file-input',
                        name: 'fileinput1'
                      }, {
                        tag: 'img',
                        classes: 'upload-img',
                        src: './images/upload.png'
                      }]
                    }, {
                      classes: 'img-area',
                      components: [{
                        tag: 'input',
                        type: 'file',
                        accept: 'image/*',
                        classes: 'file-input',
                        name: 'fileinput2'
                      }, {
                        tag: 'img',
                        classes: 'upload-img',
                        src: './images/upload.png'
                      }]
                    }, {
                      classes: 'img-area',
                      components: [{
                        tag: 'input',
                        type: 'file',
                        accept: 'image/*',
                        classes: 'file-input',
                        name: 'fileinput3'
                      }, {
                        tag: 'img',
                        classes: 'upload-img',
                        src: './images/upload.png'
                      }]
                    }, {
                      classes: 'img-area',
                      components: [{
                        tag: 'input',
                        type: 'file',
                        accept: 'image/*',
                        classes: 'file-input',
                        name: 'fileinput4'
                      }, {
                        tag: 'img',
                        classes: 'upload-img',
                        src: './images/upload.png'
                      }]
                    }]
                  }]
                }]
              }, {
                classes: 'view-layer',
                components: [{
                  tag: 'label',
                  text: '备注内容：'
                }, {
                  tag: 'textarea',
                  rows: '5'
                }]
              }]
            }, {
              classes: 'act-bar',
              components: [{
                text: '取消',
                onSingleTap: function () {
                  !function () {
                    $('.popup-appeal-layer').remove()
                    return
                  }.defer(200)
                }
              }, {
                text: '提交',
                onSingleTap: function (event) {
                  event.stopPropagation();
                  var type = $('select')[0].value;
                  var content = $('textarea').val();
                  if (type < 0) {
                    return v.ui.alert('请选择申诉类型');
                  }
                  if (!content) {
                    return v.ui.alert('备注内容不能为空');
                  }
                  $('.popup-appeal-layer').addClass('hide')
                  !function () {
                    var backurl = location.protocol + '//' + location.host + '/market/cus-appeal.html'
                    var url = app.API_URL + '?j=' +
                      encodeURIComponent(JSON.stringify({
                        openid: app.session.openid,
                        passport: app.session.passport,
                        action: '/hfz/HfzTeamManageAction/addComplaint',
                        requestParam: {
                          obj: {
                            type: parseInt(type),
                            content: content
                          },
                          backurl: backurl
                        }
                      }));
                    var form = $('form');
                    form.attr('action', url);
                    form[0].submit();
                    $('.popup-appeal-layer').remove()
                    app.loading.start();
                  }.defer(200)
                }
              }]
            }]
          }]
        }, document.body)

        if (window.File && window.FileList && window.FileReader && window.Blob) {
          $('.file-input').on('change', page.getFiles);
        } else {
          v.ui.alert('浏览器不支持');
        }

        $('select').on('change', function () {
          $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
        });
      })
    },

    onPaging: function (paging) {
      if (paging.isFirst()) {
        cusListEl.empty()
      }

      var action = '/hfz/HfzTeamManageAction/listMyComplaints';
      var params = {};
      switch (type) {
        case 0:
          params.finished = 'false'
          page.find('.btn-layer').removeClass('hide')
          break;
        case 1:
          params.finished = 'true'
          page.find('.btn-layer').addClass('hide')
          break;
      }

      paging.start().then(paging => {
        api.request.get(action, {
          obj: params,
          offset: paging.count,
          size: paging.size
        }).then(response => {
          var obj = response.data
          paging.done(obj.list.length, obj.total)

          if (obj.total == 0) {
            page.tpl("noitem", {}, cusListEl);
            return;
          }

          obj.list.forEach(function (item) {
            item.time = Fn.getFullTime(item.createtime)
            item.content = item.content.replace(/\n/g, '<br>')
            var tmpEl
            if (item.contenttype == 99) {
              tmpEl = page.tpl("cus-item2", item, cusListEl);
            } else {
              tmpEl = page.tpl("cus-item", item, cusListEl);
            }
            var imgEl = tmpEl.find('.image-layer')
            var tmpSrc = Fn.getPicUrl(item.pic1) + '||' + Fn.getPicUrl(item.pic2) + '||' + Fn.getPicUrl(item.pic3) + '||' + Fn.getPicUrl(item.pic4)
            if (item.pic1) {
              page.tpl("img-block", {
                INDEX: 0,
                imgsrc: Fn.getPicUrl(item.pic1),
                IMGSRC: tmpSrc
              }, imgEl);
            }
            if (item.pic2) {
              page.tpl("img-block", {
                INDEX: 1,
                imgsrc: Fn.getPicUrl(item.pic2),
                IMGSRC: tmpSrc
              }, imgEl);
            }
            if (item.pic3) {
              page.tpl("img-block", {
                INDEX: 2,
                imgsrc: Fn.getPicUrl(item.pic3),
                IMGSRC: tmpSrc
              }, imgEl);
            }
            if (item.pic4) {
              page.tpl("img-block", {
                INDEX: 3,
                imgsrc: Fn.getPicUrl(item.pic4),
                IMGSRC: tmpSrc
              }, imgEl);
            }
          })
        })
      })
    },

    setTypes: function () {
      this.wrapperEl.style('padding-top', '0px')
      types = [{
        type: 0,
        name: '处理中'
      }, {
        type: 1,
        name: '已处理'
      }];
      //初始化状态列表
      this.initTypes();
    },

    initTypes: function () {
      types.forEach(function (item, index) {
        $.createElements({
          classes: 'item' + (item.type == type ? ' selected' : ''),
          html: item.name,
          onSingleTap: function () {
            var el = $(this)
            listEl.find('.item').removeClass('selected')
            el.addClass('selected')
            el.removeClass('hasbefore')
            type = item.type
            page.paging.reset().load()
          }
        }, listEl)
      })
      page.paging.reset().load()
    },

    getFiles: function (event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      var img = $(event.target).siblings(".upload-img")[0];
      var remove = $(event.target).closest('.img-area');
      reader.onload = function (e) {
        if ($.env.ios) {
          img.src = e.target.result;
        } else {
          img.src = e.target.result.replace('data:', 'data:image/gif;');
        }
      }
      reader.readAsDataURL(file);
    },

    showImage: function (event, url, index) {
      var tmps = url.split('||')
      var imgs = []
      tmps.forEach(function (item) {
        if (item) {
          imgs.push(item)
        }
      })
      wx.previewImage({
        current: imgs[index],
        urls: imgs
      });
    }

  }
})