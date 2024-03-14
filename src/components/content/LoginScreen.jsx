import {useState} from "react";
import {Form, Row, Col} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./weather.css"
import {toast} from "react-toastify";

export default function LoginScreen(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const databaseError = () => toast.info("Server error (500), try again later");
    const authError = () => toast.warning("Incorrect username or password!");
    const authSuccess = () => toast.success("Logged in successfully!");


    function handleLogin(event) {
        // send username and password to the backend
        event.preventDefault()
        console.log("username:" + username + " " + "password:" + password)
        fetch(`/handle-login`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(res => {
            if (res.status === 401) {
                //alert("wrong username or password!")
                authError();
            }else if (res.status === 500) {
                // alert("database error")
                databaseError();
            }
            return res.json()
        })
        .then(data=> {
            console.log(data)
            // cleanup and redirect on successful login
            if (data.msg === "succesful login!") {
                props.setToken(data.token.access_token)
                localStorage.setItem("username", username);
                setUsername("");
                setPassword("");
                authSuccess();
                navigate("/");
            }
        })
    }
    return (
        <div className="wrapper">
            <Row className="d-flex justify-content-center align-items-center flex-grow-1">
                <Col 
                    xs = {12} sm = {10} md={8} lg = {6} xl={6} 
                    className="mx-auto" 
                    >
                    <div className="auth-box">
                        <Form 
                            onSubmit={handleLogin} 
                            >
                        <span className="auth-header">Login</span>
                        <Form.Group>
                            <div className="input-wrapper">
                                <input
                                    type="text" 
                                    onChange={(e) => setUsername(e.target.value)}
                                    id = "username"
                                    autoComplete="username"
                                    value = {username}
                                    className= "auth-input"
                                    required
                                />
                                <label htmlFor="username" className="auth-label">Username</label>
                            </div>
                        </Form.Group>
                        <Form.Group>
                            <div className="input-wrapper">
                                <input
                                    type="password" 
                                    value = {password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    id = "password"
                                    autoComplete="current-password"
                                    className= "auth-input"
                                    required
                                />
                                <label htmlFor="password" className="auth-label">Password</label>
                            </div>
                        </Form.Group>
                        <div className="">
                            <button
                                className="auth-submit"
                                type="submit"
                                disabled={!username || !password}
                                >
                                Login
                            </button>
                        </div>
                        <div className="register">
                            <span>Don't have an account? <a href="/signup">Register</a></span>
                        </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    )
}