const BASE_URL = 'http://42.193.104.173:8082/api/v1';

const normalizeErrorMessage = (msg, fallback = '请求失败') => {
  const text = String(msg || '').trim();
  if (!text) return fallback;

  if (/invalid payment password/i.test(text)) {
    return '支付密码错误，请重试';
  }

  return text;
};

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    };

    if (token) {
      header.Authorization = `Bearer ${token}`;
    }

    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      timeout: options.timeout || 10000,
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = res.data || {};
          if (data.code === 200) {
            resolve(data.data);
            return;
          }

          if (data.code === 401) {
            wx.removeStorageSync('token');
            wx.redirectTo({ url: '/pages/auth/login' });
            reject(data);
            return;
          }

          wx.showToast({
            title: normalizeErrorMessage(data.msg, '请求失败'),
            icon: 'none'
          });
          reject(data);
          return;
        }

        if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.redirectTo({ url: '/pages/auth/login' });
        }

        wx.showToast({
          title: normalizeErrorMessage(res?.data?.msg || res?.data?.message, '请求失败'),
          icon: 'none'
        });
        reject(res);
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

module.exports = request;
module.exports.BASE_URL = BASE_URL;
