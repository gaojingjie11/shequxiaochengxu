Page({
    data: {
        menuList: [
            { name: '公告通知', icon: '📢', desc: '查看社区最新公告', url: '/pages/service/notice' },
            { name: '报修投诉', icon: '🔧', desc: '提交报修和投诉', url: '/pages/service/repair' },
            { name: '访客登记', icon: '👥', desc: '登记访客信息', url: '/pages/service/visitor' },
            { name: '车位管理', icon: '🅿️', desc: '查看和绑定车位', url: '/pages/service/parking' },
            { name: '物业费', icon: '💰', desc: '查看和缴纳物业费', url: '/pages/service/property' },
            { name: '购物车', icon: '🛒', desc: '查看购物车并结算', url: '/pages/mall/cart' }
        ]
    },

    onLoad(options) {

    },

    handleTap(e) {
        const item = this.data.menuList.find(i => i.url === e.currentTarget.dataset.url);
        if (item && item.isTab) {
            wx.switchTab({ url: item.url });
        } else {
            wx.navigateTo({ url: item.url });
        }
    }
});
