import { Outlet } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import styles from "./Footer.module.css";

// this is displayed on every page of the app. It assists with navigation 
// and is essentially just for the navbar. Outlet displays whatever links
export default function Layout(props){
    // https://www.youtube.com/watch?v=nkZz9DOBzBI
    return (
        <>
            <NavbarComponent token={props.token} removeToken={props.removeToken}/>
            <div className={styles.content}>
                <Outlet/>
            </div>
            <div className={styles.footer}>
                <footer>
                    <div className={styles.footerContainer}>
                        <div className={styles.socialIcons}>
                            {/* <p>Ben Coleman: <a href=""> <FontAwesomeIcon icon={faGithub} /></a></p> */}
                            <a href=""> <FontAwesomeIcon icon={faGithub} className={styles.icon}/></a>
                        </div>
                        <div className={styles.footerNav}>
                            <ul>
                                <li><a href= "/">Home</a></li>
                                <li><a href= "mailto: jnovoa@wisc.edu;bbcoleman2@wisc.edu">Contact Us</a></li>
                            </ul>
                        </div>
                        <div className={styles.footerBottom}>
                            <p>Copyright &copy; 2024; Created by <span className="creator">Jared Novoa and Ben Coleman</span></p>
                        </div>
                    </div>
                </footer>
            </div>
            
        </>   
    )
}