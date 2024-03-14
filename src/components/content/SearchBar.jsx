import { useState, useContext } from "react"
import { Form, Button, Row, Col } from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro"
import { LocationContext } from "../context/LocationContext"
import "./weather.css"

export default function SearchBar(props) {
    const [searchLocation, setSearchLocation] = useState("");
    const [location, setLocation] = useContext(LocationContext)
    const handleSearch = () => {
        // change context only when search is executed
        setLocation(searchLocation)
    }

    const handleKeyPress = (event) => {
        //console.log(event.key)
        if (event.key === "Enter"){
            event.preventDefault(); // page doesn't rerender every time we press "return"
            handleSearch();
        }
    }
    return (
        <Row className="justify-content-center align-items-center noGutters">
            <Col xs = {12} sm = {12} md = {12} lg = {9} xl = {8}>
                <Row className="g-0">
                    <Form className="d-flex text-center"
                        onKeyPress={handleKeyPress}
                    >
                        <Col xs = {11} sm = {11} md = {11} lg = {11} xl = {11}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder = "Enter address, city, or zip code here"
                                    value = {searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    style = {styles.inputTextBox}
                                    id = "location"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs = {1} sm = {1} md = {1} lg = {1} xl = {1}>
                            <Button 
                                onClick={handleSearch} 
                                // style = {styles.searchButton}
                                className="submitBtn"
                                >
                                <FontAwesomeIcon icon={solid("magnifying-glass")} />
                            </Button>
                        </Col>
                    </Form>
                </Row>
            </Col>
        </Row>
    );
}

const styles = {
    searchButton: {
        backgroundColor: "#576b4e"
    },
    inputTextBox: {
        backgroundColor: "#fbfcfc"
        // #e2e6e4
    }
}