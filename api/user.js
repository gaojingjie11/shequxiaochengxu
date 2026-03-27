const request = require('../utils/request');

module.exports = {
    getUserInfo() {
        return request({
            url: '/user/info',
            method: 'GET'
        });
    },

    updateUserInfo(data) {
        return request({
            url: '/user/update',
            method: 'POST',
            data
        });
    },

    changePassword(data) {
        return request({
            url: '/user/change_password',
            method: 'POST',
            data
        });
    }
};
