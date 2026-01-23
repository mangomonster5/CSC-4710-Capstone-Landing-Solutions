import './App.css';
import AllFlightsPage from './Frontend/Pages/AllFlightsPage';
import LoginPage from './Frontend/Pages/Global/LoginPage';
import { Navigate, Route, Routes } from "react-router-dom";



// const ProtectedRoute = ({user: User, correctRole, children}) => {
//   if (!user.isAuthenticated) return <Navigate to="/login" />;

//   if (correctRole !== user.role) return <Navigate to="/login" />;

//   return children;
// }


function App() {

  const user: User = {
    isAuthenticated: true,
    role: 'employee'
  }

  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />

      {/* <Route
        path="/admin"
        element={
          <ProtectedRoute user={user} correctRole="employee">
            <AllFlightsPage />
          </ProtectedRoute>
        }
      /> */}
    </Routes>

  );
}

export default App;