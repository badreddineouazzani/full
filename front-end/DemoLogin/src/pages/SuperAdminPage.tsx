import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import { fetchRequest } from '../features/admin/adminSlice'
import AdminHeader from '../components/AdminHeader'
import AdminStats from '../components/AdminStats'
import AdminUserTable from '../components/AdminUserTable'
import '../admin/Dashboard.css'

function SuperAdminPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchRequest())
  }, [dispatch])

  return (
    <section id="center">
      <AdminHeader />
      <AdminStats />
      <AdminUserTable />
    </section>
  )
}

export default SuperAdminPage
