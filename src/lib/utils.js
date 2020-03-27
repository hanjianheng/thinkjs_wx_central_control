/*
* 工具相关
* */

const sha1 = require('sha1');
export const getTimestamp = () => parseInt(Date.now() / 1000);
export const getNonceStr = () => Math.random().toString(36).substr(2, 15);
export const getSignature = (params) => sha1(Object.keys(params).sort().map(key => `${key.toLowerCase()}=${params[key]}`).join('&'));
export const httpRes = {
    suc: function (data = null) {
        return {code: 0, msg: '请求成功', data: data}
    },
    err: function (msg = '', code = 1) {
        return {code: code, msg: msg, data: null}
    },
    redirectLink: function (link) {
        return {code: 301, msg: '请求跳转', data: link}
    },
    errNoResult: {code: 1, msg: '找不到结果', data: null},
    errArgumentMiss: {code: 1, msg: '提交信息有误', data: null},
    errSysBusy: {code: 1, msg: '系统繁忙', data: null},
    errNoDataHasUpdate: {code: 1, msg: '数据变更失败', data: null}
}