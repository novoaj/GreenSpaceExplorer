import {Row, Col} from "react-bootstrap"
import "./weather.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro"

export default function DefaultHome(props){
    return (
        <Row className="justify-content-center align-items-center text-center">
            <Col className="defaultHomeContainer">
                <div className="defaultHome">
                    <div className="faIcon">
                        <FontAwesomeIcon icon={solid("magnifying-glass")} size="xl"/>
                    </div>
                    <h2>Welcome to Greenspace Explorer!</h2> 
                    <p>Search to get started</p>
                </div>
            
            </Col>
        </Row>
    )
}