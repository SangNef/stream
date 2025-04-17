import { getAccessTokenFromLS } from '../../utils/auth';
import { Navigate } from 'react-router-dom';

const RejectRoute = ({ children }: { children: React.ReactNode }) => {
    const accessToken = getAccessTokenFromLS() as string;
    return !(accessToken as string) ? (
        <>{children}</>
    ) : (
        <Navigate to='/' />
    );
};

export default RejectRoute;