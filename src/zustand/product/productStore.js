import { create } from 'zustand';

const useStore = create((set) => ({
  productFormData: null,
  updateProductFormData: (data) => {
    set({ productFormData: data });
  },
  clearProductFormData: () => {
    set({ productFormData: null });
  },
}));

export { useStore };
