const { getAIReportList, generateAIReport } = require('../../../api/admin');
const { getUserInfo } = require('../../../api/user');

function formatDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

Page({
    data: {
        list: [],
        page: 1,
        size: 10,
        total: 0,
        loading: false,
        generating: false,
        roleAllowed: false
    },

    async onLoad() {
        await this.checkPermission();
        if (!this.data.roleAllowed) return;
        await this.fetchList(true);
    },

    async onPullDownRefresh() {
        if (!this.data.roleAllowed) {
            wx.stopPullDownRefresh();
            return;
        }
        this.setData({ page: 1 });
        await this.fetchList(true);
        wx.stopPullDownRefresh();
    },

    async onReachBottom() {
        if (!this.data.roleAllowed || this.data.loading) return;
        if (this.data.list.length >= this.data.total) return;
        this.setData({ page: this.data.page + 1 });
        await this.fetchList(false);
    },

    async checkPermission() {
        try {
            const user = await getUserInfo();
            const role = (user && user.role) || '';
            const roleAllowed = role === 'admin' || role === 'property';
            this.setData({ roleAllowed });
            if (!roleAllowed) {
                wx.showToast({ title: '无权限访问', icon: 'none' });
                setTimeout(() => wx.navigateBack({ delta: 1 }), 1000);
            }
        } catch (e) {
            console.error(e);
        }
    },

    async fetchList(reset) {
        if (this.data.loading) return;
        this.setData({ loading: true });
        try {
            const res = await getAIReportList({
                page: this.data.page,
                size: this.data.size
            });
            const rawList = res.list || [];
            const mapped = rawList.map((item) => ({
                ...item,
                created_at_text: formatDateTime(item.created_at)
            }));
            if (reset) {
                this.setData({
                    list: mapped,
                    total: Number(res.total || 0)
                });
            } else {
                this.setData({
                    list: [...this.data.list, ...mapped],
                    total: Number(res.total || 0)
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ loading: false });
        }
    },

    async handleGenerate() {
        if (this.data.generating) return;
        this.setData({ generating: true });
        try {
            const res = await generateAIReport();
            wx.showToast({ title: '报表生成成功', icon: 'success' });
            this.setData({ page: 1 });
            await this.fetchList(true);
            if (res && res.id) {
                wx.navigateTo({
                    url: `/pages/admin/ai-report/detail?id=${res.id}`
                });
            }
        } catch (e) {
            const msg = (e && e.errMsg) || '';
            if (/timeout/i.test(msg)) {
                wx.showToast({ title: '生成超时，请稍后刷新', icon: 'none' });
            }
        } finally {
            this.setData({ generating: false });
        }
    },

    async refreshList() {
        this.setData({ page: 1 });
        await this.fetchList(true);
    },

    goDetail(e) {
        const { id } = e.currentTarget.dataset;
        if (!id) return;
        wx.navigateTo({
            url: `/pages/admin/ai-report/detail?id=${id}`
        });
    }
});
