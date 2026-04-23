import { Link, useLocation } from "react-router-dom";
import "./navbarComponent.css";
import useAllStateContext from "../../context/useAllStateContext";
import SettingDropdown from "../SettingDropdown";
import { SetStateAction } from "react";

const NavBarComponent: React.FC = () => {
    const location = useLocation();

    const { setUser, user } = useAllStateContext();

    const handelLogoutClicked = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        setUser({
            isAuthenticated: false,
            role: null
        })
    }

    return (
        <div className="d-flex gap-5 py-4 justify-content-between" style={{ paddingLeft: '18vw', paddingRight: '18vw' }}>
            <div className="fw-medium no-i-cursor">Panther Cloud Air</div>
            <div className="d-flex gap-5">
                <Link className={`text-black ${location.pathname === '/flight-info' ? 'navItemUnderline fw-semibold' : 'text-decoration-none'} `} to="/flight-info">Flight Info</Link>
                <Link className={`text-black ${location.pathname === '/all-flights' ? 'navItemUnderline fw-semibold' : 'text-decoration-none'} `} to="/all-flights">All Flights</Link>
                <Link className={`text-black ${location.pathname === '/flight-selection' ? 'navItemUnderline fw-semibold' : 'text-decoration-none'} `} to="/flight-selection">Flight Selection</Link>
            </div>

            {/* We will either render and empty div */}
            {/* <div></div> */}
            {/* or render the admin link depending on the sign in creds */}
            {/* <div className="text-muted no-i-cursor">Admin</div> */}
            {user.role === 'employee' && (
                <button className="bg-white border-0" onClick={handelLogoutClicked}>Logout</button>
            )}

            {user.role === 'admin' && (
                <>
                    <SettingDropdown
                        handelLogoutClicked={handelLogoutClicked}
                        body={
                            location.pathname === '/admin' ? (
                                <div className="d-flex gap-2 align-items-center">
                                    <div className={`text-black ${location.pathname === '/admin' ? 'navItemUnderline fw-semibold' : 'text-decoration-none'} `}>Admin</div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
                                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                                    </svg>
                                </div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
                                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                                </svg>
                            )
                        }
                    />
                </>
            )}

        </div>
    );
}

export default NavBarComponent;