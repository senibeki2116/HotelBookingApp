import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


function ProtectedRoute({children}) {

    const {token} = useContext(AuthContext);


    if(!token){

        return <Navigate to="/login" />;

    }


    return children;

}


export default ProtectedRoute;