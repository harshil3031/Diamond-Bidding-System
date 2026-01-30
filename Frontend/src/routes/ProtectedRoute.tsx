import { Navigate } from 'react-router-dom';
import { UserRole } from '../types/auth';
import { ReactNode } from 'react';
import { useAppSelector } from '../store/hooks';

const ProtectedRoute = ({
  children,
  role,
}: {
  children: ReactNode;
  role: UserRole;
}) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
