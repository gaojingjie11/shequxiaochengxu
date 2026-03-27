const { getOrderList, payOrder, cancelOrder, receiveOrder } = require('../../api/order');

Page({
    data: {
        tabs: [
            { name: '全部', status: 'all' },
            { name: '待支付', status: 0 },
            { name: '未发货', status: 1 },
            { name: '已发货', status: 2 },
            { name: '已完成', status: 3 }
        ],
        currentTabStatus: 'all',
        orders: [],
        page: 1,
        size: 10,
        total: 0,
        loading: false,
        statusMap: { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 40: '已取消' }
    },

    onShow() {
        this.setData({ page: 1 });
        this.getOrders(true);
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

            const list = res.list || res || [];
            const total = res.total || (Array.isArray(res) ? res.length : 0);

            if (reset) {
                this.setData({ orders: list, total: total });
            } else {
                this.setData({ orders: [...this.data.orders, ...list], total: total });
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ loading: false });
        }
    },

    async payOrder(e) {
        const id = e.currentTarget.dataset.id;
        try {
            await payOrder({ order_id: id });
            wx.showToast({ title: '支付成功' });
            this.setData({ page: 1 });
            this.getOrders(true);
        } catch (e) {
            // error handling
        }
    },

    async cancelOrder(e) {
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '提示',
            content: '确定取消订单吗？',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await cancelOrder(id);
                        wx.showToast({ title: '已取消' });
                        this.setData({ page: 1 });
                        this.getOrders(true);
                    } catch (err) { }
                }
            }
        });
    },

    async confirmReceipt(e) {
        const id = e.currentTarget.dataset.id;
        try {
            await receiveOrder(id);
            wx.showToast({ title: '已确认收货' });
            this.setData({ page: 1 });
            this.getOrders(true);
        } catch (err) { }
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: `/pages/order/detail?id=${id}` });
    }
});
