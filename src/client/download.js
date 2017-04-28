/**
 * Created by cator on 7/29/16.
 */
"use strict";
Page.ready(function($, query) {

  return {

    init() {
    },

    onDownload() {
      if (!v.env.mobile) {
        v.ui.alert('请在手机浏览器中打开此页面')
        return
      }
      if (v.env.ios) {
        v.ui.alert('当前iOS版的APP处于内测发布阶段，需要您提供iPhone的UDID给产品团队，否则无法下载安装APP。\n\n（如果已提供，请忽略此提示）\n\n内测申请请联系 hi@catorv.com').then(function () {
          Page.open(app.client.dl.ios)
        })
      } else if (v.env.android) {
        Page.open(app.client.dl.android)
      } else {
        v.ui.alert('暂时没有支持您当前系统的APP')
      }
    }
  }

})