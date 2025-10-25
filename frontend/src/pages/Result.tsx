import { useLocation, Link } from "react-router-dom";
import TabularResults from "../components/TabularResults";
import "../../styles/Result.css";

interface ApiResponse {
  promptReceived: string;
  response: string;
  success: boolean;
}

export default function Result() {  
  const location = useLocation();
  const apiResponse = location.state?.apiResponse as ApiResponse | string;
  
  return (
    <div className="result-page"> 
      <div className="result-header">
        <Link to="/learn" className="new-learn-btn">
          Learn something new
        </Link>
      </div>
      <TabularResults apiResponse={apiResponse} type="text"/>
    </div>
  );
}


