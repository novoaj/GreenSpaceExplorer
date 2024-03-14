import {useState} from "react";
import {Form, Row, Col} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./weather.css"
import {toast} from "react-toastify";

export default function SignupScreen(props) {
    const [username, setUsername] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")
    const navigate = useNavigate()

    const databaseError = () => toast.info("Server error (500), try again later");
    const genError = () => toast.info("Something went wrong with your request");
    const authError = () => toast.warning("Passwords must match!");
    const authSuccess = () => toast.success("Signed up successfully!");

    function handleSignup(event) {
        event.preventDefault();
        if (password1 !== password2){
            authError();
        }else{
            fetch("/handle-register", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password1
                })
            }).then(res=> {
                 if (res.status === 500) {
                    databaseError();
                }else if (res.status !== 200){
                    genError();
                }
                return res.json()
            }).then(data => {
                // cleanup and redirect user on successful signup
                if (data.msg === "successful signup!") {
                    props.setToken(data.token.access_token)
                    localStorage.setItem("username", username);
                    setUsername("")
                    setPassword1("")
                    setPassword2("")
                    authSuccess();
                    navigate("/")
                }
                
            })
        }
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
                            onSubmit={handleSignup} 
                            >
                        <span className="auth-header">Sign Up</span>
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
                                    value = {password1}
                                    onChange={(e) => setPassword1(e.target.value)}
                                    id = "password1"
                                    autoComplete="current-password"
                                    className= "auth-input"
                                    required
                                />
                                <label htmlFor="password1" className="auth-label">Password</label>
                            </div>
                        </Form.Group>
                        <Form.Group>
                            <div className="input-wrapper">
                                <input
                                    type="password" 
                                    value = {password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    id = "password2"
                                    autoComplete="current-password"
                                    className= "auth-input"
                                    required
                                />
                                <label htmlFor="password2" className="auth-label">Re-enter Password</label>
                            </div>
                        </Form.Group>
                        <div className="">
                            <button
                                className="auth-submit"
                                type="submit"
                                disabled={!username || !password1 || !password2}
                                >
                                Sign Up
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
