const { getOrderDetail } = require('../../api/order');

Page({
    data: {
        order: null,
        statusMap: { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 40: '已取消' }
    },

    onLoad(options) {
        if (options.id) {
            this.getDetail(options.id);
        }
    },

    async getDetail(id) {
        try {
            const res = await getOrderDetail(id);
            this.setData({ order: res });
        } catch (e) {
            console.error(e);
        }
    }
});
