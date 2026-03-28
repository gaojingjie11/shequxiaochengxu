const { getProductList, getCategories } = require('../../api/product');

Page({
    data: {
        products: [],
        categories: [],
        searchKeyword: '',
        selectedCategory: 0,
        page: 1,
        size: 10,
        total: 0,
        loading: false
    },

    isProductOnline(product) {
        if (!product || typeof product !== 'object') return false;

        if (product.status !== undefined && product.status !== null) {
            return Number(product.status) === 1;
        }

        if (product.is_on_sale !== undefined && product.is_on_sale !== null) {
            return Number(product.is_on_sale) === 1;
        }

        if (product.is_active !== undefined && product.is_active !== null) {
            return Number(product.is_active) === 1;
        }

        return true;
    },

    onLoad() {
        this.getCategories();
        this.getProducts(true);
    },

    onPullDownRefresh() {
        this.setData({ page: 1 });
        this.getProducts(true).then(() => {
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom() {
        if (this.data.products.length < this.data.total) {
            this.setData({ page: this.data.page + 1 });
            this.getProducts();
        }
    },

    onSearchInput(e) {
        this.setData({ searchKeyword: e.detail.value });
    },

    handleSearch() {
        this.setData({ page: 1 });
        this.getProducts(true);
    },

    selectCategory(e) {
        const id = e.currentTarget.dataset.id;
        if (this.data.selectedCategory === id) return;
        this.setData({ selectedCategory: id, page: 1 });
        this.getProducts(true);
    },

    async getCategories() {
        try {
            const res = await getCategories();
            this.setData({ categories: res || [] });
        } catch (e) {
            console.error(e);
        }
    },

    async getProducts(reset = false) {
        if (this.data.loading) return;
        this.setData({ loading: true });

        try {
            const { searchKeyword, selectedCategory, page, size } = this.data;
            const params = {
                page,
                size,
                status: 1
            };
            if (searchKeyword) {
                params.name = searchKeyword;
            }
            if (selectedCategory > 0) {
                params.category_id = selectedCategory;
            }

            const res = await getProductList(params);

            let list = [];
            let total = 0;

            // Handle various response structures
            // request.js unwraps data.code===200 -> data.data
            // If backend returns { list: [...], total: ... }, res is that object.
            // If backend returns [...] (flat array), res is that array.
            if (Array.isArray(res)) {
                list = res;
                total = res.length;
            } else if (res && (res.list || Array.isArray(res.list))) {
                // Check res.list exist or is array (even if empty)
                list = res.list || [];
                total = res.total || 0;
            }

            const mappedList = list
                .filter(item => this.isProductOnline(item))
                .map(item => item);

            if (reset) {
                this.setData({ products: mappedList, total: total });
            } else {
                this.setData({ products: [...this.data.products, ...mappedList], total: total });
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.setData({ loading: false });
        }
    }
});
