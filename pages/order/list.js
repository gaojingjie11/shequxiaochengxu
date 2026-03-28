const { getOrderList, payOrder, cancelOrder, receiveOrder } = require('../../api/order');
const { getUserInfo } = require('../../api/user');
const { confirmAction, promptPaymentPassword } = require('../../utils/paymentPassword');
const { GREEN_POINTS_PER_YUAN, getMixedPaymentPreview } = require('../../utils/payment');

function formatAmount(value) {
    return Number(value || 0).toFixed(2);
}

Page({
    data: {
        tabs: [
            { name: '全部', status: 'all' },
            { name: '待支付', status: 0 },
            { name: '已支付', status: 1 },
            { name: '已发货', status: 2 },
            { name: '已完成', status: 3 }
        ],
        currentTabStatus: 'all',
        orders: [],
        page: 1,
        size: 10,
        total: 0,
        loading: false,
        userInfo: null,
        userBalanceText: '0.00',
        greenPointsPerYuan: GREEN_POINTS_PER_YUAN,
        statusMap: { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 40: '已取消' }
    },

    async onShow() {
        this.setData({ page: 1 });
        await this.initPage();
    },

    async initPage() {
        await this.refreshUserInfo();
        await this.getOrders(true);
    },

    onReachBottom() {
        if (this.data.orders.length < this.data.total) {
            this.setData({ page: this.data.page + 1 });
            this.getOrders();
        }
    },

    switchTab(e) {
        const status = e.currentTarget.dataset.status;
        if (status === this.data.currentTabStatus) return;
        this.setData({ currentTabStatus: status, page: 1 });
        this.getOrders(true);
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

    buildOrderViewModel(list) {
        const currentPoints = Number((this.data.userInfo && this.data.userInfo.green_points) || 0);
        return (list || []).map((order) => {
            const preview = getMixedPaymentPreview(order.total_amount, currentPoints);
            return {
                ...order,
                total_amount_text: formatAmount(order.total_amount),
                used_balance_text: formatAmount(order.used_balance || 0),
                payment_preview: {
                    points: preview.points,
                    balance: preview.balance,
                    balance_text: formatAmount(preview.balance)
                }
            };
        });
    },

    async getOrders(reset = false) {
        if (this.data.loading) return;
        this.setData({ loading: true });

        try {
            const { currentTabStatus, page, size } = this.data;
            const params = { page, size };
            if (currentTabStatus !== 'all') {
                params.status = Number(currentTabStatus);
            }

            const res = await getOrderList(params);
            const list = this.buildOrderViewModel(res.list || res || []);
            const total = res.total || (Array.isArray(res) ? res.length : 0);

            if (reset) {
                this.setData({ orders: list, total });
            } else {
                this.setData({ orders: [...this.data.orders, ...list], total });
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ loading: false });
        }
    },

    async payOrder(e) {
        const id = e.currentTarget.dataset.id;
        const order = this.data.orders.find((item) => item.id === id);
        if (!order) return;

        const preview = order.payment_preview || getMixedPaymentPreview(order.total_amount, 0);
        const confirmed = await confirmAction(
            '订单支付确认',
            `本次将优先抵扣 ${preview.points} 积分，余额支付 ￥${formatAmount(preview.balance)}，确认继续吗？`
        );
        if (!confirmed) return;

        const password = await promptPaymentPassword({
            title: '订单支付',
            placeholder: '请输入登录密码'
        });

        if (!password) {
            wx.showToast({ title: '已取消支付', icon: 'none' });
            return;
        }

        try {
            const result = await payOrder({ order_id: id, password });
            wx.showToast({
                title: `支付成功 积分${Number(result.used_points || 0)} 余额￥${formatAmount(result.used_balance || 0)}`,
                icon: 'none'
            });
            this.setData({ page: 1 });
            await this.refreshUserInfo();
            await this.getOrders(true);
        } catch (err) {
            // 错误提示由 request.js 统一处理
        }
    },

    async cancelOrder(e) {
        const id = e.currentTarget.dataset.id;
        const confirmed = await confirmAction('提示', '确定取消订单吗？');
        if (!confirmed) return;

        try {
            await cancelOrder(id);
            wx.showToast({ title: '已取消', icon: 'success' });
            this.setData({ page: 1 });
            this.getOrders(true);
        } catch (err) {
            console.error(err);
        }
    },

    async confirmReceipt(e) {
        const id = e.currentTarget.dataset.id;
        try {
            await receiveOrder(id);
            wx.showToast({ title: '已确认收货', icon: 'success' });
            this.setData({ page: 1 });
            this.getOrders(true);
        } catch (err) {
            console.error(err);
        }
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: `/pages/order/detail?id=${id}` });
    }
});
