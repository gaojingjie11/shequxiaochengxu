const { getChatHistory, sendChat } = require('../../api/chat');
const { promptPaymentPassword } = require('../../utils/paymentPassword');

function nowTime() {
    const date = new Date();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

function buildGreetingMessage() {
    return {
        role: 'assistant',
        content: '您好，我是智享生活助手。您可以让我帮您总结通知、创建报修、搜索商品、下单和支付。',
        time: nowTime()
    };
}

function normalizeChatErrorMessage(err, fallback = '请求失败，请稍后重试') {
    const raw =
        err?.msg ||
        err?.message ||
        err?.error ||
        err?.data?.msg ||
        err?.data?.message ||
        err?.data?.error ||
        '';
    const text = String(raw || '').trim();

    if (!text) return fallback;
    if (/invalid payment password/i.test(text)) return '支付密码错误，请重试';
    if (/payment password is required/i.test(text)) return '请输入支付密码后再试';
    if (/insufficient balance/i.test(text)) return '余额不足，请先充值';
    if (/payment failed:/i.test(text)) return `支付失败：${text.replace(/^payment failed:\s*/i, '')}`;
    if (/payment failed/i.test(text)) return '支付失败，请重试';
    return text;
}

Page({
    data: {
        messages: [buildGreetingMessage()],
        inputContent: '',
        loading: false,
        lastMessageId: 'msg-0'
    },

    onLoad() {
        this.loadHistory();
    },

    async loadHistory() {
        try {
            const res = await getChatHistory({ limit: 100 });
            const list = Array.isArray(res && res.list) ? res.list : [];
            if (list.length === 0) {
                this.setData({ messages: [buildGreetingMessage()] }, this.scrollToBottom);
                return;
            }

            const messages = list.map((item) => ({
                role: item.role || 'assistant',
                content: item.content || '',
                time: this.formatMessageTime(item.created_at)
            }));
            this.setData({ messages }, this.scrollToBottom);
        } catch (e) {
            console.error(e);
            this.setData({ messages: [buildGreetingMessage()] }, this.scrollToBottom);
        }
    },

    formatMessageTime(value) {
        if (!value) return nowTime();
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return nowTime();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    },

    onInput(e) {
        this.setData({ inputContent: e.detail.value });
    },

    isPayIntent(text) {
        const payKeywords = ['支付', '付款', '结算', '确认支付'];
        return payKeywords.some((kw) => text.includes(kw));
    },

    scrollToBottom() {
        const idx = this.data.messages.length - 1;
        this.setData({ lastMessageId: `msg-${idx}` });
    },

    async handleSend() {
        const content = (this.data.inputContent || '').trim();
        if (!content || this.data.loading) return;

        let paymentPassword = '';
        if (this.isPayIntent(content)) {
            paymentPassword = await promptPaymentPassword({
                title: '支付验证',
                placeholder: '请输入登录密码'
            });
            if (!paymentPassword) {
                wx.showToast({ title: '已取消支付请求', icon: 'none' });
                return;
            }
        }

        const userMsg = {
            role: 'user',
            content,
            time: nowTime()
        };
        const messages = [...this.data.messages, userMsg];
        this.setData({
            messages,
            inputContent: '',
            loading: true
        }, this.scrollToBottom);

        try {
            const res = await sendChat({
                content,
                payment_password: paymentPassword
            });

            if (res && (res.success === false || res.ok === false || res.payment_success === false)) {
                throw new Error(normalizeChatErrorMessage(res, '支付失败，请重试'));
            }

            const reply = ((res && res.reply) || '').trim();
            if (!reply) {
                throw new Error(normalizeChatErrorMessage(res, '未获取到AI回复，请稍后重试'));
            }

            this.setData({
                messages: [
                    ...this.data.messages,
                    {
                        role: 'assistant',
                        content: reply,
                        time: nowTime()
                    }
                ]
            }, this.scrollToBottom);
        } catch (e) {
            console.error(e);
            const errMsg = normalizeChatErrorMessage(e, '请求失败，请稍后重试');
            const hasRequestToast = !!(e && typeof e === 'object' && (e.msg || (e.data && e.data.msg)));
            if (!hasRequestToast) {
                wx.showToast({
                    title: errMsg,
                    icon: 'none'
                });
            }
            this.setData({
                messages: [
                    ...this.data.messages,
                    {
                        role: 'system',
                        content: `${this.isPayIntent(content) ? '支付失败' : '生成失败'}：${errMsg}`,
                        time: nowTime()
                    }
                ]
            }, this.scrollToBottom);
        } finally {
            this.setData({ loading: false });
        }
    }
});
