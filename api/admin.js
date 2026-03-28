const request = require('../utils/request');

module.exports = {
    getAIReportList(params) {
        return request({
            url: '/admin/ai-report/list',
            method: 'GET',
            data: params
        });
    },

    generateAIReport() {
        return request({
            url: '/admin/ai-report/generate',
            method: 'POST',
            timeout: 120000
        });
    },

    getAIReportDetail(id) {
        return request({
            url: `/admin/ai-report/${id}`,
            method: 'GET'
        });
    }
};
