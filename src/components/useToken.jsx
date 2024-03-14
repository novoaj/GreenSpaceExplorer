import {useState} from "react"
export default function useToken() {
    function getToken() {
        let token = localStorage.getItem("token")
        return token && token // return token if it exists
    }
    const [token, setToken] = useState(getToken())
    function saveToken(token) {
        localStorage.setItem('token', token);
        setToken(token);
      };
    
      function removeToken() {
        localStorage.removeItem("token");
        setToken(null);
      }
    
      return {
        setToken: saveToken,
        token,
        removeToken
      }

}