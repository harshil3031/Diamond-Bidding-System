import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserDashboard from '../pages/user/UserDashboard';
import ProtectedRoute from './ProtectedRoute';
import Diamonds from '../pages/admin/Diamonds';
import Monitor from '../pages/admin/Monitor';
import Bids from '../pages/admin/Bids';
import ResultDeclaration from '../pages/admin/ResultDeclaration';
import AddUser from '../pages/admin/AddUser';
import Users from '../pages/admin/Users';
import MyBids from '../pages/user/MyBids';
import Results from '../pages/user/Results';

const AppRoutes = () => {
  const user = useAppSelector((state) => state.auth.user);
  const homeRedirect = user?.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to={homeRedirect} replace /> : <Login />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/diamonds"
        element={
          <ProtectedRoute role="ADMIN">
            <Diamonds />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/monitor"
        element={
          <ProtectedRoute role="ADMIN">
            <Monitor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bids"
        element={
          <ProtectedRoute role="ADMIN">
            <Bids />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/results"
        element={
          <ProtectedRoute role="ADMIN">
            <ResultDeclaration />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/add"
        element={
          <ProtectedRoute role="ADMIN">
            <AddUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="ADMIN">
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute role="USER">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/my-bids"
        element={
          <ProtectedRoute role="USER">
            <MyBids />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/results"
        element={
          <ProtectedRoute role="USER">
            <Results />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
