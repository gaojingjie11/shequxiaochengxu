const { createRepair, getRepairList } = require('../../api/service');

Page({
    data: {
        types: ['请选择', '报修', '投诉'],
        typeIndex: 1,
        category: '',
        content: '',
        submitting: false,
        repairs: [],
        page: 1,
        size: 10,
        total: 0,
        statusMap: { 0: '待处理', 1: '处理中', 2: '已完成' }
    },

    onLoad() {
        this.getRepairList();
    },

    bindTypeChange(e) {
        this.setData({ typeIndex: e.detail.value });
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({ [field]: e.detail.value });
    },

    async submitRepair() {
        const { typeIndex, category, content } = this.data;
        if (typeIndex == 0) {
            wx.showToast({ title: '请选择类型', icon: 'none' });
            return;
        }
        if (!category || !content) {
            wx.showToast({ title: '请填写完整', icon: 'none' });
            return;
        }

        this.setData({ submitting: true });
        try {
            await createRepair({
                type: Number(typeIndex),
                category,
                content
            });

            wx.showToast({ title: '提交成功' });
            this.setData({ category: '', content: '' });
            this.getRepairList(true); // Reset list

        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ submitting: false });
        }
    },

    async getRepairList(reset = false) {
        try {
            const res = await getRepairList({ page: 1, size: 20 });
            // Assuming res.list
            const list = res.list || [];
            this.setData({ repairs: list });
        } catch (e) {
            console.error(e);
        }
    }
});
