var setting = {
    appid:'wx7bb0ca61d31e7d02',//深圳
    //appid:'wx47618d21a88dd4b0',//重庆
    //appid: 'wx0f5411fe8d651842',
    shortUrl: '',
    client: {
        allowDownload: true,
        androidDownloadUrl: 'http://dl.dev.goodhfz.com/android/hfz_beta_0.2.apk',
        iosDownloadUrl: 'http://fir.im/haofangzi'
    },
    api: {
        url: '/qc-webapp/qcapi.do',
        //url: 'http://localhost:8080/qc-webapp/qcapi.do',
        // url: 'http://qqac.cq.onlyhante.com/qc-webapp/qcapi.do',
        timeout: 15000
    },
    wechat: {
        oauth: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid={appid}&redirect_uri=http%3A%2F%2F{hostname}%2F{apidirpath}%2Foauthcallback.do%3Fappid%3D{appid}&response_type=code&scope=snsapi_base&state={state}#wechat_redirect',
        jssdk: {
            timestamp: 1466270805,
            nonceStr: "bccfdc73f828bfe387923629d53422f6",
            signature: "02b44f56d6c7e49bd905be0c409bf293914589d9"
        }
    },
    share: {
        url: '/qc-webapp/share.jsp?t=share&preid=${openid}&appid=${appid}&url=${url}&scene=${scene}',
        link: null,
        title: '来自好房子的分享',
        desc: '更多精彩，更多欢乐，尽在好房子！',
        image: null,
        timelineTitle: null
    },
    fake: {
        openid:'oZc8us6WTC88tILnVOnLNgH4aW14',//深圳
        passport:'964d703fb0c0e05e57ab4e28d23b5979',//深圳
        //openid: 'oNsFzs2ltIMdf1mEWI2UJXD4ZTR8',
        //passport: 'cccd3ff3ac0302f93d616d340352716e',
        flag: 1,
        issubscribe: 1
    },
    subsUrl: '',
    trademark: '',
    channel: {
        //openid:'owlJNs46SKTA5xnjoYxixOoBAm0o',//重庆
        //passport:'b62d8f319391b3a6e860bb1bda9d2137',//重庆
        openid:'oZc8us6WTC88tILnVOnLNgH4aW14',//深圳
        passport:'964d703fb0c0e05e57ab4e28d23b5979',//深圳
        //openid: 'oNsFzswHfYNny0EpJ4KyyhZbj3f8',
        //passport: '74d659babe32d6eac6068e2b9ade9b6c',
        qq: {},
        weibo: {}
    },
    menu: {
        '楼盘介绍': [
            {name: '楼盘简介', action: 'intro-list.html'},
            {name: '全景看房', action: 'fullview-list.html'},
            {name: '实时街景', action: 'pano.html'},
            {name: '区域动态', action: 'trend-list.html'},
            {name: '品牌故事', action: 'brand.html'},
            {name: '微信楼书', action: 'book.html'},
            {name: '旺铺招商', action: 'zs-sale.html'}
        ],
        '互动体验': [
            {name: '销售讯息', action: 'salenews-list.html'},
            {name: '社区实景', action: 'pictures.html'},
            {name: '精彩秀场', action: 'video-list.html'},
            {name: '光彩大事', action: 'event-list.html'},
            {name: '游戏中心', action: 'games.html'}
        ],
        '会员专区': [
            {name: '会员权益', action: 'profile.html'},
            {name: '预约订房', action: 'sale.html'},
            {name: '呼朋唤友', action: 'share.html'},
            {name: '数据统计', action: 'chart/index.html'},
            {name: '问卷调查', action: 'questionaire-dev.html'}
        ]
    }
}