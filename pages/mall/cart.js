const { getCartList, updateCartQuantity, deleteCartItem } = require('../../api/order');

Page({
    data: {
        cartItems: [],
        totalPrice: '0.00'
    },

    onShow() {
        this.getCartList();
    },

    async getCartList() {
        try {
            const res = await getCartList();
            this.setData({ cartItems: res || [] });
            this.calculateTotal();
        } catch (e) {
            console.error(e);
        }
    },

    calculateTotal() {
        let total = 0;
        this.data.cartItems.forEach(item => {
            // Ensure prices are numbers
            const price = parseFloat(item.product.price) || 0;
            total += (price * item.quantity);
        });
        this.setData({ totalPrice: total.toFixed(2) });
    },

    async updateQuantity(e) {
        const { index, delta } = e.currentTarget.dataset;
        const item = this.data.cartItems[index];
        const newQty = item.quantity + delta;

        if (newQty < 1) return;

        // Optimistic update
        const up = `cartItems[${index}].quantity`;
        this.setData({ [up]: newQty });
        this.calculateTotal();

        try {
            await updateCartQuantity(item.id, newQty);
        } catch (e) {
            // Rollback
            this.setData({ [up]: item.quantity });
            this.calculateTotal();
            console.error(e);
        }
    },

    async deleteItem(e) {
        const { id } = e.currentTarget.dataset;
        try {
            await deleteCartItem(id);
            this.getCartList(); // Refresh list
        } catch (e) {
            console.error(e);
        }
    },

    checkout() {
        if (this.data.cartItems.length === 0) return;
        wx.navigateTo({
            url: '/pages/order/create',
        });
    }
});
