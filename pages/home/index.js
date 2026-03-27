const { getNoticeList } = require('../../api/service');
const { formatTime } = require('../../utils/util');

Page({
    data: {
        notices: []
    },

    onShow() {
        this.getNotices();
    },

    async getNotices() {
        try {
            const res = await getNoticeList({
                page: 1,
                size: 5
            });

            // res provides the unwrapped data.
            // If backend returns { list: [...], total: ... }, res is that object.
            // If backend returns array [...], res is that array.
            let list = [];
            if (Array.isArray(res)) {
                list = res;
            } else if (res && res.list) {
                list = res.list;
            }

            // Format dates
            list = list.map(item => {
                const date = new Date(item.created_at);
                const isValid = !isNaN(date.getTime()) && date.getFullYear() > 2000;
                return {
                    ...item,
                    created_at: isValid ? formatTime(date) : ''
                };
            });

            this.setData({ notices: list.slice(0, 5) });

        } catch (err) {
            console.error(err);
        }
    },

    goToNotice(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/service/notice?id=${id}`,
        });
    },

    showTip() {
        wx.showToast({
            title: '请在PC端查看数据大屏',
            icon: 'none'
        });
    }
});
