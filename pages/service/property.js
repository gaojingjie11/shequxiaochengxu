const { getPropertyFeeList, payPropertyFee } = require('../../api/service');
const { formatTime } = require('../../utils/util');

Page({
    data: {
        activeTab: 0, // 0: 未缴, 1: 已缴
        list: [],
        page: 1,
        size: 10,
        total: 0,
        loading: false
    },

    onLoad() {
        this.getList(true);
    },

    switchTab(e) {
        const index = Number(e.currentTarget.dataset.index);
        this.setData({ activeTab: index, page: 1, list: [] });
        this.getList(true);
    },

    async getList(reset = false) {
        if (this.data.loading) return;
        this.setData({ loading: true });

        try {
            const res = await getPropertyFeeList({
                page: this.data.page,
                size: this.data.size,
                status: this.data.activeTab // 0 or 1
            });

            let list = res.list || res || [];

            // Client-side filtering as fallback
            // activeTab: 0 (Unpaid, status=0), 1 (Paid, status=1)
            list = list.filter(item => {
                // Assuming item.status matches activeTab convention
                // Adjust strict equality if needed (unpaid might be 0, paid 1)
                return Number(item.status) === Number(this.data.activeTab);
            });

            // Format dates
            list = list.map(item => {
                const date = new Date(item.pay_time);
                const isValid = !isNaN(date.getTime()) && date.getFullYear() > 2000;
                // For property fee payment date, usually just YYYY-MM-DD is enough
                const formattedDate = isValid ? formatTime(date).split(' ')[0].replace(/\//g, '-') : '';
                return {
                    ...item,
                    pay_time: formattedDate
                };
            });

            if (reset) {
                this.setData({ list: list, total: res.total || 0 });
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
        wx.showModal({
            title: '确认支付',
            content: '确定缴纳此笔物业费吗？',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await payPropertyFee({ related_id: id });
                        wx.showToast({ title: '支付成功', icon: 'success' });
                        // Refresh list
                        this.getList(true);
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        });
    }
});
