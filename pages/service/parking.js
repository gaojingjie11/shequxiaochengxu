const { getMyParking, bindCar } = require('../../api/service');

Page({
    data: {
        parkingList: [],
        plate_number: '',
        loading: false,
        showModal: false,
        currentId: null
    },

    onShow() {
        this.getParking();
    },

    async getParking() {
        this.setData({ loading: true });
        try {
            const res = await getMyParking();
            // Support list or single object
            let list = [];
            if (Array.isArray(res)) {
                list = res;
            } else if (res) {
                list = [res];
            }
            this.setData({ parkingList: list });
        } catch (e) {
            console.error(e);
            // If 404 or other error, parkingInfo remains null
        } finally {
            this.setData({ loading: false });
        }
    },

    onInput(e) {
        this.setData({ plate_number: e.detail.value });
    },

    showBindModal(e) {
        const id = e.currentTarget.dataset.id;
        this.setData({
            showModal: true,
            currentId: id,
            plate_number: '' // reset input
        });
    },

    closeModal() {
        this.setData({ showModal: false, currentId: null });
    },

    async handleBindConfirm() {
        if (!this.data.plate_number) {
            wx.showToast({ title: '请输入车牌号', icon: 'none' });
            return;
        }

        try {
            await bindCar({
                car_plate: this.data.plate_number, // Backend expects car_plate
                parking_id: Number(this.data.currentId) // Backend expects parking_id
            });
            wx.showToast({ title: '绑定成功', icon: 'success' });
            this.closeModal();
            this.getParking();
        } catch (e) {
            console.error(e);
        }
    }
});
