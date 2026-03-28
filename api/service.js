const request = require('../utils/request');

module.exports = {
    // 获取公告列表
    getNoticeList(params) {
        return request({
            url: '/notices',
            method: 'GET',
            data: params
        });
    },

    // 获取公告详情
    getNoticeDetail(id) {
        return request({
            url: `/notice/${id}`,
            method: 'GET'
        });
    },

    // 标记公告已读
    readNotice(id) {
        return request({
            url: `/notice/read/${id}`,
            method: 'POST'
        });
    },

    // 创建报修
    createRepair(data) {
        return request({
            url: '/repair/create',
            method: 'POST',
            data
        });
    },

    // 获取报修列表
    getRepairList(params) {
        return request({
            url: '/repair/list',
            method: 'GET',
            data: params
        });
    },

    // 创建访客登记
    createVisitor(data) {
        return request({
            url: '/visitor/create',
            method: 'POST',
            data
        });
    },

    // 获取访客列表
    getVisitorList(params) {
        return request({
            url: '/visitor/list',
            method: 'GET',
            data: params
        });
    },

    // 获取我的车位
    getMyParking() {
        return request({
            url: '/parking/my',
            method: 'GET'
        });
    },

    // 绑定车牌
    bindCar(data) {
        return request({
            url: '/parking/bind',
            method: 'POST',
            data
        });
    },

    // 获取物业费列表
    getPropertyFeeList(params) {
        return request({
            url: '/property/list',
            method: 'GET',
            data: params
        });
    },

    // 缴纳物业费
    payPropertyFee(data) {
        return request({
            url: '/finance/pay',
            method: 'POST',
            data: {
                business_id: data.related_id,
                pay_type: 2,
                password: data.password || ''
            }
        });
    },

    // 获取门店列表
    getStoreList() {
        return request({
            url: '/stores',
            method: 'GET'
        });
    }
};
