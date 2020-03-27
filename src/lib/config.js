/*
* 微信中控域名地址
*   微信公众号接口配置使用；
*   业务系统调用使用；
* */
export const CENTRAL_CONTROL_SERVE_URL = 'https://1848affa.ngrok.io';

/*
* 对接的微信公众号列表
*   对外提供的接口，或微信接口配置处，需要携带对应公众号id（url?id=0），否则接口调用不成功；
*   也可以用数据库的形式存储
* */
export const WECHAT_LIST = [
    {id: 0, name: '微信测试号', appid: 'wxb220379cdcbc10e7', appsecret: 'fc4264320146af315cb05a1a2d3d5b13'}
]

/*
* 在think-wechat中间件插件配置处使用 => src/config/middleware/
* */
export const WECHAT_DEVELOPER_ROUTE = '/serve';

/*
* 在think-wechat中间件插件配置处使用 => src/config/middleware/
* */
export const WECHAT_DEVELOPER_TOKEN = 'zyq';