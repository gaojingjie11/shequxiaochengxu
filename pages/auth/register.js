const { register } = require('../../api/auth');

Page({
    data: {
        mobile: '',
        real_name: '',
        password: '',
        loading: false
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({ [field]: e.detail.value });
    },

    async handleRegister() {
        const { mobile, real_name, password } = this.data;

        if (!mobile || !real_name || !password) {
            wx.showToast({ title: '请填写完整信息', icon: 'none' });
            return;
        }

        if (password.length < 6) {
            wx.showToast({ title: '密码至少6位', icon: 'none' });
            return;
        }

        // Auto generate username as per frontend logic
        const username = 'user_' + mobile.slice(-6);

        this.setData({ loading: true });
        try {
            await register({
                mobile,
                real_name,
                password,
                username,
                age: 0,
                gender: 0
            });

            wx.showToast({ title: '注册成功', icon: 'success' });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);

        } catch (err) {
            console.error(err);
            // request.js handles error toast usually, but if we need specific handling:
            // wx.showToast({ title: '注册失败', icon: 'none' });
        } finally {
            this.setData({ loading: false });
        }
    },

    goToLogin() {
        wx.navigateBack();
    }
});
