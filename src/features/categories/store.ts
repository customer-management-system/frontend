import { create } from 'zustand';
import { Category } from './schema';

interface CategoriesState {
    categories: Category[];
    addCategory: (category: Category) => void;
    updateCategory: (id: string, category: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    setCategories: (categories: Category[]) => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
    categories: [
        { id: '1', nameEn: 'English Courses', nameAr: 'لغة إنجليزية', status: 'active', imageUrl: 'https://placehold.co/50' },
        { id: '2', nameEn: 'Management Courses', nameAr: 'الدورات الإدارية', status: 'active', imageUrl: 'https://placehold.co/50' },
        { id: '3', nameEn: 'Certification Preparation', nameAr: 'التحضير للاختبارات', status: 'active', imageUrl: 'https://placehold.co/50' },
    ],
    addCategory: (category) => set((state) => ({
        categories: [...state.categories, { ...category, id: Math.random().toString(36).substr(2, 9) }]
    })),
    updateCategory: (id, updated) => set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    })),
    deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
    })),
    setCategories: (categories) => set({ categories }),
}));
