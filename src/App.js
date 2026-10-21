import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import Guard from './components/Guard';
import CarListPage from './pages/CarListPage';
import CarDetailPage from './pages/CarDetailPage';
import CarManagementPage from './pages/CarManagementPage';
import BrandManagementPage from './pages/BrandManagementPage';
import VehicleTypeManagementPage from './pages/VehicleTypeManagementPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ConsultationForm from './pages/ConsultationForm';
import MyConsultationsPage from './pages/MyConsultationsPage';
import ConsultationManagementPage from './pages/ConsultationManagementPage';
import TestDriveBookingPage from './pages/TestDriveBookingPage';
import MyTestDrivesPage from './pages/MyTestDrivesPage';
import TestDriveManagementPage from './pages/TestDriveManagementPage';
import OrderCreatePage from './pages/OrderCreatePage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderManagementPage from './pages/OrderManagementPage';
import AppNavbar from './components/AppNavbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ComparePage from './pages/ComparePage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <>
      <AppNavbar />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<CarListPage />} />
          <Route path="/compare" element={<ComparePage />} />

          <Route
            path="/admin"
            element={
              <Guard roles={["admin", "staff"]}>
                <DashboardPage />
              </Guard>
            }
          />

          <Route path="/cars/:id" element={<CarDetailPage />} />

          <Route
            path="/admin/cars"
            element={
              <Guard roles={["admin", "staff"]}>
                <CarManagementPage />
              </Guard>
            }
          />

          <Route
            path="/admin/brands"
            element={
              <Guard roles={["admin", "staff"]}>
                <BrandManagementPage />
              </Guard>
            }
          />

          <Route
            path="/admin/types"
            element={
              <Guard roles={["admin", "staff"]}>
                <VehicleTypeManagementPage />
              </Guard>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/profile"
            element={
              <Guard>
                <ProfilePage />
              </Guard>
            }
          />

          <Route
            path="/admin/users"
            element={
              <Guard roles={["admin"]}>
                <CustomerManagementPage />
              </Guard>
            }
          />

          <Route
            path="/consultations/new"
            element={
              <Guard>
                <ConsultationForm />
              </Guard>
            }
          />

          <Route
            path="/my/consultations"
            element={
              <Guard>
                <MyConsultationsPage />
              </Guard>
            }
          />

          <Route
            path="/admin/consultations"
            element={
              <Guard roles={["admin", "staff"]}>
                <ConsultationManagementPage />
              </Guard>
            }
          />

          <Route
            path="/testdrives/new"
            element={
              <Guard>
                <TestDriveBookingPage />
              </Guard>
            }
          />

          <Route
            path="/my/testdrives"
            element={
              <Guard>
                <MyTestDrivesPage />
              </Guard>
            }
          />

          <Route
            path="/admin/testdrives"
            element={
              <Guard roles={["admin", "staff"]}>
                <TestDriveManagementPage />
              </Guard>
            }
          />

          <Route
            path="/orders/new"
            element={
              <Guard>
                <OrderCreatePage />
              </Guard>
            }
          />

          <Route
            path="/my/orders"
            element={
              <Guard>
                <MyOrdersPage />
              </Guard>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <Guard roles={["admin", "staff"]}>
                <OrderManagementPage />
              </Guard>
            }
          />

          <Route
            path="*"
            element={
              <p>
                Không tìm thấy trang. <Link to="/">Về trang chủ</Link>
              </p>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
