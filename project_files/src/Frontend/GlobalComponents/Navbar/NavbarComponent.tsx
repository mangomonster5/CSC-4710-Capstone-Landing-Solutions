import { Link, useLocation } from "react-router-dom";
import "./navbarComponent.css";

const NavBarComponent: React.FC = () => {
    const location = useLocation();

    return (
        <div className="d-flex gap-5 py-4 justify-content-between" style={{paddingLeft: '18vw', paddingRight: '18vw'}}>
            <div className="fw-medium no-i-cursor">Panther Cloud Air</div>
            <div className="d-flex gap-5">
                <div className="text-muted text-decoration-none no-i-cursor">Flight Info</div>
                <Link className={`text-black fw-semibold ${location.pathname ==='/all-flights' ? 'navItemUnderline' : 'text-decoration-none'} `} to="/all-flights">All Flights</Link>
                <div className="text-muted text-decoration-none no-i-cursor">Destination</div>
            </div>
            <div className="text-muted no-i-cursor">Lookup Flight</div>
        </div>
    );
}

export default NavBarComponent;