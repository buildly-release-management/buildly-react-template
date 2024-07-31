import { create } from 'zustand';

const useStore = create((set) => ({
  productFormData: null,
  activeProduct: null,
  updateProductFormData: (data) => {
    set({ productFormData: data });
  },
  clearProductFormData: () => {
    set({ productFormData: null });
  },
  setActiveProduct: (data) => {
    set({ activeProduct: data });
  },
}));

export { useStore };
