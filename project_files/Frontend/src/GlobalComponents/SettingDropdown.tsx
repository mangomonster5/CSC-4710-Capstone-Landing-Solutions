import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';



interface SettingDropdownProps {
    handelLogoutClicked: () => void;
    body: ReactNode;
}

const SettingDropdown: React.FC<SettingDropdownProps> = ({ handelLogoutClicked, body }) => {
    const location = useLocation();


    return (
        <div className="dropdown d-flex align-items-center">
            <div
                className="card d-flex flex-column no-i-cursor gap-1 dropdown-toggle text-wrap p-0 border-0"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: 'pointer' }}
            >
                {body}
            </div>

            <ul
                className="dropdown-menu p-0"
                style={{ maxHeight: '200px', overflowY: 'auto' }}
            >
                <li style={{ cursor: "pointer" }}>
                    <Link className={`dropdown-item ${location.pathname === '/admin' ? 'navItemUnderline fw-semibold' : 'text-decoration-none'}`} to={'/admin'}>Admin</Link>
                </li>
                <li style={{ cursor: "pointer" }}>
                    <div className={`dropdown-item`} onClick={handelLogoutClicked}>Logout</div>
                </li>
            </ul>
        </div>
    )

}

export default SettingDropdown;