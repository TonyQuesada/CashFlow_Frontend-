import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { IoMdLogOut } from "react-icons/io";
import { AiOutlineSearch, AiOutlineHeart } from "react-icons/ai";
import "../assets/styles/navbar.css";

const Navbar = () => {
    const { user, logout, profileImage } = useContext(UserContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [pageTitle, setPageTitle] = useState("");

    useEffect(() => {
        // Establecer el título de la página basado en la ruta actual
        switch (location.pathname) {
            case "/Explorer":
                setPageTitle("Explorar");
                break;
            case "/Favorites":
                setPageTitle("Favoritos");
                break;
            case "/Profile":
                setPageTitle("Perfil");
                break;
            default:
                setPageTitle("");
        }
    }, [location]);

    const handleReload = (path, e) => {
        e.preventDefault(); // Prevenir la navegación por defecto
        if (location.pathname === path) {
            // Forzar recarga de la página
            window.location.reload();
        } else {
            // Navegar a la nueva página
            navigate(path);
        }
    };
    
    return (
        <>
            {/* Navbar superior */}
            <nav className="navbar">
                <div className="navbar-left">
                    <Link to="/Explorer" className="navbar-logo-link" onClick={(e) => handleReload("/Explorer", e)}>
                        <img src="/favicon.png" alt="Logo" className="navbar-logo" />
                    </Link>
                    <Link to="/Explorer" className="navbar-title-link" onClick={(e) => handleReload("/Explorer", e)}>
                        <span className="navbar-title">Otaku Collection</span>
                    </Link>
                </div>

                <div className={`navbar-center ${menuOpen ? "open" : ""}`}>
                    <Link to="/Explorer" className="navbar-link" onClick={(e) => handleReload("/Explorer", e)}>
                        Explorar
                    </Link>
                    <Link to="/Favorites" className="navbar-link" onClick={(e) => handleReload("/Favorites", e)}>
                        Favoritos
                    </Link>
                </div>

                <div className="navbar-right">
                    <div className="user-menu">
                        <Link to="/Profile" className="user-name" onClick={(e) => handleReload("/Profile", e)}>
                            {user.username}
                        </Link>
                        <Link className="dropdown-item logout" onClick={logout}>
                            <IoMdLogOut />
                        </Link>
                    </div>
                </div>

                {/* Nombre de la vista actual en la versión responsive */}
                <div className="navbar-title-responsive">
                    <span>{pageTitle}</span>
                </div>

                <div className="navbar-right-responsive">
                    <div className="user-menu">
                        <Link className="dropdown-item logout" onClick={logout}>
                            <IoMdLogOut />
                        </Link>
                    </div>
                </div>

            </nav>

            {/* Navbar con los íconos en la parte inferior */}
            <div className="navbar-responsive-icons">
                <Link to="/Explorer" className="responsive-icon" onClick={(e) => handleReload("/Explorer", e)}>
                    <AiOutlineSearch />
                    <span>Explorar</span> {/* Texto siempre visible */}
                </Link>
                <Link to="/Favorites" className="responsive-icon" onClick={(e) => handleReload("/Favorites", e)}>
                    <AiOutlineHeart />
                    <span>Favoritos</span> {/* Texto siempre visible */}
                </Link>
                <Link to="/Profile" className="responsive-icon" onClick={(e) => handleReload("/Profile", e)}>
                    <img
                        src={
                            profileImage ||
                            user?.profile_image ||
                            process.env.PROFILE_DEFAULT
                        }
                        alt="Perfil"
                        className="profile-image navbar-logo"
                        onError={(e) =>
                            (e.target.src = process.env.PROFILE_DEFAULT)
                        }
                    />
                    <span>Perfil</span> {/* Texto siempre visible */}
                </Link>
            </div>

        </>
    );
};

export default Navbar;
