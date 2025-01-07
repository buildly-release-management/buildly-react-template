import { create } from 'zustand';

const useStore = create((set) => ({
  productFormData: null,
  activeProduct: localStorage.getItem('activeProduct') || null,
  updateProductFormData: (data) => {
    set({ productFormData: data });
  },
  clearProductFormData: () => {
    set({ productFormData: null });
  },
  setActiveProduct: (data) => {
    set({ activeProduct: data });
    localStorage.setItem('activeProduct', data);
  },
}));

export { useStore };
