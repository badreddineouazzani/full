import { all } from 'redux-saga/effects'
import { watchAuth } from '../features/auth/authSaga'
import { watchProducts } from '../features/products/productsSaga'
import { watchAdmin } from '../features/admin/adminSaga'

export default function* rootSaga() {
  yield all([
    watchAuth(),
    watchProducts(),
    watchAdmin(),
  ])
}
