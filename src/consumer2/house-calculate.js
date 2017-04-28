"use strict";
Page.ready(function($, query) {
  
  return {

    options: {
      wxShareUrl: true
    },
    
    onRender: function() {
      var page = this // 自动生成的代码
      var from = (query.from ? query.from : '')
      var fopenid = (query.fopenid ? query.fopenid : '')
      var id = query.id | 0
      var projectid = query.projectid | 0
      var title = decodeURIComponent(query.title)
      var unitprice = query.price | 0
      var area = query.area | 0
      var lowtotal = (query.lowtotal ? ((query.lowtotal | 0) / 10000).toFixed(2) + '万' : '')
      var hightotal = (query.hightotal ? ((query.hightotal | 0) / 10000).toFixed(2) + '万' : '')
    
      var memberopenid = (query.memberopenid ? query.memberopenid : '')
      var popup = $('.appointment-popup2')
      var count = 59
      var projectroomid
      var appmemo = title
      var huankuan
    
      setShareUrl(query)
      init()
    
      function init(){
        var totalprice
        // if(lowtotal && hightotal) {
        //   totalprice = lowtotal + '~' + hightotal
        // }else if(lowtotal){
        //   totalprice = lowtotal + '起'
        // }else if(hightotal){
        //   totalprice = hightotal + '起'
        // }else {
          totalprice = (unitprice * area / 10000).toFixed(2) + '万'
        // }
        page.find('.item .title').text(title)
        page.find('.item .price').text(unitprice + '元/㎡起')
        page.find('.note-layer .price').text(unitprice + '元/㎡起')
        page.find('.item .area').text(area + '㎡')
        page.find('.note-layer .area').text(area + '㎡')
        page.find('.item .total').text(totalprice)
        page.find('.note-layer .total').text(totalprice)
        page.find('.calculate-box').removeClass('hide')
    
        if(from) {
          calculate();
        }
      }
    
      //判断是否展示项目特价房
      // api.request.get("/global/Project/info", {
      //   projectid: projectid
      // }, {mask:false}).then(function(response){ var msg = response.data;
      //   if(msg.base && msg.base.havediscount == 1) {
      //     page.find('.project').removeClass('hide')
      //     page.find('.project').singleTap(function(){
      //       Page.open('./house-preferential.html',{
      //         fopenid: fopenid,
      //         memberopenid: memberopenid,
      //         projectid: projectid
      //       })
      //     })
      //   }
      // })
    
      page.find('select').on('change', function() {
        $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
      });
    
      //开始计算
      page.find('.btn.b1').singleTap(function(){
        calculate();
      })
    
      function calculate() {
        $('title').text('算价结果')
        page.find('.x2').addClass('hide')
        page.find('.x3').addClass('hide')
        page.find('.b1').addClass('hide')
        page.find('.x4').removeClass('hide')
        page.find('.b2').removeClass('hide')
        page.find('.b3').removeClass('hide')
        page.find('.calculate-result-box').removeClass('hide')
        // page.find('.list').addClass('hide')
        ext_loantotal();
        ext_total();
        from = 1;
    
        // 提交算价纪录
        api.request.get("/hfz/HfzCommAction/addPriceRecord", {
          obj: {
            projectid: projectid,
            onlineid: id,
            price: unitprice,
            area: area
          }
        }, {
          mask: false
        }).then(function(response){ var msg = response.data;
        });
        
        if(query.from) {        
          //显示算价记录
          api.request.get("/hfz/HfzOnlineSaleAction/listRecommendProjects", {
            obj: {
              id: id
            }
          }, {
          }).then(function(response){ var msg = response.data;
            console.log(typeof(msg))
            if(msg && msg.length > 0 && typeof(msg) == 'object') {
              page.find('.list').removeClass('hide')
              page.find('.list .header-layer').removeClass('hide')
              console.log('123')
              msg.forEach(function(item){
                item.ISXUEQU = (item.isxuequ == 1)
                item.ISSUBWAY = (item.issubway == 1)
                item.BRAND = (item.brand == 1)
                page.tpl("item", item, page.find(".list"));
              })
            }
          });
        }
      }
    
      //重新计算
      page.find('.btn.b2').singleTap(function(){
        // $('title').text('我要算价')
        // page.find('.x2').removeClass('hide')
        // page.find('.x3').removeClass('hide')
        // page.find('.b1').removeClass('hide')
        // page.find('.x4').addClass('hide')
        // page.find('.b2').addClass('hide')
        // page.find('.b3').addClass('hide')
        // page.find('.calculate-result-box').addClass('hide')
        if(from) {
          delete query.from
          Page.open('../consumer2/house-calculate.html', v.mixin({from:0}, query), true)
        }else {
          Page.open('./house-online.html',{
            fopenid: fopenid,
            memberopenid: memberopenid,
            projectid: projectid,
          })
        }
      })
    
      //重新计算
      page.find('.btn.b3').singleTap(function(){
        appointment()
      })
    
      //计算房贷
      function ext_loantotal() {
        //1 商业贷款 2 公积金贷款 3 组合贷款
        var status = 1;
        //单价
        var price = unitprice;
        //面积
        var sqm = area;
        //按揭成数
        var anjie = parseInt(page.find('.type-mortgage select')[0].value);//贷款总数
        var daikuan = '';
        //按揭年数
        var years = parseInt(page.find('.type-year select')[0].value);
        //本金或者本息 1为本息，2为本金type-repay
        var radioben =  parseInt(page.find('.type-repay select')[0].value);
        //还款月数
        var month = years * 12;
    
        // if (status == 3) { //判断是房贷计算 组合型
        //  //  //--  组合型贷款(组合型贷款的计算，只和商业贷款额、和公积金贷款额有关，和按贷款总额计算无关)
        //   var total_sy = parseInt(page.find('#sy').val());
        //   var total_gjj = parseInt(page.find('#gjj').val());
        //   if(!total_sy) {
        //     v.ui.alert('请填写商业性贷款总额');
        //     return;
        //   }
        //   if(!total_gjj) {
        //     v.ui.alert('请填写公积金贷款总额');
        //     return;
        //   }
        //   page.find('.credit-result').removeClass('hide');
        //   page.find('.note-text2').removeClass('hide');
        //   //房款总额
        //   page.find('.result.t1').text('略');
        //   //首期付款
        //   page.find('.result.t5').text(0);
        //   //贷款总额
        //   var daikuan_total = total_sy + total_gjj;
        //   page.find('.result.t2').text(daikuan_total);
        //   //还款月数
        //   page.find('.result.t6').text(month + '月');
        //   //月还款
        //   var lilv_sd = page.find('#lily').val() / 100; //得到商贷利率
        //   var lilv_gjj = page.find('#lily2').val() / 100; //得到公积金利率
        //   if(radioben == 1) {
        //     //等额本息
        //     //月均还款
        //     if(!page.find('.tp2').hasClass('hide')) {
        //       page.find('.tp2').addClass('hide');
        //     }
        //     page.find('.tp1').removeClass('hide');
        //     var month_money1 = getMonthMoney1(lilv_sd, total_sy, month) + getMonthMoney1(lilv_gjj, total_gjj, month);//调用函数计算
        //     page.find('.result.t7').text(Math.round(month_money1 * 100) / 100 + '(元)');
        //     //还款总额
        //     var all_total1 = month_money1 * month;
        //     page.find('.result.t3').text(Math.round(all_total1 * 100) / 100);
        //     //支付利息款
        //     page.find('.result.t4').text(Math.round((all_total1 - daikuan_total) * 100) / 100);
        //   }else{
        //     //等额本金
        //     page.find('.tp2').removeClass('hide');
        //     if(!page.find('.tp1').hasClass('hide')) {
        //       page.find('.tp1').addClass('hide');
        //     }
        //     var all_total2 = 0;
        //     var month_money2 = "";
        //     // for (j = 0; j < month; j++) {
        //     for (j = 0; j < month; j++) {
        //         //调用函数计算: 本金月还款额
        //         huankuan = getMonthMoney2(lilv_sd, total_sy, month, j) + getMonthMoney2(lilv_gjj, total_gjj, month, j);
        //         all_total2 += huankuan;
        //         huankuan = Math.round(huankuan * 100) / 100;
        //         month_money2 += (j + 1) + "月," + huankuan + "(元)\n";
        //     }
        //     //月均还款
        //     page.find('textarea').html(month_money2);
        //     //还款总额
        //     page.find('.result.t3').text(Math.round(all_total2 * 100) / 100);
        //     //支付利息款
        //     page.find('.result.t4').text(Math.round((all_total2 - daikuan_total) * 100) / 100);
        //   }
        // }else {
          //商业贷款、公积金贷款
          var lilv = page.find('.type-lilv select')[0].value; //得到利率
          //房款总额
          var fangkuan_total = price * sqm;
          //贷款总额
          var daikuan_total = (price * sqm) * ((10 - anjie) / 10);
          //首付金额
          var sf_total = (price * sqm) * (anjie / 10);
          //首期付款
          var money_first = fangkuan_total - daikuan_total;
          //还款月数
          if(radioben == 1) {
            //等额本息月均还款
            //调用函数计算
            var month_money1 = getMonthMoney1(lilv, daikuan_total, month);
            //还款总额
            var all_total1 = month_money1 * month;
            //支付利息款
            var all_lx = all_total1 - daikuan_total
    
            setCalculateResult(sf_total,daikuan_total, all_lx, month, all_total1, month_money1, 1);
          }else{
            //等额本金
            var all_total2 = 0;
            var month_money2 = "";
            for (var j = 0; j < month; j++) {
              //调用函数计算: 本金月还款额
              huankuan = getMonthMoney2(lilv, daikuan_total, month, j);
              all_total2 += huankuan;
              huankuan = Math.round(huankuan * 100) / 100;
              month_money2 += (j + 1) + "月," + huankuan + "(元)\n";
            }
            //支付利息款
            var all_lx = all_total2 - daikuan_total
            setCalculateResult(sf_total,daikuan_total, all_lx, month, all_total2, month_money2, 2);
          }
        // }
      }
    
      //计算税费
      function ext_total() {
        var fwdj = unitprice;  //房屋单价
        var housearea = area; //房屋面积
    
        var dj33 = parseFloat(fwdj);
        var mj33 = parseFloat(housearea);
        //房屋总价
        var fkz3 = dj33 * mj33;
        //印花税
        var yh = fkz3 * 0.0005;
        if (dj33 <= 9432) var q1 = fkz3 * 0.015
        else if (dj33 > 9432) var q1 = fkz3 * 0.03
        if (mj33 <= 120) var fw1 = 500;
        else if (120 < mj33 <= 5000) var fw1 = 1500;
        if (mj33 > 5000) var fw1 = 5000
        //公证费
        var gzh = fkz3 * 0.003
        //契税
        var q = Math.round(q1 * 100, 5) / 100
        //委托办理产权手续费
        var wt = Math.round(gzh * 100, 5) / 100
        //房屋买卖手续费
        var fw = Math.round(fw1 * 100, 5) / 100
        setTaxResult(q,gzh,wt,fw)
      }
    
      //本金还款的月还款额(参数: 年利率 / 贷款总额 / 贷款总月份 / 贷款当前月0～length-1)
      function getMonthMoney2(lilv, total, month, cur_month) {
        var lilv_month = lilv / 12; //月利率
        //return total * lilv_month * Math.pow(1 + lilv_month, month) / ( Math.pow(1 + lilv_month, month) -1 );
        var benjin_money = total / month;
        return (total - benjin_money * cur_month) * lilv_month + benjin_money;
      }
      //本息还款的月还款额(参数: 年利率/贷款总额/贷款总月份)
      function getMonthMoney1(lilv, total, month) {
        var lilv_month = lilv / 12; //月利率
        return total * lilv_month * Math.pow(1 + lilv_month, month) / (Math.pow(1 + lilv_month, month) - 1);
      }
    
      function setCalculateResult(sf,dk,lx,month,total,month_money,type){
        //首付金额，贷款总额，利息总额，总月数，还款总额，每月还款额, type 1 等额本息 2 等额本金
        console.log(unitprice,area,unitprice*area,dk,lx,month,total,month_money,type);
        page.find('.total-sf').text((sf / 10000).toFixed(2) + '万元')
        page.find('.total-dk').text((dk / 10000).toFixed(2) + '万元')
        page.find('.total-lx').text((lx / 10000).toFixed(2) + '万元')
        page.find('.total-month').text(month + '个月')
        page.find('.total-money').text((total / 10000).toFixed(2) + '万元')
        if(type == 1) {
          page.find('.leftarea .process').removeClass('hide')
          page.find('.leftarea .textarea-area').addClass('hide')
          drawProcess((dk/total * 100).toFixed(2),month_money.toFixed(2))
        } else {
          page.find('.leftarea .process').addClass('hide')
          page.find('.leftarea .textarea-area').removeClass('hide')
          page.find('textarea').html(month_money);
        }
      }
    
      function setTaxResult(q,g,w,f) {
        page.find('.qs').text(q.toFixed(2)+'元')
        page.find('.gzf').text(g.toFixed(2)+'元')
        page.find('.cqsxf').text(w.toFixed(2)+'元')
        page.find('.mmsxf').text(f.toFixed(2)+'元')
        page.find('.totalfee').text(((q+g+w+f)/10000).toFixed(2) + '万元')
      }
    
      function drawProcess(process, money) {
        var diameter = 144;
        var radius = diameter / 2;
        var process = process;
    
        var canvas = page.find('canvas')[0];
    
        var context = canvas.getContext('2d');
    
        context.clearRect(0, 0, diameter, diameter);
    
        // ***开始画一个大圆
        context.beginPath();
        // 坐标移动到圆心
        context.moveTo(radius, radius);
        // 画圆,半径radius,从角度0开始,画到2PI结束,最后一个参数是方向顺时针还是逆时针
        context.arc(radius, radius, radius, 0, Math.PI * 2, false);
        context.closePath();
        // 填充颜色
        context.fillStyle = '#EBB755';
        context.fill();
        // ***灰色的圆画完
    
        // 画进度
        context.beginPath();
        // 画扇形的时候这步很重要,画笔不在圆心画出来的不是扇形
        context.moveTo(radius, radius);
        // 跟上面的圆唯一的区别在这里,不画满圆,画个扇形
        context.arc(radius, radius, radius, 0, Math.PI * 2 * process / 100, false);
        context.closePath();
        context.fillStyle = '#A0CB70';
        context.fill();
    
        // 画内部空白
        context.beginPath();
        context.moveTo(radius, radius);
        context.arc(radius, radius, radius - 12, 0, Math.PI * 2, true);
        context.closePath();
        context.fillStyle = '#fff';
        context.fill();
    
        // // 画一条线
        // context.beginPath();
        // context.arc(radius, radius, radius - 15, 0, Math.PI * 2, true);
        // context.closePath();
        // // 与画实心圆的区别,fill是填充,stroke是画线
        // context.strokeStyle = '#fff';
        // context.stroke();
    
        //在中间写字
        // context.font = "bold 12pt Arial";
        context.font = "12pt Arial";
        context.fillStyle = '#696969';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.moveTo(radius, radius - 15);
        context.fillText('每月还款', radius, radius - 15);
    
        context.font = "14pt Arial";
        context.fillStyle = '#EBB755';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.moveTo(radius, radius + 15);
        context.fillText(money + '元', radius, radius + 15);
      }
    
      //预约
      function appointment() {
        popup.removeClass('hide')
      }
    
      popup.find('.cancel').singleTap(function(){
        popup.addClass('hide');
      });
    
      //发送验证码 按钮
      popup.find('.btn-vericode').singleTap(function() {
        if(popup.find('.btn-vericode').hasClass('disabled')) {
          return;
        }
        var mobile = $('#telnum').val();
        if (Fn.isMobile(mobile)) {
    
          popup.find('.btn-vericode').addClass('disabled');
          var ival = window.setInterval(function(){
            popup.find('.btn-vericode').html(count+'秒后重新获取');
            if(count <= 0) {
              count = 59;
              clearInterval(ival);
              popup.find('.btn-vericode').removeClass('disabled');
              popup.find('.btn-vericode').html('免费获取验证码');
            }else {
              count--;
            }
          },1000);
    
          api.request.get("/global/App/getHfzVericode", {
            mobile: mobile
          }).then(function(response){ var msg = response.data;
            v.ui.alert(code === 0 ? '验证码已通过短信发送到您的手机，稍等一会儿哦' : msg);
          });
        } else if (mobile) {
          return v.ui.alert('请输入正确的手机号码');
        } else {
          return v.ui.alert('请输入手机号码');
        }
      });
    
      popup.find('.submit').singleTap(function() {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
        var vericode = $('#vericode').val();
    
        if(!name || !mobile) {
          return v.ui.alert('所有项均为必填项');
        }
        if(!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        if (!vericode) {
          return v.ui.alert('请输入短信验证码');
        }
        var parames = {
          obj:{
            name: name,
            mobile: mobile,
            ispublic: 1,
            projectid: projectid
          }
        };
        if(memberopenid){
          $.mixin(parames.obj,{memberopenid:memberopenid, ispublic: 2},true);
        }
        if(projectroomid) {
          $.mixin(parames.obj,{projectroomid:projectroomid},true);
        }
        if(appmemo) {
          $.mixin(parames.obj,{memo:appmemo},true);
        }
        app.session.vericode = vericode;
    
        api.request.get("/hfz/HfzTeamManageAction/addAppointment", parames).then(function(response){ var msg = response.data;
          if(true){
            v.ui.alert('预约成功');
            popup.addClass('hide');
          }
        });
      });
    
      page.goOnline = function(event, id) {
        Page.open('./house-online.html',{
          fopenid: fopenid,
          memberopenid: memberopenid,
          projectid: id,
        })
      }
    }
    
  }
})