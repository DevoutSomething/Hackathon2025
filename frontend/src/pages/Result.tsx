import { useLocation } from "react-router-dom";
import TabularResults from "../components/TabularResults";

interface ApiResponse {
  promptReceived: string;
  response: string;
  success: boolean;
}

export default function Result() {  
  const location = useLocation();
  const apiResponse = location.state?.apiResponse as ApiResponse | string;
  
  return (
    <div> 
      <TabularResults apiResponse={apiResponse} type="text"/>
    </div>
  );
}


