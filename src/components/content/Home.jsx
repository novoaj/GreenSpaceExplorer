import Map from "./MapScreen";
import {Container, Row, Col, Image} from "react-bootstrap"
import SearchBar from "./SearchBar";
import {useState} from "react";
import DefaultHome from "./DefaultHome";
import { LocationContext } from "../context/LocationContext";

export default function Home(){
    const [location, setLocation] = useState("");
    const [inMap, setInMap] = useState(false)
    const handleInMap = (value) => {
        setInMap(value)
    }
    const styles = {
        container: {
            position: "relative"
        },
        contentContainer: {
            marginTop:"20px",
            padding: "10px",
            zIndex: 2
            
        },
        content: {
            backgroundColor: "#e7e9e8",
            padding: "30px",
            boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            borderRadius: "10px",
            //boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px"
        },
        imageContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            width: "100%"
        }
    }
    return (
        <>
            
            <Container style = {styles.container} fluid>
                {/* <Image style={styles.imageContainer} src="/blog-green-space-1.jpg" fluid></Image> */}
                <Row style={styles.contentContainer} className="justify-content-center align-items-center">
                    <Col style={styles.content} xs={12} sm={12} md={12} lg={9} xl={8}>
                        <LocationContext.Provider value = {[location, setLocation]}>
                            <SearchBar/>
                            {(location === "" && !inMap) ? 
                                <DefaultHome/> : <Map location = {location} onInMapChange = {handleInMap}/>
                                }
                        </LocationContext.Provider>
                    </Col>
                </Row>
            </Container>
            {/* <div style={styles.imageContainer}>
                <img src="/blog-green-space-1.jpg" alt="Background" style= {{width: "100%"}}></img>
            </div> */}
        </>
        
    )
}