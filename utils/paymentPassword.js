function confirmAction(title, content) {
    return new Promise((resolve) => {
        wx.showModal({
            title,
            content,
            success: (res) => resolve(!!res.confirm),
            fail: () => resolve(false)
        });
    });
}

function promptPaymentPassword(options = {}) {
    const title = options.title || '安全支付验证';
    const placeholder = options.placeholder || '请输入登录密码';

    return new Promise((resolve) => {
        wx.showModal({
            title,
            editable: true,
            placeholderText: placeholder,
            success: (res) => {
                if (!res.confirm) {
                    resolve('');
                    return;
                }
                resolve((res.content || '').trim());
            },
            fail: () => resolve('')
        });
    });
}

module.exports = {
    confirmAction,
    promptPaymentPassword
};
