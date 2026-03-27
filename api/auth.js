const request = require('../utils/request');

module.exports = {
    // 用户注册
    register(data) {
        return request({
            url: '/register',
            method: 'POST',
            data
        });
    },

    // 用户登录
    login(data) {
        return request({
            url: '/login',
            method: 'POST',
            data
        });
    },

    // 退出登录
    logout() {
        return request({
            url: '/logout',
            method: 'POST'
        });
    },

    // 获取用户信息
    getUserInfo() {
        return request({
            url: '/user/info',
            method: 'GET'
        });
    },

    // 更新用户信息
    updateUserInfo(data) {
        return request({
            url: '/user/update',
            method: 'POST',
            data
        });
    },

    // 修改密码
    changePassword(data) {
        return request({
            url: '/user/change_password',
            method: 'POST',
            data
        });
    },

    // 发送验证码
    sendCode(data) {
        return request({
            url: '/send_code',
            method: 'POST',
            data
        });
    },

    // 验证码登录
    loginCode(data) {
        return request({
            url: '/login_code',
            method: 'POST',
            data
        });
    }
};
