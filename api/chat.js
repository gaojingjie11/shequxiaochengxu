const request = require('../utils/request');

module.exports = {
    sendChat(data) {
        return request({
            url: '/chat/send',
            method: 'POST',
            data,
            timeout: 60000
        });
    },

    getChatHistory(params) {
        return request({
            url: '/chat/history',
            method: 'GET',
            data: params
        });
    }
};
