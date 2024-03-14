import {Nav,Navbar, Container, Row, Col} from "react-bootstrap";
import {Link} from "react-router-dom";
import styles from "./NavBar.module.css"
//import logoWhite from "../../../public/logo_white.svg"
import Logo from "../../Logo";

export default function NavbarComponent(props) {
    return <>
                <Container fluid nogutters="true" className="navContainer" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                        <Col xs =  {12}>
                            <Navbar 
                            expand="md"
                            variant="dark"
                            className={styles.navbar}
                            >
                                <div className={styles.navContentContainer}>
                                    <Navbar.Brand as={Link} to="/">
                                        <Logo fillColor = "white"/>
                                    </Navbar.Brand>
                                </div>
                                    <Navbar.Toggle aria-controls="basic-navbar" className={styles.toggle}/>
                                    <Navbar.Collapse className={styles.navContent} id="basic-navbar">
                                        <Nav  className="justify-content-end" style={{ width: "100%" }}>
                                            {(props.token !== null && props.token !== "" && props.token !== undefined) ? 
                                                <>
                                                    {/* <Nav.Link as={Link} to="/" style = {styles.text}>Home</Nav.Link> */}
                                                    <Nav.Link 
                                                        className = {styles.navLink}
                                                        as={Link} to="/login" 
                                                        style = {styles.text}
                                                        onClick={(e) => {
                                                            props.removeToken(); 
                                                            localStorage.removeItem("username");
                                                            }}
                                                        >
                                                            Logout
                                                        </Nav.Link>
                                                </>:
                                                <>
                                                    {/* <Nav.Link as={Link} to="/" style = {styles.text}>Home</Nav.Link> */}
                                                    <Nav.Link as={Link} to="/login" className = {styles.navLink}>Login</Nav.Link>
                                                    <Nav.Link as={Link} to="/signup" className = {styles.navLink}>Signup</Nav.Link>
                                                </>
                                                } 
                                        </Nav>
                                    </Navbar.Collapse>
                                
                            </Navbar>
                        </Col>
                    </Row>
                </Container>
            
        </>
}