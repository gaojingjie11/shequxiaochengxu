const { getNoticeList } = require('../../api/service');
const { formatTime } = require('../../utils/util');

Page({
    data: {
        notices: [],
        page: 1,
        size: 10,
        total: 0,
        loading: false
    },

    onLoad() {
        this.getNotices(true);
    },

    onPullDownRefresh() {
        this.setData({ page: 1 });
        this.getNotices(true).then(() => {
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom() {
        if (this.data.notices.length < this.data.total) {
            this.setData({ page: this.data.page + 1 });
            this.getNotices();
        }
    },

    async getNotices(reset = false) {
        if (this.data.loading) return;
        this.setData({ loading: true });

        try {
            const res = await getNoticeList({
                page: this.data.page,
                size: this.data.size
            });

            let list = [];
            let total = 0;

            if (Array.isArray(res)) {
                list = res;
                total = res.length;
            } else if (res.list) {
                list = res.list;
                total = res.total;
            }

            // Format time
            list = list.map(item => {
                // Backend might return Go's default time 0001-01-01, check if valid
                const date = new Date(item.created_at);
                const isValid = !isNaN(date.getTime()) && date.getFullYear() > 2000;
                return {
                    ...item,
                    created_at: isValid ? formatTime(date) : ''
                };
            });

            if (reset) {
                this.setData({ notices: list, total: total || list.length });
            } else {
                this.setData({ notices: [...this.data.notices, ...list], total: total || (this.data.notices.length + list.length) });
            }

        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ loading: false });
        }
    }
});
