import { Link, useLocation } from "react-router-dom";
import "./navbarComponent.css";
import useAllStateContext from "../../context/useAllStateContext";

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
            <button className="bg-white border-0" onClick={handelLogoutClicked}>Logout</button>

            {user.role === 'admin' && (
                <Link className={`text-black ${location.pathname === '/admin' ? 'navItemUnderline fw-semibold' : 'text-decoration-none'} `} to="/admin">Admin</Link>
            )}

        </div>
    );
}

export default NavBarComponent;