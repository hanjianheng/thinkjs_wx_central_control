// 微信公众号服务端对接

import {getConfigById} from "../api/wechat";

module.exports = class extends think.Controller {

    /*
    * 文字消息
    * 接收微信服务器推送的文字内容
    * */
    async textAction() {
        let that = this;
        let {signature, timestamp, nonce, openid} = that.get();
        let {ToUserName, FromUserName, CreateTime, MsgType, Content, MsgId} = that.post();
        return that.success('')
    }

    /*
    * 事件消息
    * 接收微信服务器推送的事件内容
    * */
    async eventAction() {
        let that = this;
        let {signature, timestamp, nonce, openid} = that.get();
        let {ToUserName, FromUserName, CreateTime, MsgType, Event, EventKey, Ticket, Latitude, Longitude, Precision} = that.post();
        switch (Event) {
            case 'subscribe':// 关注
                console.log('用户关注了');
                break;
            case 'unsubscribe':// 取消关注
                console.log('用户取消关注了');
                break;
            case 'SCAN':// 已关注扫码
                break;
            case 'LOCATION':// 地理位置
                break;
            case 'CLICK':// 自定义菜菜单
                break;
            case 'VIEW':// 跳转
                break;
            case 'TEMPLATESENDJOBFINISH':// 模版消息发送完毕
                break;
        }
        return that.success('')
    }

    /*
    * 图片消息
    * 接收微信服务器推送的图片内容
    * */
    async imageAction() {
        let that = this;
        let {signature, timestamp, nonce, openid} = that.get();
        let {ToUserName, FromUserName, CreateTime, MsgType, PicUrl, MsgId, MediaId} = that.post();
        return that.success('')
    }

    /*
    * 语音消息
    * 接收微信服务器推送的语音内容
    * */
    async voiceAction() {
        let that = this;
        let {signature, timestamp, nonce, openid} = that.get();
        let {ToUserName, FromUserName, CreateTime, MsgType, Recognition, MsgId, MediaId, Format} = that.post();
        return that.success('')
    }

    // 前置函数
    async __before() {
        let that = this;
        let {id} = that.get();
        that.wechatInfo = await getConfigById(id);
        if (think.isEmpty(that.wechatInfo)) return that.success('')
    }

    // 如果没找到默认回复
    __call() {
        this.success('')
    }
};
