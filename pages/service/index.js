Page({
    data: {
        menuList: [
            { name: '公告通知', icon: '📙', desc: '查看社区最新公告', url: '/pages/service/notice' },
            { name: '报修投诉', icon: '🔧', desc: '提交报修与投诉', url: '/pages/service/repair' },
            { name: '访客登记', icon: '👥', desc: '登记访客信息', url: '/pages/service/visitor' },
            { name: '车位管理', icon: '🅿️', desc: '查看和绑定车位', url: '/pages/service/parking' },
            { name: '物业费缴纳', icon: '💳', desc: '物业费在线支付', url: '/pages/service/property' },
            { name: '绿色积分', icon: '🏆', desc: '上传照片得积分与排行', url: '/pages/service/green-points' },
            { name: '\u793e\u533a\u7fa4\u804a', icon: '\uD83D\uDCAC', desc: '\u548c\u90bb\u5c45\u5b9e\u65f6\u4ea4\u6d41\u6d88\u606f', url: '/pages/service/community-chat' },
            { name: 'AI 对话', icon: '🤖', desc: '智能问答与服务办理', url: '/pages/chat/index' },
            { name: '购物车', icon: '📦', desc: '查看购物车并结算', url: '/pages/mall/cart' }
        ]
    },

    handleTap(e) {
        const item = this.data.menuList.find((i) => i.url === e.currentTarget.dataset.url);
        if (item && item.isTab) {
            wx.switchTab({ url: item.url });
            return;
        }
        wx.navigateTo({ url: e.currentTarget.dataset.url });
    }
});
