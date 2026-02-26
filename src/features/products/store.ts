import { create } from 'zustand';
import { Product, ProductsResponse } from './schema';
import { productsService } from './productsService';

interface ProductsState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    meta: ProductsResponse['data']['pagination'] | null;
    isDeleted: boolean;

    fetchProducts: (page?: number, limit?: number, search?: string) => Promise<void>;
    addProduct: (product: Product) => Promise<void>;
    updateProduct: (id: number, data: Partial<Product>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    setFilter: (isDeleted: boolean) => void;

    currentProduct: Product | null;
    productToEdit: Product | null;
    fetchProductDetails: (id: number) => Promise<void>;
    setProductToEdit: (product: Product | null) => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
    products: [],
    isLoading: false,
    error: null,
    meta: null,
    isDeleted: false,
    currentProduct: null,
    productToEdit: null,

    setFilter: (isDeleted: boolean) => {
        set({ isDeleted });
        get().fetchProducts(1);
    },

    setProductToEdit: (product) => set({ productToEdit: product }),

    fetchProducts: async (page = 1, limit = 10, search = '') => {
        const { isDeleted } = get();
        set({ isLoading: true, error: null });
        try {
            const response = await productsService.getAll(page, limit, search, isDeleted);
            set({
                products: response.data.products,
                meta: response.data.pagination,
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch products', isLoading: false });
        }
    },

    addProduct: async (productData) => {
        set({ isLoading: true, error: null });
        try {
            await productsService.create(productData);
            const { meta } = get();
            await get().fetchProducts(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to add product', isLoading: false });
            throw error;
        }
    },

    updateProduct: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await productsService.update(id, data);

            set(state => ({
                products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
            }));

            const { currentProduct } = get();
            if (currentProduct && currentProduct.id === id) {
                set({ currentProduct: { ...currentProduct, ...data } as Product });
            }

            const { meta } = get();
            await get().fetchProducts(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to update product', isLoading: false });
            throw error;
        }
    },

    deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await productsService.delete(id);
            const { meta } = get();
            await get().fetchProducts(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete product', isLoading: false });
            throw error;
        }
    },

    fetchProductDetails: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const product = await productsService.getById(id);
            set({ currentProduct: product, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch product details', isLoading: false });
        }
    },
}));
