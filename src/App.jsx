import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SlotManagement from './pages/SlotManagement';
import AttendingManagement from './pages/AttendingManagement';
import HeaderImagesManagement from './pages/HeaderImagesManagement';
import GalleryManagement from './pages/GalleryManagement';
import StaffManagement from './pages/StaffManagement';
import BookingManagement from './pages/BookingManagement';
import SlotRequestLogs from './pages/SlotRequestLogs';
import SupporterManagement from './pages/SupporterManagement';
import MediaManagement from './pages/MediaManagement';
import RecognitionManagement from './pages/RecognitionManagement';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

function App() {
  const ProtectedLayout = ({ children }) => (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/slots" element={<ProtectedLayout><SlotManagement /></ProtectedLayout>} />
        <Route path="/attending" element={<ProtectedLayout><AttendingManagement /></ProtectedLayout>} />
        <Route path="/header-images" element={<ProtectedLayout><HeaderImagesManagement /></ProtectedLayout>} />
        <Route path="/gallery" element={<ProtectedLayout><GalleryManagement /></ProtectedLayout>} />
        <Route path="/staff" element={<ProtectedLayout><StaffManagement /></ProtectedLayout>} />
        <Route path="/requests" element={<ProtectedLayout><BookingManagement /></ProtectedLayout>} />
        <Route path="/request-logs" element={<ProtectedLayout><SlotRequestLogs /></ProtectedLayout>} />
        <Route path="/supporters" element={<ProtectedLayout><SupporterManagement /></ProtectedLayout>} />
        <Route path="/media" element={<ProtectedLayout><MediaManagement /></ProtectedLayout>} />
        <Route path="/recognition" element={<ProtectedLayout><RecognitionManagement /></ProtectedLayout>} />
        <Route path="/users" element={<ProtectedLayout><StaffManagement /></ProtectedLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
