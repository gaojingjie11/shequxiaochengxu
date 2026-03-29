const { getUserInfo, registerFace } = require('../../api/user');

Page({
    data: {
        userInfo: null,
        registering: false
    },

    onShow() {
        this.fetchUserInfo();
    },

    async fetchUserInfo() {
        const token = wx.getStorageSync('token');
        if (!token) {
            wx.reLaunch({ url: '/pages/auth/login' });
            return;
        }

        try {
            const user = await getUserInfo();
            this.setData({ userInfo: user || null });
        } catch (e) {
            wx.showToast({ title: '获取用户信息失败', icon: 'none' });
        }
    },

    chooseFaceImageFromCamera() {
        return new Promise((resolve, reject) => {
            if (typeof wx.chooseMedia === 'function') {
                wx.chooseMedia({
                    count: 1,
                    mediaType: ['image'],
                    sourceType: ['camera'],
                    success: (res) => {
                        const filePath = res?.tempFiles?.[0]?.tempFilePath || '';
                        if (!filePath) {
                            reject(new Error('未获取到照片'));
                            return;
                        }
                        resolve(filePath);
                    },
                    fail: reject
                });
                return;
            }

            wx.chooseImage({
                count: 1,
                sourceType: ['camera'],
                success: (res) => {
                    const filePath = res?.tempFilePaths?.[0] || '';
                    if (!filePath) {
                        reject(new Error('未获取到照片'));
                        return;
                    }
                    resolve(filePath);
                },
                fail: reject
            });
        });
    },

    async handleRegisterFace() {
        if (this.data.registering) return;

        this.setData({ registering: true });
        wx.showLoading({ title: '处理中', mask: true });
        try {
            const filePath = await this.chooseFaceImageFromCamera();
            await registerFace(filePath);
            wx.showToast({ title: '人脸录入成功', icon: 'success' });
            await this.fetchUserInfo();
        } catch (e) {
            wx.showToast({
                title: e?.message || '人脸录入失败',
                icon: 'none'
            });
        } finally {
            wx.hideLoading();
            this.setData({ registering: false });
        }
    }
});
