// 对外开放接口

import {
    getConfigById, getJsapiTicketById, getAccessTokenById,
    getPrivateTemplateAll, templateSend,
    getUserInfo, getOpenIdByAuth, getUserInfoByAuth,
    customSendText, customSendVoice, customSendImage, customSendMusic, customSendArticle,
    createParamsQr, createShortUrl
} from "../api/wechat";
import {getNonceStr, getSignature, getTimestamp, httpRes} from "../lib/utils";
import {CENTRAL_CONTROL_SERVE_URL} from "../lib/config";

module.exports = class extends think.Controller {
    /*
    * 鉴权第一步
    * 作用：组装微信鉴权完整地址，引导鉴权后，回调中控进行下一步操作
    * @params
    *   back：鉴权结束后跳转的前端页面地址
    *   serve：鉴权结束后跳转的业务方服务端地址，由该地址向back跳转
    *   scope：鉴权方式（snsapi_base：不弹出授权；snsapi_userinfo：弹出授权）
    * @return
    *   重定向到微信鉴权的url
    * @next
    *   微信授权之后会跳转至拼接好的回调地址 => 依旧是中控
    * */
    async go_authAction() {
        let that = this;
        let {back, serve = '', scope = 'snsapi_base'} = that.get();
        if (think.isEmpty(back)) return that.json(httpRes.errArgumentMiss);
        let webUrl = encodeURIComponent(back);
        let serveUrl = serve;
        let redirectUri = `${CENTRAL_CONTROL_SERVE_URL}/wxopen/back_business?${encodeURIComponent(`scope=${scope}&back=${webUrl}&id=${that.wechatInfo.id}&serve=${serveUrl}`)}`;
        let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${that.wechatInfo.appid}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`;
        that.redirect(url);
    }

    /*
    * 鉴权第二步
    * 作用：此时可以拿到鉴权后的code，获取到openid后，拼接到业务方地址，并重定向回业务方
    * @params
    *   code：授权之后拿到的code
    *   back：鉴权结束后跳转的前端页面地址
    *   serve：鉴权结束后跳转的业务方服务端地址，由该地址向back跳转
    *   scope：鉴权方式（snsapi_base：不弹出授权；snsapi_userinfo：弹出授权）
    * @return
    *   重定向到业务方服务端地址（serve），并携带openid
    * @next
    *   业务方服务端拿到openid后，重定向回前端页面（back）
    * */
    async back_businessAction() {
        let that = this;
        let {code, back, serve = '', scope = 'snsapi_base'} = that.get();
        if (think.isEmpty(code) || think.isEmpty(back)) return that.json(httpRes.errArgumentMiss);
        let openidByAuthRes = await getOpenIdByAuth(that.wechatInfo.id, code);
        if (openidByAuthRes.code !== 0) return that.redirect(back);
        let {data: {access_token, openid}} = openidByAuthRes;
        let userInfoRes = scope == 'snsapi_base' ?
            await getUserInfo(that.wechatInfo.id, openid) :
            await getUserInfoByAuth(openid, access_token);
        console.log(userInfoRes);
        let webUrl = encodeURIComponent(back);
        let backUrl = `${serve}?id=${that.wechatInfo.id}&openid=${openid}&redirect=${webUrl}`;
        that.redirect(backUrl);
    }

    /*
    * 获取sdk配置
    * @params
    *   url：前端页面完整地址
    * @return
    *   {appId:'',timestamp:'',nonceStr:'',signature:''}
    * */
    async get_sdk_configAction() {
        let that = this;
        let {url} = that.get();
        if (think.isEmpty(url)) return that.json(httpRes.errArgumentMiss);
        let jsapiTicketRes = await getJsapiTicketById(that.wechatInfo.id);
        if (jsapiTicketRes.code != 0) return that.json(jsapiTicketRes);
        let {data: {ticket}} = jsapiTicketRes;
        let shareConfig = {nonceStr: getNonceStr(), jsapi_ticket: ticket, timestamp: getTimestamp(), url: url}
        let signature = getSignature(shareConfig);
        return that.json(httpRes.suc({
            appId: that.wechatInfo.appid,
            timestamp: shareConfig.timestamp,
            nonceStr: shareConfig.nonceStr,
            signature: signature
        }))
    }

    /*
    * 获取AccessToken
    * @return
    *   { access_token : ''}
    * */
    async get_access_tokenAction() {
        let that = this;
        let res = await getAccessTokenById(that.wechatInfo.id);
        return that.json(res);
    }

    /*
    * 获取用户信息
    * @params
    *   openid：用户微信openid
    * @return
    *   {
    *       subscribe:'',
    *       openid:'',
    *       nickname:'',
    *       sex:'',
    *       language:'',
    *       city:'',
    *       province:'',
    *       country:'',
    *       headimgurl:'',
    *       subscribe_time:'',
    *       remark:'',
    *       groupid:'',
    *       tagid_list:'',
    *       subscribe_scene:'',
    *       qr_scene:'',
    *       qr_scene_str:''
    *   }
    * */
    async get_user_infoAction() {
        let that = this;
        let {openid} = that.get();
        if (think.isEmpty(openid)) return that.json(httpRes.errArgumentMiss);
        let res = await getUserInfo(that.wechatInfo.id, openid)
        return that.json(res);
    }

    /*
    * 发送客服消息 => 文字
    * @post
    *   list : 批量列表
    *       openid：微信openid
    *       text：发送的内容
    * @return
    *   null
    * */
    async custom_send_textAction() {
        let that = this;
        let {list} = that.post();
        if (think.isEmpty(list)) return that.json(httpRes.errArgumentMiss);
        for (let item of list) {
            if (item.openid && item.text) {
                customSendText(that.wechatInfo.id, item.openid, item.text).then(sendRes => {
                    console.log(sendRes)
                });
            }
        }
        return that.json(httpRes.suc())
    }

    /*
    * 发送客服消息 => 语音
    * @post
    *   list : 批量列表
    *       openid：微信openid
    *       mediaId：发送的内容
    * @return
    *   null
    * */
    async custom_send_voiceAction() {
        let that = this;
        let {list} = that.post();
        if (think.isEmpty(list)) return that.json(httpRes.errArgumentMiss);
        for (let item of list) {
            if (item.openid && item.mediaId) {
                customSendVoice(that.wechatInfo.id, item.openid, item.mediaId).then(sendRes => {
                    console.log(sendRes);
                });
            }
        }
        return that.json(httpRes.suc())
    }

    /*
    * 发送客服消息 => 图片
    * @post
    *   list : 批量列表
    *       openid：微信openid
    *       mediaId：发送的内容
    * @return
    *   null
    * */
    async custom_send_imageAction() {
        let that = this;
        let {list} = that.post();
        if (think.isEmpty(list)) return that.json(httpRes.errArgumentMiss);
        for (let item of list) {
            if (item.openid && item.mediaId) {
                customSendImage(that.wechatInfo.id, item.openid, item.mediaId).then(sendRes => {
                    console.log(sendRes);
                });
            }
        }
        return that.json(httpRes.suc())
    }

    /*
    * 发送客服消息 => 音乐
    * @post
    *   list : 批量列表
    *      openid：微信openid
    *      music：音乐相关信息
    *           title：音乐标题
    *           desc：音乐描述
    *           playUrl：音乐播放地址
    *           playHqUrl：高清音乐播放地址
    *           mediaId：内容id
    * return
    *   null
    * */
    async custom_send_musicAction() {
        let that = this;
        let {list} = that.post();
        if (think.isEmpty(list)) return that.json(httpRes.errArgumentMiss);
        for (let item of list) {
            if (item.openid && think.isObject(item.music)) {
                customSendMusic(that.wechatInfo.id, item.openid, {
                    title: item.music.title,
                    desc: item.music.desc,
                    playUrl: item.music.playUrl,
                    playHqUrl: item.music.playHqUrl || item.music.playUrl,
                    mediaId: item.music.mediaId
                }).then(sendRes => {
                    console.log(sendRes);
                });
            }
        }
        return that.json(httpRes.suc())
    }

    /*
    * 发送客服消息 => 图文
    * @post
    *   list：批量列表
    *       openid：微信openid
    *       new: 图文相关信息
    *           title：图文标题
    *           desc：图文摘要
    *           url：图文跳转链接
    *           imgUrl：图文封面链接
    * @return
    *   null
    * */
    async custom_send_ArticleAction() {
        let that = this;
        let {list} = that.post();
        if (think.isEmpty(list)) return that.json(httpRes.errArgumentMiss);
        for (let item of list) {
            if (item.openid && think.isObject(item.new)) {
                customSendArticle(that.wechatInfo.id, item.openid, {
                    title: item.new.title,
                    desc: item.new.desc,
                    url: item.new.url,
                    imgUrl: item.new.imgUrl
                }).then(sendRes => {
                    console.log(sendRes);
                });
            }
        }
        return that.json(httpRes.suc())
    }

    /*
   * 获取模版列表
   * @return
   *    [{
   *        template_id:'',
   *        title:'',
   *        primary_industry:'',
   *        deputy_industry:'',
   *        content:'',
   *        example:''
   *    }]
   * */
    async get_private_template_allAction() {
        let that = this;
        let res = await getPrivateTemplateAll(that.wechatInfo.id);
        return that.json(res);
    }

    /*
    * 发送模版消息
    * @post
    *   list：批量列表
    *       openid：微信openid
    *       templateId：模版id
    *       url：跳转外链
    *       mini：小程序相关信息
    *           appid：小程序appid
    *           pagepath：小程序页面路径
    *       info：模版填充内容
    *           {}
    * @return
    *   null
    * */
    async templete_sendAction() {
        let that = this;
        let {list} = that.post();
        for (let item of list) {
            if (item.openid && item.templateId && think.isObject(item.data)) {
                templateSend(that.wechatInfo.id, item.openid, item.templateId, item.url, item.mini, item.data)
                    .then(sendRes => {
                        console.log(sendRes);
                    });
            }
        }
        return that.json(httpRes.suc())
    }

    /*
    * 生成参数二维码
    * @post
    *   type：1：临时整型；2：临时字符串；3：永久整型；4：永久字符串（默认2）
    *   second：过期时间（单位秒，默认30天）
    *   content：参数内容
    * @return
    *   {
    *       img_url:'', => 二维码图片地址
    *       ticket:'', => 二维码ticket
    *       expire_second:'', => 过期时间
    *       url:'' => 二维码地址
    *   }
    * */
    async create_params_qrAction() {
        let that = this;
        let {content, type = 2, second = 2592000} = that.post();
        if (think.isEmpty(content)) return that.json(httpRes.errArgumentMiss);
        let res = await createParamsQr(that.wechatInfo.id, content, type, second);
        return that.json(res);
    }

    /*
    * 生成短链接
    * @post
    *   url：需要转换的长链接
    * @return
    *   {
    *       errcode:0,
    *       errmsg:0,
    *       short_url:'' => 短链接
    *   }
    * */
    async creat_short_urlAction() {
        let that = this;
        let {url} = that.post();
        if (think.isEmpty(url)) return that.json(httpRes.errArgumentMiss);
        let res = await createShortUrl(that.wechatInfo.id, url);
        return that.json(res);
    }

    // 前置函数
    async __before() {
        let that = this;
        let {id} = that.get();
        let {data: wechatInfo} = await getConfigById(id);
        if (think.isEmpty(wechatInfo)) return that.json(httpRes.errSysBusy)
        that.wechatInfo = wechatInfo;
    }

    // 如果没找到默认回复
    __call() {
        let that = this;
        that.json(httpRes.errSysBusy)
    }
}