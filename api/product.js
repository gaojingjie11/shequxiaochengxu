const request = require('../utils/request');

module.exports = {
    // 获取商品列表
    getProductList(params) {
        return request({
            url: '/products',
            method: 'GET',
            data: params
        });
    },

    // 获取商品详情
    getProductDetail(id) {
        return request({
            url: `/product/${id}`,
            method: 'GET'
        });
    },

    // 添加收藏
    addFavorite(productId) {
        return request({
            url: '/favorite/add',
            method: 'POST',
            data: { product_id: productId }
        });
    },

    // 取消收藏
    removeFavorite(productId) {
        return request({
            url: '/favorite/delete',
            method: 'POST',
            data: { product_id: productId }
        });
    },

    // 获取收藏列表
    getFavoriteList() {
        return request({
            url: '/favorites',
            method: 'GET'
        });
    },

    // 检查是否收藏
    checkFavorite(productId) {
        return request({
            url: '/favorite/check',
            method: 'GET',
            data: { product_id: productId }
        });
    },

    // 获取分类列表
    getCategories() {
        return request({
            url: '/categories',
            method: 'GET'
        });
    }
};
