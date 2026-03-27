const { login, sendCode, loginCode } = require('../../api/auth');

Page({
    data: {
        loginType: 'password', // password | code
        mobile: '',
        password: '',
        code: '',
        loading: false,
        timer: 0,
        btnText: '发送验证码'
    },

    onLoad(options) {

    },

    switchTab(e) {
        const type = e.currentTarget.dataset.type;
        this.setData({ loginType: type });
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({ [field]: e.detail.value });
    },

    async handleLogin() {
        if (this.data.loginType === 'password') {
            if (!this.data.mobile || !this.data.password) {
                wx.showToast({ title: '请填写完整', icon: 'none' });
                return;
            }
            this.doLogin({
                mobile: this.data.mobile,
                password: this.data.password,
                is_code: false
            });
        } else {
            if (!this.data.mobile || !this.data.code) {
                wx.showToast({ title: '请填写完整', icon: 'none' });
                return;
            }
            this.doLogin({
                mobile: this.data.mobile,
                code: this.data.code,
                is_code: true
            });
        }
    },

    async doLogin(data) {
        this.setData({ loading: true });
        try {
            let res;
            if (data.is_code) {
                res = await loginCode({
                    mobile: data.mobile,
                    code: data.code
                });
            } else {
                res = await login({
                    mobile: data.mobile,
                    password: data.password
                });
            }

            // Check response structure.
            if (res.token || (res.data && res.data.token)) {
                wx.setStorageSync('token', res.token || res.data.token);
                wx.showToast({ title: '登录成功', icon: 'success' });
                setTimeout(() => {
                    wx.switchTab({ url: '/pages/home/index' });
                }, 1500);
            } else {
                wx.showToast({ title: '登录失败: 无Token', icon: 'none' });
            }

        } catch (err) {
            console.error(err);
        } finally {
            this.setData({ loading: false });
        }
    },

    async sendCode() {
        if (this.data.timer > 0) return;
        if (!this.data.mobile || this.data.mobile.length !== 11) {
            wx.showToast({ title: '请输入正确手机号', icon: 'none' });
            return;
        }

        try {
            await sendCode({ mobile: this.data.mobile });
            wx.showToast({ title: '发送成功', icon: 'success' });

            this.setData({ timer: 60 });
            const interval = setInterval(() => {
                if (this.data.timer <= 0) {
                    clearInterval(interval);
                } else {
                    this.setData({ timer: this.data.timer - 1 });
                }
            }, 1000);
        } catch (e) {
            console.error(e);
        }
    },

    goToRegister() {
        wx.navigateTo({
            url: '/pages/auth/register',
        });
    }
});
