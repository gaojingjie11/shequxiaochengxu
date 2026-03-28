const { uploadGarbageImage, getGreenPointsLeaderboard } = require('../../api/greenPoints');
const { getUserInfo } = require('../../api/user');

Page({
    data: {
        userInfo: null,
        imagePath: '',
        uploading: false,
        leaderboard: [],
        loadingLeaderboard: false,
        recognitionResult: null
    },

    onShow() {
        this.loadPageData();
    },

    async loadPageData() {
        await Promise.all([this.loadUserInfo(), this.loadLeaderboard()]);
    },

    async loadUserInfo() {
        try {
            const res = await getUserInfo();
            this.setData({ userInfo: res || null });
        } catch (e) {
            console.error(e);
        }
    },

    async loadLeaderboard() {
        this.setData({ loadingLeaderboard: true });
        try {
            const res = await getGreenPointsLeaderboard({ limit: 10 });
            this.setData({
                leaderboard: res.list || res || []
            });
        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ loadingLeaderboard: false });
        }
    },

    chooseImage() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const file = (res.tempFiles || [])[0];
                this.setData({
                    imagePath: file ? file.tempFilePath : '',
                    recognitionResult: null
                });
            }
        });
    },

    async submitImage() {
        if (!this.data.imagePath) {
            wx.showToast({ title: '请先选择图片', icon: 'none' });
            return;
        }
        if (this.data.uploading) return;

        this.setData({ uploading: true });
        try {
            const res = await uploadGarbageImage(this.data.imagePath);
            this.setData({ recognitionResult: res || null });
            wx.showToast({
                title: `识别成功 +${(res && res.points) || 0}积分`,
                icon: 'success'
            });
            await Promise.all([this.loadUserInfo(), this.loadLeaderboard()]);
        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ uploading: false });
        }
    }
});
