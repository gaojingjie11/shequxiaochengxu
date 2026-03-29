const request = require('../utils/request');

module.exports = {
    // 添加到购物车
    addToCart(data) {
        return request({
            url: '/cart/add',
            method: 'POST',
            data
        });
    },

    // 获取购物车列表
    getCartList() {
        return request({
            url: '/cart/list',
            method: 'GET'
        });
    },

    // 删除购物车项
    deleteCartItem(id) {
        return request({
            url: `/cart/${id}`,
            method: 'DELETE'
        });
    },

    // 修改购物车数量
    updateCartQuantity(id, quantity) {
        return request({
            url: `/cart/${id}`,
            method: 'POST',
            data: { quantity }
        });
    },

    // 创建订单
    createOrder(data) {
        return request({
            url: '/order/create',
            method: 'POST',
            data
        });
    },

    // 获取订单列表
    getOrderList(params) {
        return request({
            url: '/order/list',
            method: 'GET',
            data: params // wx.request uses 'data' for query params in GET
        });
    },

    // 支付订单
    payOrder(data) {
        const businessId = data.business_id || data.order_id || data.id;
        return request({
            url: '/finance/pay',
            method: 'POST',
            data: {
                business_id: businessId,
                business_type: data.business_type || 1,
                pay_type: data.pay_type || 'password',
                password: data.password || '',
                face_image_url: data.face_image_url || ''
            }
        });
    },

    // 取消订单
    cancelOrder(orderId) {
        return request({
            url: '/order/cancel',
            method: 'POST',
            data: { id: orderId }
        });
    },

    // 确认收货
    receiveOrder(id) {
        return request({
            url: '/order/receive',
            method: 'POST',
            data: { id }
        });
    },

    // 获取订单详情
    getOrderDetail(id) {
        return request({
            url: '/order/detail',
            method: 'GET',
            data: { id }
        });
    }
};
