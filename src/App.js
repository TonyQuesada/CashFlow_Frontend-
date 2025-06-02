import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import Explorer from "./pages/Explorer";
import Profile from "./pages/Profile";
import Navbar from "./pages/Navbar";
import useIsMobile from "./hooks/useIsMobile";
import { ToastContainer } from 'react-toastify';
import { UserContext } from "./context/UserContext";
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-dark-purple/theme.css";
import "./assets/styles/global.css";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  return user ? children : <Navigate to="/Login" />;
};

function App() {
  
  const { user } = useContext(UserContext);
  const isMobile = useIsMobile();

  return (
    <>
      <ToastContainer autoClose={2000} limit={2} closeOnClick pauseOnHover toastClassName="toast-custom" position={isMobile ? "top-right" : "bottom-right"} hideProgressBar draggable={false} />
      <BrowserRouter>
        {user && <Navbar />}
        <PrimeReactProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/Login" />} />
            <Route path="/Login" element={user ? <Navigate to="/Explorer" /> : <Login />} />
            <Route path="/Register" element={ <Register /> } />
            <Route path="/Favorites" element={ <ProtectedRoute> <Favorites /> </ProtectedRoute> } />          
            <Route path="/Explorer" element={ <ProtectedRoute> <Explorer /> </ProtectedRoute> } />
            <Route path="/Profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> } />          
          </Routes>
        </PrimeReactProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
