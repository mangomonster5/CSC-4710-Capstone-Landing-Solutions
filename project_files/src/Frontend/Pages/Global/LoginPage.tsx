import { useNavigate } from "react-router-dom";




const LoginPage: React.FC = () => {
    const navigate = useNavigate();


    return (
        <div className="w-100 mt-4 d-flex flex-column align-items-center gap-4">
            <div>
                <h1 className="text-center">Login Page</h1>
                <p className="text-center mb-0">This page has not been implemented yet</p>
            </div>
            <button className="rounded border py-1 text-white" style={{ width: '150px', background: '#8C52FF' }} onClick={() => navigate('/all-flights', { replace: true })}>Help</button>
        </div>
    );
}

export default LoginPage;