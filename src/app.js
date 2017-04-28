// App Object
v.x(app, {
  id: setting.appid,

  ui: {
    title: '好房子',
    headImg: '/images/default-avatar.jpg'
  },

  client: {
    dl: {
      android: (setting.client && setting.client.androidDownloadUrl) ? setting.client.androidDownloadUrl : 'http://dl.dev.goodhfz.com/android/hfz_beta_0.2.apk',
      ios: (setting.client && setting.client.iosDownloadUrl) ? setting.client.iosDownloadUrl : 'http://fir.im/haofangzi'
    },
    check: {
      android: 'ldaha://',
      ios: ''
    }
  },

  SHARE_LINK: setting.share.link || Fn.shareLink(), // 分享的链接，null代表当前页面
  SHARE_IMG_URL: setting.share.image || v.url.build({}, 'images/wx-hfz-icon.png'),
  SHARE_TITLE: setting.share.title || '来自好房子的分享',
  SHARE_DESC: setting.share.desc || '更多精彩，更多欢乐，尽在好房子！',

  SHARE_TARGET: {
    WECHAT_FRIEND: 100,
    WECHAT_TIMELINE: 101,
    QQ: 102,
    QQZONE: 103,
    MESSAGE: 104,
    WEIBO: 105
  },

  // Wechat options
  wechat: {
    DEBUG: v.url.query('wx_debug') == 'yes',

    OAUTH_URL: setting.wechat.oauth,

    SHARE_URL: setting.share.url,

    SHARE_TPL_TITLE: '${content}',
    SHARE_TPL_DESC: '${content}',

    SHARE_LINK: setting.share.link || null, // 分享的链接，null代表当前页面
    SHARE_IMG_URL: setting.share.image || v.url.build({}, 'images/wx-hfz-icon.png'),
    SHARE_TITLE: setting.share.title || '来自好房子的分享',
    SHARE_DESC: setting.share.desc || '更多精彩，更多欢乐，尽在好房子！',

    // SHARE_FRIEND: {}, // 分享给朋友
    SHARE_TIMELINE: { // 分享到朋友圈
      SHARE_TITLE: setting.share.timelineTitle || '更多精彩，更多欢乐，尽在好房子！'
    },
    // SHARE_QQ: {}, // 分享到QQ
    // SHARE_WEIBO: {}, // 分享到微博
    // SHARE_QZONE: {}, // 分享到QQ空间

    SHARE_CALLBACK_OK: $.nop,
    SHARE_CALLBACK_CANCEL: $.nop,

    jssdk: v.x({
      appid: setting.appid
    }, setting.wechat.jssdk)
  },

  // API options
  API_URL: setting.api.url,
  API_TIMEOUT: setting.api.timeout || 30000,
  BASE_URL: location.protocol + '//' + location.host,
  APIS: {
    request: {}, //承载action的通用方法
    getAppid: {
      action: '/global/App/getAppid'
    }, //获取appid
    loginByScan: {
      action: '/asus/Order/loginByScan'
    }, //扫码登录
    getUserinfo: {
      action: '/global/User/getUserInfo'
    }, //获取用户信息
    info: {
      action: '/global/Project/info'
    }, //获取楼盘详情
    addfavorite: {
      action: '/sq/my/Favorite/add'
    }, //添加收藏
    delfavorite: {
      action: '/sq/my/Favorite/del'
    }, //删除收藏
    listfavorite: {
      action: '/sq/my/Favorite/list'
    }, //收藏列表
    getpostbyprojectid: {
      action: '/forum/ForumAction/getpostbyprojectid'
    },
    //获取帖子
    replylist: {
      action: '/forum/ForumAction/replylist'
    }, //回复列表
    reply: {
      action: '/forum/ForumAction/reply'
    }, //评论
    likeforum: {
      action: '/forum/ForumAction/like'
    }, //评论
    addhistory: {
      action: '/sq/my/Brows/add'
    }, //添加浏览记录
    listhistory: {
      action: '/sq/my/Brows/list'
    }, //浏览记录列表
    addlog: {
      action: '/global/Click/addlog'
    }, //添加项目详细浏览记录
    listroom: {
      action: '/global/Click/addlog'
    }, //添加项目详细浏览记录
    listproject: {
      action: '/global/Project/search'
    }, //添加项目详细浏览记录
    noticelist: {
      action: '/global/Notice/list'
    }, //消息列表
    gethot: {
      action: '/sq/yx/Agent/getHot'
    }, //随机置业顾问
    listperfer: {
      action: '/sq/my/Prefer/list'
    }, //显示偏好
    addperfer: {
      action: '/sq/my/Prefer/add'
    }, //添加偏好
    updateperfer: {
      action: '/sq/my/Prefer/update'
    }, //修改偏好
    activity: {}, //活动接口
    counttotal: {
      action: '/global/Count/total'
    }, //点击和用户数量
    getrank: {
      action: '/rpt/Ranking/sort'
    }, //排行榜
    listRecommend: {
      action: '/sq/my/Recommendation/list'
    }, //智能推荐
    listItemCache: {
      action: '/global/Select/listItemFromCache'
    }, //下拉列表
    hotnews: {
      action: '/global/Hotnews/list'
    }, //热点新闻
    hotnewsarea: {
      action: '/global/HotnewsArea/list'
    }, //热点资讯

    //活动接口
    joinActivity: {
      action: '/activity/WQAction/join'
    }, //参加活动
    updateActivity: {
      action: '/activity/WQAction/update'
    }, //更新信息
    infoActivity: {
      action: '/activity/WQAction/info'
    }, //信息查询
    addCountsActivity: {
      action: '/activity/WQAction/addGamecounts'
    }, //增加活动游戏次数
    playActivity: {
      action: '/activity/WQAction/play'
    }, //更新游戏记录
    rankActivity: {
      action: '/activity/WQAction/rank'
    }, //排行榜

    //b端接口
    getVericode: {
      action: '/global/App/getVericode'
    }, //验证码
    bGetUserInfo: {
      action: '/xkb/biz/User/info'
    }, //返回用户角色
    bRegister: {
      action: '/xkb/biz/Agent/register'
    }, //注册经纪人
    bListAgency: {
      action: '/xkb/biz/Agency/list'
    }, //公司列表
    bRecommendUser: {
      action: '/xkb/biz/Agentuser/add'
    }, //推荐客户
    bUpdateUser: {
      action: '/xkb/biz/Agentuser/update'
    }, //修改客户
    bAddProject: {
      action: '/xkb/biz/Agentuser/addProject'
    }, //添加项目
    bListCustomerByName: {
      action: '/xkb/biz/Agentuser/listByName'
    }, //客户列表按姓名
    bListCustomerByProject: {
      action: '/xkb/biz/Agentuser/listByProject'
    }, //客户列表按项目
    bListProjectClinet: {
      action: '/xkb/biz/Agentuser/listPojectClient'
    }, //项目下的客户列表
    bProjectAccount: {
      action: '/xkb/biz/Agent/projectAccount'
    }, //项目下的客户信息
    bAgentuserInfo: {
      action: '/xkb/biz/Agentuser/infoV2'
    }, //客户信息
    bAgentHelp: {
      action: '/xkb/biz/Agent/help'
    }, //提交顾问跟进
    bListClient: {
      action: '/xkb/biz/Saler/listClient'
    }, //工作人员客户列表
    bUpdateClient: {
      action: '/xkb/biz/Saler/updateClient'
    }, //工作人员更新客户信息
    bListNotice: {
      action: '/xkb/biz/Notice/list'
    }, //工作人员消息列表
    bUpdateRead: {
      action: '/xkb/biz/Notice/updateRead'
    }, //工作人员更新未读消息
    bListForum: {
      action: '/forum/ForumAction/list'
    }, //帖子列表
    bReplyForum: {
      action: '/forum/ForumAction/reply'
    }, //回复帖子
    bGetForum: {
      action: '/forum/ForumAction/getpost'
    }, //获取帖子
    bReplyList: {
      action: '/forum/ForumAction/replylist'
    }, //回复列表
    bListAgent: {
      action: '/xkb/biz/Agent/list'
    }, //注册经纪人列表
    bListAgencyUser: {
      action: '/xkb/biz/Agency/listProjectClient'
    }, //经纪人客户列表
    //售后接口
    cHouseInfo: {
      action: '/cs/HouseInfo/list'
    }, //小区列表
    cHouseList: {
      action: '/cs/House/list'
    }, //楼盘列表
    cHouseBindList: {
      action: '/cs/House/bindList'
    }, //搜索用户绑定列表
    cHouseBind: {
      action: '/cs/House/bind'
    }, //注册
    cServiceList: {
      action: '/cs/Propertyservice/list'
    }, //社区服务
    cServiceAddPhone: {
      action: '/cs/Propertyservice/phonerecord'
    }, //社区服务-增加电话
    cServiceAddComment: {
      action: '/cs/Propertyservice/addcomment'
    }, //社区服务-增加评论
    cServiceCommentList: {
      action: '/cs/Propertyservice/listcomment'
    }, //社区服务-评论列表
    cDetailResource: {
      action: '/cs/Resource/list'
    }, //社区服务-详情
    cAddExpress: {
      action: '/cs/Express/save'
    }, //增加快递单
    cMyExpress: {
      action: '/cs/Express/mylist'
    }, //快递单列表
    cCompleteExpress: {
      action: '/cs/Express/complete'
    }, //收取快递
    cListCategory: {
      action: '/cs/groupbuy/Category/list'
    }, //组团团购
    cListProduct: {
      action: '/cs/groupbuy/Product/list'
    }, //组团团购二级列表
    cListGroupParnter: {
      action: '/cs/groupbuy/GroupParnter/mylist'
    }, //我的参团纪录
    cListComment: {
      action: '/cs/groupbuy/Comment/list'
    }, //团购评论列表
    cAddComment: {
      action: '/cs/groupbuy/Comment/save'
    }, //团购添加评论
    cJoinProduct: {
      action: '/cs/groupbuy/Product/join'
    }, //参与团购
    cListJoined: {
      action: '/cs/groupbuy/Product/listJoined'
    }, //参与团购列表
  },

  FAKE_DATAS: {
    // 提供给CMS预览使用
    admin: setting.fake
  },
  SESSION_FIELDS: ['openid', 'passport', 'flag', 'issubscribe'],

  SUBS_URL: setting.subsUrl,
  TRADEMARK: setting.trademark,

  menu: setting.menu,

  channels: setting.channels || {
    // dianmeng: {
    //   name: 'dianmeng',
    //   homepage: 'http://dmhd.sh.tophfz.com/menusiframe.html?url=http%3A%2F%2Fm.ahasou.com%2Fdianmeng%2Falbumlist.html%3Fchannel%3Ddianmeng'
    // }
  }

});

// Init
v.ready(function() {
  var query = v.url.query();
  var cmd = query.cmd;
  var channel = query.channel

  app.channel = channel && app.channels[channel] || {}
  app.fake = query.fake;

  if (cmd) {
    // 清除 localStorage 和 cookie
    if (cmd == 'clean') {
      v.storage.clear()
      v.cookie.clear()
    }
    delete query.cmd
    return Page.redirect(v.url.build(query))
  }

  Promise.all([Api.init()]).then(function() {
    app.user = new User()
    app.ready(true)
  })

});