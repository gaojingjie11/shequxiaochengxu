const { getUserInfo } = require('../../api/user');
const { logout } = require('../../api/auth');

Page({
    data: {
        userInfo: null,
        showAIReportEntry: false,
        roleMap: {
            admin: '管理员',
            store: '商户',
            property: '物业',
            user: '居民'
        }
    },

    onShow() {
        this.fetchUserInfo();
    },

    async fetchUserInfo() {
        const token = wx.getStorageSync('token');
        if (!token) return;

        try {
            const res = await getUserInfo();
            const role = (res && res.role) || '';
            this.setData({
                userInfo: res || null,
                showAIReportEntry: role === 'admin' || role === 'property'
            });
        } catch (e) {
            console.error(e);
        }
    },

    handleLogout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: async (res) => {
                if (!res.confirm) return;
                try {
                    await logout();
                } catch (e) {
                    // ignore
                }

                wx.removeStorageSync('token');
                this.setData({
                    userInfo: null,
                    showAIReportEntry: false
                });
                wx.reLaunch({ url: '/pages/auth/login' });
            }
        });
    },

    goToLogin() {
        wx.navigateTo({ url: '/pages/auth/login' });
    }
});