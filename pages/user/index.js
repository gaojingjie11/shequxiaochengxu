const { getUserInfo } = require('../../api/user');
// Note: We might want strictly user module, but logout is in auth.
// Let's import logout from auth if needed, but user page usually just needs user info and local clear.
// Actually logout API call is good practice.
const { logout } = require('../../api/auth');

Page({
    data: {
        userInfo: null,
        roleMap: { 'admin': '管理员', 'store': '商户', 'property': '物业', 'user': '居民' }
    },

    onShow() {
        this.getUserInfo();
    },

    async getUserInfo() {
        const token = wx.getStorageSync('token');
        if (!token) return;

        try {
            const res = await getUserInfo();
            this.setData({ userInfo: res });
        } catch (e) {
            console.error(e);
        }
    },

    handleLogout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await logout();
                    } catch (e) { }
                    wx.removeStorageSync('token');
                    this.setData({ userInfo: null });
                    wx.reLaunch({ url: '/pages/auth/login' });
                }
            }
        });
    },

    goToLogin() {
        wx.navigateTo({ url: '/pages/auth/login' });
    }
});
