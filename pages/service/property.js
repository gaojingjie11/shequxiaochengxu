const { getPropertyFeeList, payPropertyFee } = require('../../api/service');
const { getUserInfo } = require('../../api/user');
const { formatTime } = require('../../utils/util');
const { confirmAction, promptPaymentAuth } = require('../../utils/paymentPassword');
const { GREEN_POINTS_PER_YUAN, getMixedPaymentPreview } = require('../../utils/payment');

function formatAmount(value) {
    return Number(value || 0).toFixed(2);
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function createPayWaitMs() {
    return 3000 + Math.floor(Math.random() * 2001);
}

Page({
    data: {
        activeTab: 0,
        list: [],
        page: 1,
        size: 10,
        total: 0,
        loading: false,
        userInfo: null,
        userBalanceText: '0.00',
        greenPointsPerYuan: GREEN_POINTS_PER_YUAN
    },

    async onLoad() {
        await this.initPage();
    },

    async onShow() {
        await this.refreshUserInfo();
    },

    async initPage() {
        await this.refreshUserInfo();
        await this.getList(true);
    },

    switchTab(e) {
        const index = Number(e.currentTarget.dataset.index);
        this.setData({ activeTab: index, page: 1, list: [] });
        this.getList(true);
    },

    async refreshUserInfo() {
        try {
            const user = await getUserInfo();
            this.setData({
                userInfo: user || null,
                userBalanceText: formatAmount((user && user.balance) || 0)
            });
        } catch (e) {
            console.error(e);
        }
    },

    buildFeeViewModel(list) {
        const currentPoints = Number((this.data.userInfo && this.data.userInfo.green_points) || 0);
        return (list || []).map((item) => {
            const date = new Date(item.pay_time);
            const isValid = !Number.isNaN(date.getTime()) && date.getFullYear() > 2000;
            const payTimeText = isValid ? formatTime(date).split(' ')[0].replace(/\//g, '-') : '';
            const preview = getMixedPaymentPreview(item.amount, currentPoints);
            return {
                ...item,
                amount_text: formatAmount(item.amount),
                pay_time: payTimeText,
                used_balance_text: formatAmount(item.used_balance || 0),
                payment_preview: {
                    points: preview.points,
                    balance: preview.balance,
                    balance_text: formatAmount(preview.balance)
                }
            };
        });
    },

    async getList(reset = false) {
        if (this.data.loading) return;
        this.setData({ loading: true });

        try {
            const res = await getPropertyFeeList({
                page: this.data.page,
                size: this.data.size,
                status: this.data.activeTab
            });

            let list = res.list || res || [];
            list = list.filter((item) => Number(item.status) === Number(this.data.activeTab));
            list = this.buildFeeViewModel(list);

            if (reset) {
                this.setData({ list, total: res.total || 0 });
            } else {
                this.setData({ list: [...this.data.list, ...list], total: res.total || 0 });
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ loading: false });
        }
    },

    onReachBottom() {
        if (this.data.list.length < this.data.total) {
            this.setData({ page: this.data.page + 1 });
            this.getList();
        }
    },

    async handlePay(e) {
        const id = e.currentTarget.dataset.id;
        const fee = this.data.list.find((item) => item.id === id);
        if (!fee) return;

        const preview = fee.payment_preview || getMixedPaymentPreview(fee.amount, 0);
        const confirmed = await confirmAction(
            '混合支付确认',
            `本次将优先抵扣 ${preview.points} 积分，余额支付 ￥${formatAmount(preview.balance)}，确认缴费吗？`
        );
        if (!confirmed) return;

        const authPayload = await promptPaymentAuth({
            title: '\u7269\u4e1a\u8d39\u652f\u4ed8\u9a8c\u8bc1',
            passwordPlaceholder: '\u8bf7\u8f93\u5165\u767b\u5f55\u5bc6\u7801',
            faceRegistered: !!(this.data.userInfo && this.data.userInfo.face_registered)
        });

        if (!authPayload) {
            return;
        }

        wx.showLoading({ title: '正在支付...', mask: true });
        try {
            const [result] = await Promise.all([
                payPropertyFee({
                    related_id: id,
                    business_type: 2,
                    ...authPayload
                }),
                wait(createPayWaitMs())
            ]);
            const paymentResult = result && result.payment_result ? result.payment_result : result;
            wx.showToast({
                title: `支付成功 积分${Number(paymentResult.used_points || 0)} 余额￥${formatAmount(paymentResult.used_balance || 0)}`,
                icon: 'none'
            });
            await this.refreshUserInfo();
            await this.getList(true);
        } catch (err) {
            // 错误提示由 request.js 统一处理
        } finally {
            wx.hideLoading();
        }
    }
});
