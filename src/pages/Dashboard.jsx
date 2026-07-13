import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from './Dashboard/StudentDashboard';
import AdminDashboard from './Dashboard/AdminDashboard';
import TeacherDashboard from './Dashboard/TeacherDashboard';

export default function Dashboard() {
  const { userRole, logout } = useAuth();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gold">Tribunale</h2>
        <button className="btn btn-secondary" onClick={logout}>Esci</button>
      </div>

      {userRole === 'student' || userRole === 'juror' ? (
        <StudentDashboard />
      ) : userRole === 'admin' ? (
        <AdminDashboard />
      ) : (
        <TeacherDashboard />
      )}
    </div>
  );
}
