import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Category {
  id: number
  NameCt: string
}

export interface Produit {
  id: number
  namePr: string
  category: Category
}

export type SortKey = 'newest' | 'oldest' | 'name-asc' | 'name-desc'

export interface ProductsState {
  items: Produit[]
  loading: boolean
  error: string | null
  sortBy: SortKey
  categoryFilter: string
  search: string
  visibleCount: number
  editingProduct: Produit | null
  deleteMode: boolean
  selectedIds: number[]
}

const PAGE_SIZE = 12

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  sortBy: 'newest',
  categoryFilter: 'all',
  search: '',
  visibleCount: PAGE_SIZE,
  editingProduct: null,
  deleteMode: false,
  selectedIds: [],
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchRequest(state) {
      state.loading = true
      state.error = null
    },
    fetchSuccess(state, action: PayloadAction<Produit[]>) {
      state.loading = false
      state.items = action.payload
    },
    fetchFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },

    addRequest(state, _action: PayloadAction<{ namePr: string; categoryId: number }>) {
      state.loading = true
      state.error = null
    },
    addSuccess(state) {
      state.loading = false
    },
    addFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },

    editRequest(state, _action: PayloadAction<{ id: number; namePr: string; categoryId: number }>) {
      state.loading = true
      state.error = null
    },
    editSuccess(state) {
      state.loading = false
      state.editingProduct = null
    },
    editFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },

    deleteRequest(state, _action: PayloadAction<number>) {
      state.error = null
    },
    deleteSuccess(state, action: PayloadAction<number>) {
      state.items = state.items.filter((p) => p.id !== action.payload)
    },
    deleteFailure(state, action: PayloadAction<string>) {
      state.error = action.payload
    },

    deleteManyRequest(state, _action: PayloadAction<number[]>) {
      state.error = null
    },
    deleteManySuccess(state, action: PayloadAction<number[]>) {
      const removed = new Set(action.payload)
      state.items = state.items.filter((p) => !removed.has(p.id))
      state.deleteMode = false
      state.selectedIds = []
    },
    deleteManyFailure(state, action: PayloadAction<string>) {
      state.error = action.payload
    },

    setSortBy(state, action: PayloadAction<SortKey>) {
      state.sortBy = action.payload
      state.visibleCount = PAGE_SIZE
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload
      state.visibleCount = PAGE_SIZE
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
      state.visibleCount = PAGE_SIZE
    },
    increaseVisible(state, action: PayloadAction<number>) {
      state.visibleCount = Math.min(state.visibleCount + PAGE_SIZE, action.payload)
    },
    setEditingProduct(state, action: PayloadAction<Produit | null>) {
      state.editingProduct = action.payload
    },
    setDeleteMode(state, action: PayloadAction<boolean>) {
      state.deleteMode = action.payload
      if (!action.payload) state.selectedIds = []
    },
    toggleSelected(state, action: PayloadAction<number>) {
      const id = action.payload
      const idx = state.selectedIds.indexOf(id)
      if (idx === -1) state.selectedIds.push(id)
      else state.selectedIds.splice(idx, 1)
    },
    setSelectedIds(state, action: PayloadAction<number[]>) {
      state.selectedIds = action.payload
    },
  },
})

export const PAGE_SIZE_CONST = PAGE_SIZE

export const {
  fetchRequest, fetchSuccess, fetchFailure,
  addRequest, addSuccess, addFailure,
  editRequest, editSuccess, editFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  deleteManyRequest, deleteManySuccess, deleteManyFailure,
  setSortBy, setCategoryFilter, setSearch,
  increaseVisible, setEditingProduct,
  setDeleteMode, toggleSelected, setSelectedIds,
} = productsSlice.actions

export default productsSlice.reducer
