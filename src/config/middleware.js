const path = require('path');
const wechat = require('think-wechat');
const isDev = think.env === 'development';
import {WECHAT_DEVELOPER_ROUTE, WECHAT_DEVELOPER_TOKEN} from "../lib/config";

module.exports = [
    {
        handle: 'meta',
        options: {
            logRequest: isDev,
            sendResponseTime: isDev
        }
    },
    {
        handle: 'resource',
        enable: isDev,
        options: {
            root: path.join(think.ROOT_PATH, 'www'),
            publicPath: /^\/(static|favicon\.ico)/
        }
    },
    {
        handle: 'trace',
        enable: !think.isCli,
        options: {
            debug: isDev
        }
    },
    {
        handle: wechat,
        match: WECHAT_DEVELOPER_ROUTE,
        options: {
            token: WECHAT_DEVELOPER_TOKEN,
            checkSignature: true
        }
    },
    {
        handle: 'payload',
        options: {
            keepExtensions: true,
            limit: '5mb'
        }
    },
    {
        handle: 'router',
        options: {}
    },
    'logic',
    'controller'
];
