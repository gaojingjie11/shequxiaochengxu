const BASE_URL = 'http://43.138.85.114:81/api/v1';

const request = (options) => {
  return new Promise((resolve, reject) => {
    // Get token from storage
    const token = wx.getStorageSync('token');

    // Construct header
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    };

    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: header,
      success: (res) => {
        // HTTP level check
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = res.data;
          // Business level check (matching Vue frontend logic)
          // { code: 200, data: ..., msg: "success" }
          if (data.code === 200) {
            resolve(data.data);
          } else if (data.code === 401) {
            wx.removeStorageSync('token');
            wx.redirectTo({ url: '/pages/auth/login' });
            // reject(data.msg || '登录已失效'); 
            // Don't reject if redirecting? Or reject to stop loading spinners.
            reject(data);
          } else {
            wx.showToast({
              title: data.msg || '请求失败',
              icon: 'none'
            });
            reject(data);
          }
        } else {
          // HTTP Error
          if (res.statusCode === 401) {
            wx.removeStorageSync('token');
            wx.redirectTo({
              url: '/pages/auth/login',
            });
          }
          reject(res);
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        reject(err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  });
};

module.exports = request;
