const request = require('../utils/request');

function uploadGarbageImage(filePath) {
    return new Promise((resolve, reject) => {
        const token = wx.getStorageSync('token');
        const header = {};
        if (token) {
            header.Authorization = `Bearer ${token}`;
        }

        wx.uploadFile({
            url: `${request.BASE_URL}/green-points/upload-garbage`,
            filePath,
            name: 'file',
            header,
            success: (res) => {
                let data = null;
                try {
                    data = JSON.parse(res.data || '{}');
                } catch (e) {
                    wx.showToast({ title: '响应解析失败', icon: 'none' });
                    reject(e);
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

                wx.showToast({
                    title: data.msg || '上传失败',
                    icon: 'none'
                });
                reject(data);
            },
            fail: (err) => {
                wx.showToast({ title: '网络错误', icon: 'none' });
                reject(err);
            }
        });
    });
}

function getGreenPointsLeaderboard(params) {
    return request({
        url: '/green-points/leaderboard',
        method: 'GET',
        data: params
    });
}

module.exports = {
    uploadGarbageImage,
    getGreenPointsLeaderboard
};
