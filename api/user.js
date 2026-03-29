const request = require('../utils/request');

function registerFace(filePath) {
    return new Promise((resolve, reject) => {
        const token = wx.getStorageSync('token');
        const header = {};
        if (token) {
            header.Authorization = `Bearer ${token}`;
        }

        wx.uploadFile({
            url: `${request.BASE_URL}/user/face/register`,
            filePath,
            name: 'file',
            header,
            success: (res) => {
                let data = {};
                try {
                    data = JSON.parse(res.data || '{}');
                } catch (e) {
                    reject(new Error('人脸录入响应解析失败'));
                    return;
                }

                if (res.statusCode >= 200 && res.statusCode < 300 && data.code === 200) {
                    resolve(data.data);
                    return;
                }

                if (data.code === 401 || res.statusCode === 401) {
                    wx.removeStorageSync('token');
                    wx.redirectTo({ url: '/pages/auth/login' });
                }
                reject(new Error(data.msg || '人脸录入失败'));
            },
            fail: (err) => reject(err || new Error('人脸录入失败'))
        });
    });
}

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
    },

    registerFace
};
