/* 
 REACT
 store and update values, run code when the component loads or when something changes, store a function so 
 it doesn't get recreated every render
 nav to redirect the user to a different page
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAllStateContext from "../../context/useAllStateContext";

// *
// 15 min long inactivity timer *CALC*
// *
const INACTIVITY_LIMIT = 15 * 60 * 1000;

// *
// REACT func for login
// * 
const LoginPage: React.FC = () => {
    const { setUser } = useAllStateContext();

    // *
    // REACT vars that automatically update, storing user input
    // *
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // *
    // 15 min long inactivity timer *FUNC*
    // *
    const resetTimer = useCallback(() => {
        const existing = localStorage.getItem('inactivity_timeout');
        if (existing) clearTimeout(Number(existing));
        /*
        starts new timer 
        will wipe 'saved data' still testing
        redirect to login page...but from login, still testing
        */
        const timeout = setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, INACTIVITY_LIMIT);
        // *
        // timer id to be cleared if needed
        // *
        localStorage.setItem('inactivity_timeout', String(timeout));
    }, [navigate]);

    // * 
    // some react dependency, primary actions that count as activity 
    //*
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(e => window.addEventListener(e, resetTimer));
        resetTimer();
        return () => {
            // * 
            // when user leaves page, clear listener to prevent ml
            // * 
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, [resetTimer]);

    // *
    // input validation
    // *
    const validate = () => {
        /*
        ~trimming spaces
        a) if both fields are empty
        b) if username field empty
        c) if password field empty
        */
        if (!username.trim() && !password.trim()) {
            setError('Username & password are required.');
            return false;
        }
        if (!username.trim()) {
            setError('Username is required.');
            return false;
        }
        if (!password.trim()) {
            setError('Password is required.');
            return false;
        }
        return true;
    };

    // *
    // on press login fn, await server trust 
    // * 
    const handleLogin = async () => {
        setError('');
        if (!validate()) return;
        setLoading(true);
        try {
            /*
            post to backend endpoint http req
            json edition
            */
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                // *
                // case sensitive comparison handled on backend
                // *
                body: JSON.stringify({ username, password }),
            });

            // *
            // waiting for server conf
            // *
            const data = await response.json();
            console.log(data)

            /*
            func for data match 
            redirects to landing page (rn all flights)
            no backhistory (in lieu testing with timer)
            */
            if (data.success) {
                // console.log(data.user)
                // console.log(data.user.role)
                const user = {
                    isAuthenticated: true,
                    role: data.user.role?? null
                }

                localStorage.setItem("user", JSON.stringify(user));
                setUser(user)

                if (data.user.role !== null || data.user.role !== undefined) {
                    navigate('/all-flights', { replace: true });
                } 
                
                // localStorage.setItem('role', data.role); | REMOVED
            } else {

                // *
                // data doesn't match
                // *
                setError(data.message);
            }
            // *
            // serv offline
            // *
        } catch (err) {
            setError('Could not connect to the server');

            // *
            // on success or failure 
            // * 
        } finally {
            setLoading(false);
        }
    };

    // *
    // enter to log in also
    // *
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        // premade REACT spacing
        <div className="w-100 mt-5 d-flex flex-column align-items-center gap-3">
            <h1 className="text-center">Login</h1>
            {/* holds the inputs and button */}
            <div className="d-flex flex-column gap-2" style={{ width: '300px' }}>
                {/* username input box */}
                <input
                    className="form-control"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                {/* password input box with hidden characters */}
                <input
                    className="form-control"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                {error && (
                    // only show the error message if error arises
                    <p className="text-danger text-center mb-0">{error}</p>
                )}
                {/* button grayed out while loading */}
                <button
                    className="btn text-white mt-1"
                    style={{ background: '#8C52FF' }}
                    onClick={handleLogin}
                    disabled={loading}

                >{/* displaying diff text depending on status */}
                    {loading ? 'Logging in' : 'Login'}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;