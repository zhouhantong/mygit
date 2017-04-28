"use strict";
Page.ready(function($, query) {

  var self

  var projectid = parseInt(query.projectid);

  var from = query.from ? query.from : '';
  
  return {
    name: "detail",
    options: {
      autoRender: false,
      menu: true
    },
    init: function(){
      self = this;

      api.info.get({
        projectid: projectid
      }).then(function(response) {
        var msg = response.data;
        // $('title').text(msg.base.projectname);
        Page.setTitle(msg.base.projectname);
        if (msg.room && msg.room.length) {
          //创建户型图
          page.find('.project-housetype').removeClass('hide');
          self.createRoom(msg.room);
        }
        //交通导航
        self.createNav(msg.base);
        //详细信息
        self.projectDetail(msg.base);
        //底部菜单
        if (!from) {
          // app.createXkbMenu(projectid, msg.base.tourl);
        }

        self.render();
      });
    },
    onRender: function(){

    },
    createRoom: function(picList){
      $.createElements([{
        classes: 'common-header-item',
        html: '主力户型'
      }, {
        classes: 'housetype',
      }], '.project-housetype');

      var len = picList.length;
      if (len > 2) {
        var data = [];
        var groupData = [];
        var tmp = [];
        for (var i = 0; i < len; i++) {
          tmp.push(picList[i]);
          if (i % 2 == 1 || i == len - 1) {
            groupData.push(tmp);
            tmp = [];
          }
        }
        for (var i = 0; i < groupData.length; i++) {
          data.push({
            classes: 'roomarea hflexbox',
            components: groupData[i].map(function(item) {
              return {
                classes: 'room2',
                onTap: function() {
                  self.showOrigin(picList, 0);
                  // Page.open('./housetype.html',{
                  //   projectid: projectid,
                  //   roomid: item.id
                  // },true);
                },
                components: [{
                  text: item.roomname
                }, {
                  tag: 'img',
                  src: app.BASE_URL + item.pic.picurl
                }]
              }
            })
          });
        }
        new v.ui.Carousel({
          index: 0,
          mode: 'book',
          length: data.length,
        }).on('update', function(event){
          var el = event.el.empty()
          var index = event.index
          $.createElements(data[index], el);
        }).render(page.find('.housetype'));

        $.createElements({
          classes: 'next-btn',
          onTap: function() {
            slides.next();
          }
        }, '.housetype');

      } else {
        $.createElements({
          classes: 'hflexbox roomarea',
          components: picList.map(function(item) {
            return {
              classes: 'room',
              onTap: function() {
                self.showOrigin(picList, 0);
                // Page.open('./housetype.html',{
                //   projectid: projectid,
                //   roomid: item.id
                // },true);
              },
              components: [{
                text: item.roomname
              }, {
                tag: 'img',
                src: app.BASE_URL + item.pic.picurl
              }]
            }
          })
        }, '.vpage-content .housetype');
      }
    },
    createNav: function(info){
      $.createElements([{
        classes: 'common-header-item',
        html: '交通导航'
      }, {
        tag: 'iframe',
        classes: 'iframe',
        frameborder: 'no',
        framemargin: '0',
        src: 'mapstatic.html?latitude=' + info.latitude + '&longitude=' + info.longitude
      }, {
        classes: 'nav',
        onTap: function() {
          Fn.addHistoryLog(projectid, 7);
          Page.open('http://api.map.baidu.com/marker?location=' + info.latitude + ',' + info.longitude + '&title=' + info.projectname + '&content=' + info.projectname + '&output=html');
          // Page.open('./map.html',{
          //   latitude: info.latitude,
          //   longitude: info.longitude,
          //   streetpanorama: info.streetpanorama,
          //   title: encodeURIComponent(info.projectname)
          // });
        }
      }], '.vpage-content .project-nav');
      page.find('.project-nav').removeClass('hide');
    },
    projectDetail: function(info){
      $.createElements([{
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '物业类型'
        }, {
          classes: 'wy',
          text: ''
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '地址'
        }, {
          text: info.address
        }]
      }, {
        classes: 'detail-item',
        components: [{
            tag: 'label',
            html: '价格'
          }, {
            text: info.price
          }]
          // },{
          //   classes: 'detail-item',
          //   components: [{
          //     tag: 'label',
          //     html: '开盘时间'
          //   },{
          //     text: info.opentime
          //   }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '售楼处地址'
        }, {
          text: info.saleaddress
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '建筑类别'
        }, {
          text: info.structure
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '入住时间'
        }, {
          text: info.deliverytime
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '开发商'
        }, {
          text: info.estatecompany
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '产权年限'
        }, {
          text: info.propertyyears
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '容积率'
        }, {
          text: info.floorarearatio
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '绿化率'
        }, {
          text: info.greeningrate
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '总户数'
        }, {
          text: info.houses
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '停车位'
        }, {
          text: info.parking
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '物业费'
        }, {
          text: info.propertyexpense
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '物业公司'
        }, {
          text: info.propertycompany
        }]
      }, {
        classes: 'detail-item',
        components: [{
          tag: 'label',
          html: '装修状况'
        }, {
          text: info.decoration
        }]
      }], '.vpage-content .project-detail');

      var str = '';
      api.listItemCache.get({
        titleids: [3]
      }).then(function(response) {
        var msg = response.data;
        msg[3].forEach(function(item) {
          if (item.itemid == info.properties1 || item.itemid == info.properties2 || item.itemid == info.properties3 || item.itemid == info.properties4 || item.itemid == info.properties5) {
            str = str + item.itemtext + '、';
          }
        });
        if (str) {
          page.find('.wy').html(str.substring(0, str.length - 1));
        }
      });
    },
    showOrigin: function(photos,index){
      $.createElements({
        id: 'photo-view',
        classes: 'scrim',
        onTouchmove: function() {
          return false;
        },
        components: [{
          id: 'photo-slides',
          onSingleTap: function() {
            $('#photo-view').remove();
          }
        }]
      }, document.body);
      new v.ui.Carousel({
        index: index,
        mode: 'book',
        length: data.length,
      }).on('update', function(event){
        var el = event.el.empty()
        var index = event.index
        el.children('img').remove();
        el.children('.img-text').remove();
        var photo = photos[index];
        var imgEl = $.createElements([{
          tag: 'img',
          classes: 'origin-photo',
          src: app.BASE_URL + item.pic.picurl
        }, {
          classes: 'img-text',
          style: 'position: absolute;top: 0;width: 60px;text-align: center;color:#fff;font-size: 16px;font-weight:bold;left:50%;margin-left:-30px;line-height: 30px',
          text: (index + 1) + '/' + photos.length
        }], el);
      }).render($('#photo-slides'));
    }
  }

  // return {
    
  //   options: {
  //     scroller: true,
  //     trademark: true,
  //     wx: true
  //   },

  //   onRender: function() {
  //     var page = $('#page-detail');
    
  //     var projectid = parseInt(query.projectid);
    
  //     var from = query.from ? query.from : '';
  //     //获取楼盘信息
  //     api.info.get({
  //       projectid: projectid
  //     }).then(function(response){ var msg = response.data;
  //       console.log(code,msg);
  //       if(code == 0 && msg) {
  //         // $('title').text(msg.base.projectname);
  //         Page.setTitle(msg.base.projectname);
  //         if(msg.room && msg.room.length) {
  //           //创建户型图
  //           page.find('.project-housetype').removeClass('hide');
  //           createRoom(msg.room);
  //         }
  //         //交通导航
  //         createNav(msg.base);
  //         //详细信息
  //         projectDetail(msg.base);
  //         //底部菜单
  //         if(!from) {
  //           app.createXkbMenu(projectid,msg.base.tourl);
  //         }
  //       }
  //     });
    
  //     //banner
  //     function createRoom(picList) {
  //       $.createElements([{
  //         classes: 'common-header-item',
  //         html: '主力户型'
  //       },{
  //         classes: 'housetype',
  //       }],'.project-housetype');
    
  //       var len = picList.length;
  //       if(len > 2) {
  //         var data = [];
  //         var groupData = [];
  //         var tmp = [];
  //         for(var i=0;i<len;i++) {
  //           tmp.push(picList[i]);
  //           if(i % 2 == 1 || i == len - 1) {
  //             groupData.push(tmp);
  //             tmp = [];
  //           }
  //         }
  //         for(var i=0;i<groupData.length;i++) {
  //           data.push({
  //             classes: 'roomarea hflexbox',
  //             components: groupData[i].map(function(item) {
  //               return {
  //                 classes: 'room2',
  //                 onTap: function(){
  //                   showOrigin(picList,0);
  //                   // Page.open('./housetype.html',{
  //                   //   projectid: projectid,
  //                   //   roomid: item.id
  //                   // },true);
  //                 },
  //                 components: [{
  //                   text: item.roomname
  //                 },{
  //                   tag: 'img',
  //                   src: app._photoUrl(item.pic.picurl)
  //                 }]
  //               }
  //             })
  //           });
  //         }
  //         var slides = new app.Slides($('.vpage-content .housetype'), {
  //           mode: '',
  //           snapping: true,
  //           // onSnap: function(dir) {
  //           //   if (dir < 0 && this.index <= 0 ||
  //           //       dir > 0 && this.index >= data.length - 1) {
  //           //     return false;
  //           //   }
  //           // },
  //           onUpdate: function(index, el) {
  //             // if (index < 0 || index >= data.length) {
  //             //   return false;
  //             // }
  //             index = ((index % groupData.length) + groupData.length) % groupData.length;
  //             el.empty();
  //             $.createElements(data[index], el);
  //           },
  //           onSnapEnd: function() {
  //             slides.snapping = true;
  //           }
  //         });
    
  //         $.createElements({
  //           classes: 'next-btn',
  //           onTap: function() {
  //             slides.next();
  //           }
  //         },'.housetype');
    
  //       } else {
  //         $.createElements({
  //           classes: 'hflexbox roomarea',
  //           components: picList.map(function(item){
  //             return {
  //               classes: 'room',
  //               onTap: function(){
  //                 showOrigin(picList,0);
  //                 // Page.open('./housetype.html',{
  //                 //   projectid: projectid,
  //                 //   roomid: item.id
  //                 // },true);
  //               },
  //               components: [{
  //                 text: item.roomname
  //               },{
  //                 tag: 'img',
  //                 src: app._photoUrl(item.pic.picurl)
  //               }]
  //             }
  //           })
  //         }, '.vpage-content .housetype');
  //       }
  //     }
    
  //     //交通导航
  //     function createNav(info) {
  //       $.createElements([{
  //         classes: 'common-header-item',
  //         html: '交通导航'
  //       },{
  //         tag: 'iframe',
  //         classes: 'iframe',
  //         frameborder: 'no',
  //         framemargin: '0',
  //         src: 'mapstatic.html?latitude='+info.latitude+'&longitude='+info.longitude
  //       },{
  //         classes: 'nav',
  //         onTap: function() {
  //           Fn.addHistoryLog(projectid,7);
  //           Page.open('http://api.map.baidu.com/marker?location=' + info.latitude + ',' + info.longitude + '&title='+info.projectname+'&content='+info.projectname+'&output=html');
  //           // Page.open('./map.html',{
  //           //   latitude: info.latitude,
  //           //   longitude: info.longitude,
  //           //   streetpanorama: info.streetpanorama,
  //           //   title: encodeURIComponent(info.projectname)
  //           // });
  //         }
  //       }], '.vpage-content .project-nav');
  //       page.find('.project-nav').removeClass('hide');
  //     }
  //     //详细信息
  //     function projectDetail(info) {
  //       $.createElements([{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '物业类型'
  //         },{
  //           classes: 'wy',
  //           text: ''
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '地址'
  //         },{
  //           text: info.address
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '价格'
  //         },{
  //           text: info.price
  //         }]
  //       // },{
  //       //   classes: 'detail-item',
  //       //   components: [{
  //       //     tag: 'label',
  //       //     html: '开盘时间'
  //       //   },{
  //       //     text: info.opentime
  //       //   }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '售楼处地址'
  //         },{
  //           text: info.saleaddress
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '建筑类别'
  //         },{
  //           text: info.structure
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '入住时间'
  //         },{
  //           text: info.deliverytime
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '开发商'
  //         },{
  //           text: info.estatecompany
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '产权年限'
  //         },{
  //           text: info.propertyyears
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '容积率'
  //         },{
  //           text: info.floorarearatio
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '绿化率'
  //         },{
  //           text: info.greeningrate
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '总户数'
  //         },{
  //           text: info.houses
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '停车位'
  //         },{
  //           text: info.parking
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '物业费'
  //         },{
  //           text: info.propertyexpense
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '物业公司'
  //         },{
  //           text: info.propertycompany
  //         }]
  //       },{
  //         classes: 'detail-item',
  //         components: [{
  //           tag: 'label',
  //           html: '装修状况'
  //         },{
  //           text: info.decoration
  //         }]
  //       }], '.vpage-content .project-detail');
    
  //       var str = '';
  //       api.listItemCache.get({
  //         titleids:[3]
  //       }).then(function(response){ var msg = response.data;
  //         msg[3].forEach(function(item){
  //           if(item.itemid == info.properties1 || item.itemid == info.properties2 || item.itemid == info.properties3 || item.itemid == info.properties4 || item.itemid == info.properties5) {
  //             str = str + item.itemtext + '、';
  //           }
  //         });
  //         if(str) {
  //           page.find('.wy').html(str.substring(0,str.length-1));
  //         }
  //       });
    
  //     }
    
  //     // 显示原图
  //     function showOrigin(photos,index) {
  //       $.createElements({
  //         id: 'photo-view',
  //         classes: 'scrim',
  //         onTouchmove: function() {
  //           return false;
  //         },
  //         components: [{
  //           id: 'photo-slides',
  //           onSingleTap: function() {
  //             $('#photo-view').remove();
  //           }
  //         }]
  //       }, document.body);
    
  //       new app.Slides($('#photo-slides'), {
  //         index: index,
  //         // onSnap: function(dir) {
  //         //   if (dir < 0 && this.index <= 0 ||
  //         //       dir > 0 && this.index >= photos.length - 1) {
  //         //     return false;
  //         //   }
  //         // },
  //         onUpdate: function(index, el) {
  //           // if (index < 0 || index > photos.length - 1) {
  //           //   return false;
  //           // }
  //           index = ((index % photos.length) + photos.length) % photos.length;
  //           el.children('img').remove();
  //           el.children('.img-text').remove();
  //           var photo = photos[index];
  //           var imgEl = $.createElements([{
  //             tag: 'img',
  //             classes: 'origin-photo',
  //             src: app._photoUrl(photo.pic.picurl)
  //           },{
  //             classes: 'img-text',
  //             style: 'position: absolute;top: 0;width: 60px;text-align: center;color:#fff;font-size: 16px;font-weight:bold;left:50%;margin-left:-30px;line-height: 30px',
  //             text: (index + 1) + '/' + photos.length
  //           }], el);
  //         }
  //       });
  //     };
    
    
  //     // var float_img = $.createElements({classes:'float-jsq'},'.vpage-content');
  //     // float_img.singleTap(function(){
  //     //   Page.open('./calculate.html');
  //     // });
  //     // var requestAnimFrame = (function() {
  //     //   return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
  //     //     window.setTimeout(callback, 1000 / 60)
  //     //   }
  //     // })();
    
  //     // var xPos = 0;
  //     // var yPos = 0;
  //     // var Hoffset = 46;
  //     // var Woffset = 93;
  //     // var yon = 0;
  //     // var xon = 0;
  //     // function changePos() {
  //     //   var width = document.body.clientWidth;
  //     //   var height = document.body.clientHeight;
    
  //     //   float_img.vendor('transform', 'translate3d(' + xPos + 'px,' + yPos + 'px,0)');
    
  //     //   xPos += xon ? 1 : -1;
  //     //   yPos += yon ? 1 : -1;
    
  //     //   if (xPos < 0) {
  //     //     xon = 1;
  //     //     xPos = 0;
  //     //   } else if (xPos >= (width - Woffset)) {
  //     //     xon = 0;
  //     //     xPos = width - Woffset;
  //     //   }
    
  //     //   if (yPos < 0) {
  //     //     yon = 1;
  //     //     yPos = 0;
  //     //   } else if (yPos >= (width - Hoffset)) {
  //     //     yon = 0;
  //     //     yPos = width - Hoffset;
  //     //   }
    
  //     //   requestAnimFrame(changePos);
  //     // }
    
  //     // requestAnimFrame(changePos);
  //   }
    
  // }
})