import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_LIMIT = 15 * 60 * 1000; //15 min

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    //inactivity
    const resetTimer = useCallback(() => {
        const existing = localStorage.getItem('inactivity_timeout');
        if (existing) clearTimeout(Number(existing));

        const timeout = setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, INACTIVITY_LIMIT);

        localStorage.setItem('inactivity_timeout', String(timeout));
    }, [navigate]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(e => window.addEventListener(e, resetTimer));
        resetTimer();
        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, [resetTimer]);

    //input validation
    const validate = () => {
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

    const handleLogin = async () => {
        setError('');
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                //case sensitive comparison handled on backend
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('role', data.role);
                navigate('/all-flights', { replace: true });
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    //enter to log in also
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="w-100 mt-5 d-flex flex-column align-items-center gap-3">
            <h1 className="text-center">Login</h1>
            <div className="d-flex flex-column gap-2" style={{ width: '300px' }}>
                <input
                    className="form-control"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <input
                    className="form-control"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                {error && (
                    <p className="text-danger text-center mb-0">{error}</p>
                )}
                <button
                    className="btn text-white mt-1"
                    style={{ background: '#8C52FF' }}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Sucsess' : 'Login'}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;