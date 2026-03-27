const { getFavoriteList, removeFavorite } = require('../../api/product');

Page({
    data: {
        products: [],
        loading: false
    },

    onShow() {
        this.getFavorites();
    },

    async getFavorites() {
        this.setData({ loading: true });
        try {
            const res = await getFavoriteList();

            // Backend returns { list: [...], total: ... }
            let rawList = [];
            if (Array.isArray(res)) {
                rawList = res;
            } else if (res && (res.list || Array.isArray(res.list))) {
                rawList = res.list || [];
            }

            // Filter out items where product is null (deleted) and map to product info
            const list = rawList
                .filter(item => item && item.product)
                .map(item => {
                    // Merge favorite ID if needed, or just use product
                    // Using item.product as base
                    return {
                        ...item.product,
                        // keep favorite id if needed for removal? 
                        // The removal API uses product_id based on api/product.js: toggleFavorite(id)
                        // So item.product.id is correct.
                        favorite_key: item.id
                    };
                });

            this.setData({ products: list });
        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ loading: false });
        }
    },

    async removeFavorite(e) {
        const id = e.currentTarget.dataset.id;
        const index = e.currentTarget.dataset.index;

        wx.showModal({
            title: '提示',
            content: '确定取消收藏吗？',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await removeFavorite(id);
                        const newProducts = [...this.data.products];
                        newProducts.splice(index, 1);
                        this.setData({ products: newProducts });
                        wx.showToast({ title: '已取消' });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        });
    },

    goToDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: `/pages/mall/detail?id=${id}` });
    }
});
