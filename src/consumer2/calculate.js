"use strict";
Page.ready(function($, query) {
  
  return {
    
    options: {
      scroller: true,
      trademark: true,
      wx: true
    },

    onRender: function() {
      var lilv_array = new Array;
        //12年6月8日基准利率
        lilv_array[1] = new Array;
        lilv_array[1][1] = new Array;
        lilv_array[1][2] = new Array;
        lilv_array[1][1][1] = 0.0631; //商贷1年 6.31%
        lilv_array[1][1][3] = 0.0640; //商贷1～3年 6.4%
        lilv_array[1][1][5] = 0.0665; //商贷 3～5年 6.65%
        lilv_array[1][1][10] = 0.0680; //商贷 5-30年 6.8%
        lilv_array[1][2][5] = 0.0420; //公积金 1～5年 4.2%
        lilv_array[1][2][10] = 0.0470; //公积金 5-30年 4.7%
        //12年6月8日利率下限（7折）
        lilv_array[2] = new Array;
        lilv_array[2][1] = new Array;
        lilv_array[2][2] = new Array;
        lilv_array[2][1][1] = 0.04417; //商贷1年 4.417%
        lilv_array[2][1][3] = 0.0448; //商贷1～3年 4.48%
        lilv_array[2][1][5] = 0.04655; //商贷 3～5年 4.655%
        lilv_array[2][1][10] = 0.0476; //商贷 5-30年 4.76%
        lilv_array[2][2][5] = 0.0420; //公积金 1～5年 4.2%
        lilv_array[2][2][10] = 0.0470; //公积金 5-30年 4.7%
        //12年6月8日利率下限（85折）
        lilv_array[3] = new Array;
        lilv_array[3][1] = new Array;
        lilv_array[3][2] = new Array;
        lilv_array[3][1][1] = 0.053635; //商贷1年 5.3635%
        lilv_array[3][1][3] = 0.0544; //商贷1～3年 5.44%
        lilv_array[3][1][5] = 0.056525; //商贷 3～5年 5.6525%
        lilv_array[3][1][10] = 0.0578; //商贷 5-30年 5.78%
        lilv_array[3][2][5] = 0.0420; //公积金 1～5年 4.2%
        lilv_array[3][2][10] = 0.0470; //公积金 5-30年 4.7%
        //12年6月8日利率上限（1.1倍）
        lilv_array[4] = new Array;
        lilv_array[4][1] = new Array;
        lilv_array[4][2] = new Array;
        lilv_array[4][1][1] = 0.06941; //商贷1年 6.941%
        lilv_array[4][1][3] = 0.0704; //商贷1～3年 7.04%
        lilv_array[4][1][5] = 0.07315; //商贷 3～5年 7.315%
        lilv_array[4][1][10] = 0.0748; //商贷 5-30年 7.48%
        lilv_array[4][2][5] = 0.0420; //公积金 1～5年 4.2%
        lilv_array[4][2][10] = 0.0470; //公积金 5-30年 4.7%
        //12年7月6日基准利率
        lilv_array[5] = new Array;
        lilv_array[5][1] = new Array;
        lilv_array[5][2] = new Array;
        lilv_array[5][1][1] = 0.0600; //商贷1年 6%
        lilv_array[5][1][3] = 0.0615; //商贷1～3年 6.15%
        lilv_array[5][1][5] = 0.0640; //商贷 3～5年 6.4%
        lilv_array[5][1][10] = 0.0655; //商贷 5-30年 6.55%
        lilv_array[5][2][5] = 0.0400; //公积金 1～5年 4%
        lilv_array[5][2][10] = 0.0450; //公积金 5-30年 4.5%
        //12年7月6日利率下限（7折）
        lilv_array[6] = new Array;
        lilv_array[6][1] = new Array;
        lilv_array[6][2] = new Array;
        lilv_array[6][1][1] = 0.042; //商贷1年 4.2%
        lilv_array[6][1][3] = 0.04305; //商贷1～3年 4.305%
        lilv_array[6][1][5] = 0.0448; //商贷 3～5年 4.48%
        lilv_array[6][1][10] = 0.04585; //商贷 5-30年 4.585%
        lilv_array[6][2][5] = 0.0400; //公积金 1～5年 4%
        lilv_array[6][2][10] = 0.0450; //公积金 5-30年 4.5%
        //12年7月6日利率下限（85折）
        lilv_array[7] = new Array;
        lilv_array[7][1] = new Array;
        lilv_array[7][2] = new Array;
        lilv_array[7][1][1] = 0.051; //商贷1年 5.1%
        lilv_array[7][1][3] = 0.052275; //商贷1～3年 5.2275%
        lilv_array[7][1][5] = 0.0544; //商贷 3～5年 5.44%
        lilv_array[7][1][10] = 0.055675; //商贷 5-30年 5.5675%
        lilv_array[7][2][5] = 0.0400; //公积金 1～5年 4%
        lilv_array[7][2][10] = 0.0450; //公积金 5-30年 4.5%
        //12年7月6日利率上限（1.1倍）
        lilv_array[8] = new Array;
        lilv_array[8][1] = new Array;
        lilv_array[8][2] = new Array;
        lilv_array[8][1][1] = 0.066; //商贷1年 6.6%
        lilv_array[8][1][3] = 0.06765; //商贷1～3年 6.765%
        lilv_array[8][1][5] = 0.0704; //商贷 3～5年 7.04%
        lilv_array[8][1][10] = 0.07205; //商贷 5-30年 7.205%
        lilv_array[8][2][5] = 0.0400; //公积金 1～5年 4%
        lilv_array[8][2][10] = 0.0450; //公积金 5-30年 4.5%
        //20141124宋文渊新增贷款利率
        //14年11月22日基准利率
        lilv_array[9] = new Array;
        lilv_array[9][1] = new Array;
        lilv_array[9][2] = new Array;
        lilv_array[9][1][1] = 0.0560;//商贷1年 6%
        lilv_array[9][1][3] = 0.0600;//商贷1～3年 6%
        lilv_array[9][1][5] = 0.0600;//商贷 3～5年 6%
        lilv_array[9][1][10] = 0.0615;//商贷 5-30年 6.15%
        lilv_array[9][2][5] = 0.0375;//公积金 1～5年 4%
        lilv_array[9][2][10] = 0.0425;//公积金 5-30年 4.5%
        //14年11月22日利率下限（7折）
        lilv_array[10] = new Array;
        lilv_array[10][1] = new Array;
        lilv_array[10][2] = new Array;
        lilv_array[10][1][1] = 0.0420;//商贷1年 6%
        lilv_array[10][1][3] = 0.0420;//商贷1～3年 6%
        lilv_array[10][1][5] = 0.0420;//商贷 3～5年 6%
        lilv_array[10][1][10] = 0.04305;//商贷 5-30年 6.15%
        lilv_array[10][2][5] = 0.02625;//公积金 1～5年 4%
        lilv_array[10][2][10] = 0.02975;//公积金 5-30年 4.5%
        //14年11月22日利率下限（85折）
        lilv_array[11] = new Array;
        lilv_array[11][1] = new Array;
        lilv_array[11][2] = new Array;
        lilv_array[11][1][1] = 0.051; //商贷1年 5.1%
        lilv_array[11][1][3] = 0.051; //商贷1～3年 5.2275%
        lilv_array[11][1][5] = 0.051; //商贷 3～5年 5.44%
        lilv_array[11][1][10] = 0.052275; //商贷 5-30年 5.5675%
        lilv_array[11][2][5] = 0.031875; //公积金 1～5年 4%
        lilv_array[11][2][10] = 0.036125; //公积金 5-30年 4.5%
        //14年11月22日利率上限（1.1倍）
        lilv_array[12] = new Array;
        lilv_array[12][1] = new Array;
        lilv_array[12][2] = new Array;
        lilv_array[12][1][1] = 0.066; //商贷1年 6.6%
        lilv_array[12][1][3] = 0.066; //商贷1～3年 6.765%
        lilv_array[12][1][5] = 0.066; //商贷 3～5年 7.04%
        lilv_array[12][1][10] = 0.06765; //商贷 5-30年 7.205%
        lilv_array[12][2][5] = 0.04125; //公积金 1～5年 4%
        lilv_array[12][2][10] = 0.04675; //公积金 5-30年 4.5%
    
        //2015年2月28日杨普法新增贷款利率
        //2015年3月1日基准利率
        lilv_array[13] = new Array;
        lilv_array[13][1] = new Array;
        lilv_array[13][2] = new Array;
        lilv_array[13][1][1] = 0.0535;//商贷1年 6%
        lilv_array[13][1][3] = 0.0575;//商贷1～3年 6%
        lilv_array[13][1][5] = 0.0575;//商贷 3～5年 6%
        lilv_array[13][1][10] = 0.0590;//商贷 5-30年 6.15%
        lilv_array[13][2][5] = 0.0350;//公积金 1～5年 4%
        lilv_array[13][2][10] = 0.0400;//公积金 5-30年 4.5%
        ///2015年3月1日利率下限（7折）
        lilv_array[14] = new Array;
        lilv_array[14][1] = new Array;
        lilv_array[14][2] = new Array;
        lilv_array[14][1][1] = 0.03745;//商贷1年 6%
        lilv_array[14][1][3] = 0.04025;//商贷1～3年 6%
        lilv_array[14][1][5] = 0.04025;//商贷 3～5年 6%
        lilv_array[14][1][10] = 0.04130;//商贷 5-30年 6.15%
        lilv_array[14][2][5] = 0.02450;//公积金 1～5年 4%
        lilv_array[14][2][10] = 0.02800;//公积金 5-30年 4.5%
        ///2015年3月1日利率下限（85折）
        lilv_array[15] = new Array;
        lilv_array[15][1] = new Array;
        lilv_array[15][2] = new Array;
        lilv_array[15][1][1] = 0.045475; //商贷1年 5.1%
        lilv_array[15][1][3] = 0.0488750; //商贷1～3年 5.2275%
        lilv_array[15][1][5] = 0.0488750; //商贷 3～5年 5.44%
        lilv_array[15][1][10] = 0.05015; //商贷 5-30年 5.5675%
        lilv_array[15][2][5] = 0.02975; //公积金 1～5年 4%
        lilv_array[15][2][10] = 0.03400; //公积金 5-30年 4.5%
        ///2015年3月1日利率上限（1.1倍）
        lilv_array[16] = new Array;
        lilv_array[16][1] = new Array;
        lilv_array[16][2] = new Array;
        lilv_array[16][1][1] = 0.05885; //商贷1年 6.6%
        lilv_array[16][1][3] = 0.06325; //商贷1～3年 6.765%
        lilv_array[16][1][5] = 0.06325; //商贷 3～5年 7.04%
        lilv_array[16][1][10] = 0.0649; //商贷 5-30年 7.205%
        lilv_array[16][2][5] = 0.03850; //公积金 1～5年 4%
        lilv_array[16][2][10] = 0.0440; //公积金 5-30年 4.5%
        //15年5月11日基准利率
        lilv_array[17] = new Array;
        lilv_array[17][1] = new Array;
        lilv_array[17][2] = new Array;
        lilv_array[17][1][1] = 0.0510;
        lilv_array[17][1][3] = 0.0550;
        lilv_array[17][1][5] = 0.0550;
        lilv_array[17][1][10] = 0.0565;
        lilv_array[17][2][5] = 0.03250;
        lilv_array[17][2][10] = 0.03750;
        //15年5月11日利率下限（7折）
        lilv_array[18] = new Array;
        lilv_array[18][1] = new Array;
        lilv_array[18][2] = new Array;
        lilv_array[18][1][1] = 0.0357;
        lilv_array[18][1][3] = 0.0385;
        lilv_array[18][1][5] = 0.0385;
        lilv_array[18][1][10] = 0.03955;
        lilv_array[18][2][5] = 0.02275;
        lilv_array[18][2][10] = 0.02625;
        //15年5月11日利率下限（85折）
        lilv_array[19] = new Array;
        lilv_array[19][1] = new Array;
        lilv_array[19][2] = new Array;
        lilv_array[19][1][1] = 0.04335;
        lilv_array[19][1][3] = 0.04675;
        lilv_array[19][1][5] = 0.04675;
        lilv_array[19][1][10] = 0.048025;
        lilv_array[19][2][5] = 0.027625;
        lilv_array[19][2][10] = 0.031875;
        //15年5月11日利率上限（1.1倍）
        lilv_array[20] = new Array;
        lilv_array[20][1] = new Array;
        lilv_array[20][2] = new Array;
        lilv_array[20][1][1] = 0.0561;
        lilv_array[20][1][3] = 0.0605;
        lilv_array[20][1][5] = 0.0605;
        lilv_array[20][1][10] = 0.06215;
        lilv_array[20][2][5] = 0.03575;
        lilv_array[20][2][10] = 0.04125;
        //15年6月28日基准利率
        lilv_array[21] = new Array;
        lilv_array[21][1] = new Array;
        lilv_array[21][2] = new Array;
        lilv_array[21][1][1] = 0.0485;
        lilv_array[21][1][3] = 0.0525;
        lilv_array[21][1][5] = 0.0525;
        lilv_array[21][1][10] = 0.054;
        lilv_array[21][2][5] = 0.03;
        lilv_array[21][2][10] = 0.035;
        //15年6月28日利率下限（7折）
        lilv_array[22] = new Array;
        lilv_array[22][1] = new Array;
        lilv_array[22][2] = new Array;
        lilv_array[22][1][1] = 0.03395;
        lilv_array[22][1][3] = 0.03675;
        lilv_array[22][1][5] = 0.03675;
        lilv_array[22][1][10] = 0.0378;
        lilv_array[22][2][5] = 0.021;
        lilv_array[22][2][10] = 0.0245;
        //15年6月28日利率下限（85折）
        lilv_array[23] = new Array;
        lilv_array[23][1] = new Array;
        lilv_array[23][2] = new Array;
        lilv_array[23][1][1] = 0.041225;
        lilv_array[23][1][3] = 0.044625;
        lilv_array[23][1][5] = 0.044625;
        lilv_array[23][1][10] = 0.0459;
        lilv_array[23][2][5] = 0.0255;
        lilv_array[23][2][10] = 0.02975;
        //15年6月28日利率上限（1.1倍）
        lilv_array[24] = new Array;
        lilv_array[24][1] = new Array;
        lilv_array[24][2] = new Array;
        lilv_array[24][1][1] = 0.05335;
        lilv_array[24][1][3] = 0.05775;
        lilv_array[24][1][5] = 0.05775;
        lilv_array[24][1][10] = 0.0594;
        lilv_array[24][2][5] = 0.033;
        lilv_array[24][2][10] = 0.0385;
        //15年8月26日基准利率
        lilv_array[25] = new Array;
        lilv_array[25][1] = new Array;
        lilv_array[25][2] = new Array;
        lilv_array[25][1][1] = 0.046;
        lilv_array[25][1][3] = 0.05;
        lilv_array[25][1][5] = 0.05;
        lilv_array[25][1][10] = 0.0515;
        lilv_array[25][2][5] = 0.0275;
        lilv_array[25][2][10] = 0.0325;
        //15年8月26日利率下限（7折）
        lilv_array[26] = new Array;
        lilv_array[26][1] = new Array;
        lilv_array[26][2] = new Array;
        lilv_array[26][1][1] = 0.0322;
        lilv_array[26][1][3] = 0.035;
        lilv_array[26][1][5] = 0.035;
        lilv_array[26][1][10] = 0.03605;
        lilv_array[26][2][5] = 0.01925;
        lilv_array[26][2][10] = 0.02275;
        //15年8月26日利率下限（85折）
        lilv_array[27] = new Array;
        lilv_array[27][1] = new Array;
        lilv_array[27][2] = new Array;
        lilv_array[27][1][1] = 0.0391;
        lilv_array[27][1][3] = 0.0425;
        lilv_array[27][1][5] = 0.0425;
        lilv_array[27][1][10] = 0.043775;
        lilv_array[27][2][5] = 0.023375;
        lilv_array[27][2][10] = 0.027625;
        //15年8月26日利率上限（1.1倍）
        lilv_array[28] = new Array;
        lilv_array[28][1] = new Array;
        lilv_array[28][2] = new Array;
        lilv_array[28][1][1] = 0.0506;
        lilv_array[28][1][3] = 0.055;
        lilv_array[28][1][5] = 0.055;
        lilv_array[28][1][10] = 0.05665;
        lilv_array[28][2][5] = 0.03025;
        lilv_array[28][2][10] = 0.03575;
        //15年10月24日基准利率
        lilv_array[29] = new Array;
        lilv_array[29][1] = new Array;
        lilv_array[29][2] = new Array;
        lilv_array[29][1][1] = 0.0435;
        lilv_array[29][1][3] = 0.0475;
        lilv_array[29][1][5] = 0.0475;
        lilv_array[29][1][10] = 0.049;
        lilv_array[29][2][5] = 0.0275;
        lilv_array[29][2][10] = 0.0325;
        //15年10月24日利率下限（7折）
        lilv_array[30] = new Array;
        lilv_array[30][1] = new Array;
        lilv_array[30][2] = new Array;
        lilv_array[30][1][1] = 0.03045;
        lilv_array[30][1][3] = 0.03325;
        lilv_array[30][1][5] = 0.03325;
        lilv_array[30][1][10] = 0.0343;
        lilv_array[30][2][5] = 0.01925;
        lilv_array[30][2][10] = 0.02275;
        //15年10月24日利率下限（85折）
        lilv_array[31] = new Array;
        lilv_array[31][1] = new Array;
        lilv_array[31][2] = new Array;
        lilv_array[31][1][1] = 0.036975;
        lilv_array[31][1][3] = 0.040375;
        lilv_array[31][1][5] = 0.040375;
        lilv_array[31][1][10] = 0.04165;
        lilv_array[31][2][5] = 0.023375;
        lilv_array[31][2][10] = 0.027625;
        //15年10月24日利率上限（1.1倍）
        lilv_array[32] = new Array;
        lilv_array[32][1] = new Array;
        lilv_array[32][2] = new Array;
        lilv_array[32][1][1] = 0.04785;
        lilv_array[32][1][3] = 0.05225;
        lilv_array[32][1][5] = 0.05225;
        lilv_array[32][1][10] = 0.0539;
        lilv_array[32][2][5] = 0.03025;
        lilv_array[32][2][10] = 0.03575;
    
    
      var page = $('#page-calculate');
      var huankuan
    
      page.find('.selectarea').singleTap(function(){
        var i = parseInt($(this).data('index'));
        page.find('.selectarea').forEach(function(item,index){
          $(item).removeClass('selected');
          if((index+1) == i) {
            $(item).addClass('selected');
          }
        });
        if(i == 1) {
          page.find('.credit').removeClass('hide');
          // page.find('.credit-result').removeClass('hide');
          if(!page.find('.tax').hasClass('hide')) {
            page.find('.tax').addClass('hide');
          }
          if(!page.find('.tax-result').hasClass('hide')) {
            page.find('.tax-result').addClass('hide');
          }
        } else {
          page.find('.tax').removeClass('hide');
          // page.find('.tax-result').removeClass('hide');
          if(!page.find('.credit').hasClass('hide')) {
            page.find('.credit').addClass('hide');
          }
          if(!page.find('.credit-result').hasClass('hide')) {
            page.find('.credit-result').addClass('hide');
          }
        }
      });
    
      page.find('.credittype > div').singleTap(function(){
        var i = parseInt($(this).data('index'));
        page.find('.credittype > div').forEach(function(item,index){
          $(item).removeClass('selected');
        });
        page.find('.credittype > div:nth-child(' + i + ')').addClass('selected');
        exc_zuhe(i);
      });
    
      page.find('.repaymenttype .credittype-option').singleTap(function(){
        var i = parseInt($(this).data('index'));
        page.find('.repaymenttype .credittype-option').forEach(function(item,index){
          $(item).removeClass('selected');
          if((index+1) == i) {
            $(item).addClass('selected');
          }
        });
      });
    
      page.find('.taxtype .credittype-option').singleTap(function(){
        var i = parseInt($(this).data('index'));
        page.find('.taxtype .credittype-option').forEach(function(item,index){
          $(item).removeClass('selected');
          if((index+1) == i) {
            $(item).addClass('selected');
          }
        });
        if(i == 1) {
          page.find('.need-hide').forEach(function(item,index){
            if(!$(item).hasClass('hide')) {
              $(item).addClass('hide');
            }
          });
        } else {
          page.find('.need-hide').forEach(function(item,index){
            $(item).removeClass('hide');
          });
        }
    
      });
    
      page.find('.calculatetype.area .credittype-option').singleTap(function(){
        if(!$(this).hasClass('selected')) {
          $(this).addClass('selected');
        }
        page.find('.calculatetype.total .credittype-option').removeClass('selected');
        page.find('.calculatetype-area').removeClass('hide');
        if(!page.find('.calculatetype-total').hasClass('hide')) {
          page.find('.calculatetype-total').addClass('hide');
        }
      });
      page.find('.calculatetype.total .credittype-option').singleTap(function(){
        if(!$(this).hasClass('selected')) {
          $(this).addClass('selected');
        }
        page.find('.calculatetype.area .credittype-option').removeClass('selected');
        if(!page.find('.calculatetype-area').hasClass('hide')) {
          page.find('.calculatetype-area').addClass('hide');
        }
        page.find('.calculatetype-total').removeClass('hide');
      });
    
      page.find('select').on('change', function() {
        $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
        var obj1 = $(this).parent().find('.t1');
        var obj2 = $(this).parent().find('.t2');
        if(obj1 && obj1.length) {
          ShowLilvNew(this.value,page.find('.type-lily select')[0].value);
        }
        if(obj2 && obj2.length) {
          ShowLilvNew(page.find('.type-year select')[0].value,this.value);
        }
      });
    
      page.find('.type-jzfs select').on('change', function() {
        if(this.value == '1') {
          if(!page.find('.yj').hasClass('hide')) {
            page.find('.yj').addClass('hide');
          }
        } else {
          page.find('.yj').removeClass('hide');
        }
      });
    
      page.find('.calculate-btn.x1').singleTap(function(){
        var pType =  page.find('.selectarea.s1').hasClass('selected') ? 1 : (page.find('.selectarea.s2').hasClass('selected') ? 2 : '');
        if(pType == 1) {
          ext_loantotal();
        } else {
          ext_total();
        }
      });
    
      page.find('.calculate-btn.x2').singleTap(function(){
        var pType =  page.find('.selectarea.s1').hasClass('selected') ? 1 : (page.find('.selectarea.s2').hasClass('selected') ? 2 : '');
        if(pType == 1) {
          resetData(1);
        } else {
          resetData(2);
        }
      });
    
      function resetData(type) {
        if(type == 1) {
          page.find('#dprice').val('');
          page.find('#area').val('');
          page.find('#creditttotal').val('');
          page.find('#sy').val('');
          page.find('#gjj').val('');
          page.find('.type-mortgage select')[0].value = '7';
          page.find('.type-mortgage .text-value').text('7成');
          page.find('.type-year select')[0].value = '20';
          page.find('.type-year .text-value').text('20年 (240期)');
          page.find('.type-lily select')[0].value = '9';
          page.find('.type-lily .text').text('14年11月22日基准利率');
          ShowLilvNew(page.find('.type-year select')[0].value,page.find('.type-lily select')[0].value);
        } else {
          page.find('#fwmj').val('');
          page.find('#fwdj').val('');
          page.find('#houseprice').val('');
          page.find('#houseyprice').val('');
          page.find('.type-jzfs select')[0].value = '1';
          page.find('.type-jzfs .text-value').text('总价');
          page.find('.type-fcxz select')[0].value = '1';
          page.find('.type-fcxz .text-value').text('普通住房');
          page.find('.type-fcgz select')[0].value = '1';
          page.find('.type-fcgz .text-value').text('是');
          page.find('.type-scgf select')[0].value = '1';
          page.find('.type-scgf .text-value').text('是');
          page.find('.type-wyzf select')[0].value = '1';
          page.find('.type-wyzf .text-value').text('是');
        }
      }
    
      page.find('#fwmj').on('blur',function() {
        var a = parseInt(page.find('#fwmj').val());
        var b = parseInt(page.find('#fwdj').val());
        if(a && b) {
          page.find('#houseprice').val(''+(a*b/10000));
        }
      });
    
      page.find('#fwdj').on('blur',function() {
        var a = parseInt(page.find('#fwmj').val());
        var b = parseInt(page.find('#fwdj').val());
        if(a && b) {
          page.find('#houseprice').val(''+(a*b/10000));
        }
      });
    
      function ext_total(fmobj) {
        var houseprice = parseFloat(page.find('#houseprice').val()); //房屋总价
        var houseyprice = parseFloat(page.find('#houseyprice').val()); //房屋原价
        var fwdj = parseFloat(page.find('#fwdj').val());  //房屋单价
        var housearea = parseFloat(page.find('#fwmj').val()); //房屋面积
        if (isNaN(fwdj)){
          v.ui.alert("房屋单价必须有正确的值！");
          return;
        }
        if (isNaN(housearea)){
          v.ui.alert("房屋面积必须有正确的值！");
          return;
        }
        page.find('.tax-result').removeClass('hide');
    
        var housexz = page.find('.type-fcxz select')[0].value;//房屋性质
        var strjzfs = page.find('.type-jzfs select')[0].value;//计价方式
        var strRadiox = page.find('.type-fcgz select')[0].value;//是否满5年
        var strRadioq = page.find('.type-scgf select')[0].value;//是否首套住房
        var strOnly = page.find('.type-wyzf select')[0].value;//是否唯一住房
    
        //总价处理
        houseprice = houseprice * 10000
        houseyprice = houseyprice * 10000
        var qishui = 0; //契税
        var yyshu = 0; //营业税
        var grsdshui = 0; //个人所得税
        var gbshui = 5; //工本税
        var yhshui = 0; //印花税
        var yyshui
        var zhdijikuai = 0; //综合地价款
        if(housexz == "1") {
            if (strRadioq == "1") {
                if (housearea < 90) {
                    qishui = houseprice * 1 / 100;
                } else if (90 < housearea < 140 || housearea == 90) {
                    qishui = houseprice * 1.5 / 100;
                } if (housearea > 140 || housearea == 140) {
                    qishui = houseprice * 3 / 100;
                }
            } else {
                qishui = houseprice * 3 / 100;
            }
            if (strRadiox == "1") {
    
                if (housearea > 140 || housearea == 140) {
                    if (strjzfs == "1") {
                        yyshui = houseprice * 56 / 1000;
                    } else {
                        yyshui = houseprice - houseyprice;
                        yyshui = yyshui * 56 / 1000;
                    }
    
                } else {
                    yyshui = 0;
                }
                if (strOnly == "1") {
                    grsdshui = 0;
                } else {
                    if (strjzfs == "1") {
                        grsdshui = houseprice * 1 / 100;
                    } else {
                        grsdshui = houseprice - houseyprice;
                        grsdshui = grsdshui * 20 / 100;
                    }
    
                }
    
            } else {
                if (strjzfs == "1") {
                    grsdshui = houseprice * 1 / 100;
                } else {
                    grsdshui = houseprice - houseyprice;
                    grsdshui = grsdshui * 20 / 100;
                }
    
                yyshui = houseprice * 56 / 1000;
            }
    
            zhdijikuai = 0;
        }
        else if (housexz == "2") {
            qishui = houseprice * 3 / 100;
            if (strjzfs == "1") {
                yyshui = houseprice * 56 / 1000;
            } else {
                yyshui = houseprice - houseyprice;
                yyshui = yyshui * 56 / 1000;
            }
            if (strRadiox == "1" && strRadioq == "1") {
                if (strjzfs == "1") {
                    grsdshui = houseprice * 1 / 100;
                } else {
    
                    grsdshui = houseprice - houseyprice;
                    grsdshui = grsdshui * 20 / 100;
                }
            } else {
    
                if (strjzfs == "1") {
                    grsdshui = houseprice * 1 / 100;
                } else {
    
                    grsdshui = houseprice - houseyprice;
                    grsdshui = grsdshui * 20 / 100;
                }
            }
            zhdijikuai = 0;
        } else {
            if (strRadioq == "1") {
                if (housearea < 90) {
                    qishui = houseprice * 1 / 100;
                } else if (90 < housearea < 140 || housearea == 90) {
                    qishui = houseprice * 1.5 / 100;
                } if (housearea > 140 || housearea == 140) {
                    qishui = houseprice * 3 / 100;
                }
            } else {
                qishui = houseprice * 3 / 100;
            }
            zhdijikuai = houseprice * 10 / 100;
            if (housearea > 140 || housearea == 140) {
                yyshui = houseprice * 56 / 1000;
            } else {
                yyshui = 0;
    
            }
            yhshui = 0;
            if (strOnly == "1") {
                grsdshui = 0;
    
            } else {
                if (strjzfs == "1") {
                    grsdshui = houseprice * 1 / 100;
                } else {
                    grsdshui = houseprice - houseyprice;
                    grsdshui = grsdshui * 20 / 100;
                }
            }
            gbshui = 5;
        }
    
        var atype =  page.find('.a1').hasClass('selected') ? 1 : (page.find('.a2').hasClass('selected') ? 2 : '');
    
        if(atype == 1) {
          page.find('.xftype').removeClass('hide');
          if(!page.find('.esftype').hasClass('hide')) {
            page.find('.esftype').addClass('hide');
          }
          var dj33 = parseFloat(fwdj);
          var mj33 = parseFloat(housearea);
          var fkz3 = dj33 * mj33;
          page.find('.result.m1').text(fwdj * housearea);
          var yh = fkz3 * 0.0005;
          page.find('.result.m2').text(yh);
    
          if (dj33 <= 9432) var q1 = fkz3 * 0.015
          else if (dj33 > 9432) var q1 = fkz3 * 0.03
          if (mj33 <= 120) var fw1 = 500;
          else if (120 < mj33 <= 5000) var fw1 = 1500;
          if (mj33 > 5000) var fw1 = 5000
          var gzh = fkz3 * 0.003
          page.find('.result.m3').text(gzh);
          var q = Math.round(q1 * 100, 5) / 100
          page.find('.result.m4').text(q);
          var wt = Math.round(gzh * 100, 5) / 100
          page.find('.result.m5').text(wt);
          var fw = Math.round(fw1 * 100, 5) / 100
          page.find('.result.m6').text(fw);
        } else {
          page.find('.esftype').removeClass('hide');
          if(!page.find('.xftype').hasClass('hide')) {
            page.find('.xftype').addClass('hide');
          }
          page.find('.result.f1').text(qishui);
          page.find('.result.f2').text(yyshui);
          page.find('.result.f3').text(yhshui);
          page.find('.result.f4').text(grsdshui);
          page.find('.result.f5').text(gbshui);
          page.find('.result.f6').text(zhdijikuai);
          page.find('.result.f7').text(qishui + yyshui +yhshui +grsdshui +gbshui +zhdijikuai);
        }
      }
    
      function exc_zuhe(v) {
        if (v == 3) {
          if(!page.find('.type-sy-gjj').hasClass('hide')) {
            page.find('.type-sy-gjj').addClass('hide');
          }
          page.find('.type-zuhe').removeClass('hide');
          page.find('.lily2').removeClass('hide');
          page.find('.text-note1').removeClass('hide');
        }else {
          if(!page.find('.type-zuhe').hasClass('hide')) {
            page.find('.type-zuhe').addClass('hide');
          }
          if(!page.find('.lily2').hasClass('hide')) {
            page.find('.lily2').addClass('hide');
          }
          if(!page.find('.text-note1').hasClass('hide')) {
            page.find('.text-note1').addClass('hide');
          }
          page.find('.type-sy-gjj').removeClass('hide');
        }
        ShowLilvNew(page.find('.type-year select')[0].value,page.find('.type-lily select')[0].value);
      }
    
      function ext_loantotal() {
        // 1 商业贷款 2 公积金贷款 3 组合贷款
        var status = page.find('.credittype > div:nth-child(1)').hasClass('selected') ? 1 : (page.find('.credittype > div:nth-child(2)').hasClass('selected') ? 2 : (page.find('.credittype > div:nth-child(3)').hasClass('selected') ? 3 : ''));
        //取房贷计算器单价
        var price = parseInt(page.find('#dprice').val());
        //面积
        var sqm = parseInt(page.find('#area').val());
        //按揭成数
        var anjie = parseInt(page.find('.type-mortgage select')[0].value);//贷款总数
        var daikuan = parseInt(page.find('#creditttotal').val());
        //按揭年数
        var years = parseInt(page.find('.type-year select')[0].value);
        //本金或者本息 1为本息，2为本金
        var radioben =  page.find('.credittype-option.b1').hasClass('selected') ? 1 : (page.find('.credittype-option.b2').hasClass('selected') ? 2 : '');
        var month = years * 12;
    
        // console.log(status,price,sqm,anjie,daikuan,years,radioben);
    
        if (status == 3) { //判断是房贷计算 组合型
         //  //--  组合型贷款(组合型贷款的计算，只和商业贷款额、和公积金贷款额有关，和按贷款总额计算无关)
          var total_sy = parseInt(page.find('#sy').val());
          var total_gjj = parseInt(page.find('#gjj').val());
          if(!total_sy) {
            v.ui.alert('请填写商业性贷款总额');
            return;
          }
          if(!total_gjj) {
            v.ui.alert('请填写公积金贷款总额');
            return;
          }
          page.find('.credit-result').removeClass('hide');
          page.find('.note-text2').removeClass('hide');
          //房款总额
          page.find('.result.t1').text('略');
          //首期付款
          page.find('.result.t5').text(0);
          //贷款总额
          var daikuan_total = total_sy + total_gjj;
          page.find('.result.t2').text(daikuan_total);
          //还款月数
          page.find('.result.t6').text(month + '月');
          //月还款
          var lilv_sd = page.find('#lily').val() / 100; //得到商贷利率
          var lilv_gjj = page.find('#lily2').val() / 100; //得到公积金利率
          if(radioben == 1) {
            //等额本息
            //月均还款
            if(!page.find('.tp2').hasClass('hide')) {
              page.find('.tp2').addClass('hide');
            }
            page.find('.tp1').removeClass('hide');
            var month_money1 = getMonthMoney1(lilv_sd, total_sy, month) + getMonthMoney1(lilv_gjj, total_gjj, month);//调用函数计算
            page.find('.result.t7').text(Math.round(month_money1 * 100) / 100 + '(元)');
            //还款总额
            var all_total1 = month_money1 * month;
            page.find('.result.t3').text(Math.round(all_total1 * 100) / 100);
            //支付利息款
            page.find('.result.t4').text(Math.round((all_total1 - daikuan_total) * 100) / 100);
          }else{
            //等额本金
            page.find('.tp2').removeClass('hide');
            if(!page.find('.tp1').hasClass('hide')) {
              page.find('.tp1').addClass('hide');
            }
            var all_total2 = 0;
            var month_money2 = "";
            // for (j = 0; j < month; j++) {
            for (var j = 0; j < month; j++) {
                //调用函数计算: 本金月还款额
                huankuan = getMonthMoney2(lilv_sd, total_sy, month, j) + getMonthMoney2(lilv_gjj, total_gjj, month, j);
                all_total2 += huankuan;
                huankuan = Math.round(huankuan * 100) / 100;
                month_money2 += (j + 1) + "月," + huankuan + "(元)\n";
            }
            //月均还款
            page.find('textarea').html(month_money2);
            //还款总额
            page.find('.result.t3').text(Math.round(all_total2 * 100) / 100);
            //支付利息款
            page.find('.result.t4').text(Math.round((all_total2 - daikuan_total) * 100) / 100);
          }
        }else {
          //商业贷款、公积金贷款
          var lilv = page.find('#lily').val() / 100; //得到利率
          //计算方式
          if(page.find('.calculatetype.area .credittype-option').hasClass('selected')) {
            if(!price) {
              v.ui.alert('请填写单价');
              return;
            }
            if(!sqm) {
              v.ui.alert('请填写面积');
              return;
            }
            page.find('.credit-result').removeClass('hide');
            page.find('.note-text2').removeClass('hide');
            //房款总额
            var fangkuan_total = price * sqm;
            page.find('.result.t1').text(fangkuan_total);
            //贷款总额
            var daikuan_total = (price * sqm) * (anjie / 10);
            page.find('.result.t2').text(daikuan_total);
            //首期付款
            var money_first = fangkuan_total - daikuan_total;
            page.find('.result.t5').text(money_first);
          }else{
            if(!daikuan) {
              v.ui.alert('请填写贷款总额');
              return;
            }
            page.find('.credit-result').removeClass('hide');
            page.find('.note-text2').removeClass('hide');
            //房款总额
            page.find('.result.t1').text('略');
            //贷款总额
            var daikuan_total = daikuan;
            page.find('.result.t2').text(daikuan);
            //首期付款
            page.find('.result.t5').text(0);
          }
          //还款月数
          page.find('.result.t6').text(month + '月');
          if(radioben == 1) {
            //等额本息
            //月均还款
            if(!page.find('.tp2').hasClass('hide')) {
              page.find('.tp2').addClass('hide');
            }
            page.find('.tp1').removeClass('hide');
            var month_money1 = getMonthMoney1(lilv, daikuan_total, month); //调用函数计算
            page.find('.result.t7').text(Math.round(month_money1 * 100) / 100 + '(元)');
            //还款总额
            var all_total1 = month_money1 * month;
            page.find('.result.t3').text(Math.round(all_total1 * 100) / 100);
            //支付利息款
            page.find('.result.t4').text(Math.round((all_total1 - daikuan_total) * 100) / 100);
          }else{
            //等额本金
            page.find('.tp2').removeClass('hide');
            if(!page.find('.tp1').hasClass('hide')) {
              page.find('.tp1').addClass('hide');
            }
            var all_total2 = 0;
            var month_money2 = "";
            // for (j = 0; j < month; j++) {
            for (j = 0; j < month; j++) {
                //调用函数计算: 本金月还款额
                huankuan = getMonthMoney2(lilv, daikuan_total, month, j);
                all_total2 += huankuan;
                huankuan = Math.round(huankuan * 100) / 100;
                month_money2 += (j + 1) + "月," + huankuan + "(元)\n";
            }
            //月均还款
            page.find('textarea').html(month_money2);
            //还款总额
            page.find('.result.t3').text(Math.round(all_total2 * 100) / 100);
            //支付利息款
            page.find('.result.t4').text(Math.round((all_total2 - daikuan_total) * 100) / 100);
          }
        }
      }
    
      function ShowLilvNew(month, lt) {
        var status = page.find('.credittype > div:nth-child(1)').hasClass('selected') ? 1 : (page.find('.credittype > div:nth-child(2)').hasClass('selected') ? 2 : (page.find('.credittype > div:nth-child(3)').hasClass('selected') ? 3 : ''));
        var indexNumSd = getArrayIndexFromYear(month, 1); // 商贷
        var indexNumGj = getArrayIndexFromYear(month, 2); // 公积金
        if (status == 1) {
          var v = myround(lilv_array[lt][1][indexNumSd] * 100, 2);
          page.find('#lily').val(''+v);
        } else if (status == 2) {
          var v = myround(lilv_array[lt][2][indexNumGj] * 100, 2);
          page.find('#lily').val(''+v);
        } else {
          var v2 = myround(lilv_array[lt][1][indexNumSd] * 100, 2);
          page.find('#lily').val(''+v2);
          var v = myround(lilv_array[lt][2][indexNumGj] * 100, 2);
          page.find('#lily2').val(''+v);
        }
      }
    
      function myround(v, e) {
        var t = 1;
        e = Math.round(e);
        for (; e > 0; t *= 10, e--);
        for (; e < 0; t /= 10, e++);
        return Math.round(v * t) / t;
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
    
      function getArrayIndexFromYear(year, dkType) {
        var indexNum = 0;
        if (dkType == 1) {
            if (year == 1) {
                indexNum = 1;
            } else if (year > 1 && year <= 3) {
                indexNum = 3;
            } else if (year > 3 && year <= 5) {
                indexNum = 5;
            } else {
                indexNum = 10;
            }
        } else if (dkType == 2) {
            if (year > 5) {
                indexNum = 10;
            } else {
                indexNum = 5;
            }
        }
        return indexNum;
      }
    }
    
  }
})