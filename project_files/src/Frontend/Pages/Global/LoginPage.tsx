import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                />
                <input
                    className="form-control"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    {loading ? 'Successful' : 'Login'}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;