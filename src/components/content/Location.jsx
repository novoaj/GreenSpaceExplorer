// import { Card, Heading, Text, View, useTheme, Button, ButtonGroup } from "@aws-amplify/ui-react";
import { Card, Button, Row, Col } from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useState } from "react";
import CreateComment from "./Modals/CreateComment";
import SeeMoreModal from "./Modals/SeeMoreModal";
import {toast} from "react-toastify";
import "./weather.css"
// https://stackoverflow.com/questions/55849635/how-to-change-the-primary-color-of-the-react-built-in-bootstrap#:~:text=1%20Answer&text=Update%20(Jan%202023)%3A%20You,the%20primary%20color%20of%20Bootstrap.&text=You%20can%20use%20this%20same,using%20it%20in%20your%20CSS.
//TODO: add buttons to add comment, or see comments/see more
// Add should pop up w modal, see more potentially pops up w modal w more about location and any related comments
export default function Location(props){

    let username = localStorage.getItem("username") // null if no item exists

    const [showCreateMessage, setShowCreateMessage] = useState(false) // not visible by default
    const handleShowMessage = () => {
        if (username !== null) {
            setShowCreateMessage(true)
        }else{
            loginAlert();
        }
        
    }
    const handleCloseMessage = () => setShowCreateMessage(false)
    
    const [seeMore, setSeeMore] = useState(false)
    const handleShowSeeMore = () => setSeeMore(true)
    const handleCloseSeeMore = () => setSeeMore(false)

    const isLoggedIn = username !== null
    const loginAlert = () => toast("You must be logged in to access this feature!");

    const styles= {
        card: {
            margin: "3px"
        },
        buttonGroup: {
            //justifyContent: "space-between"
        }
    }
    return (
        <Card 
            style={styles.card}
            //border="success"
            bg="light"
            text="dark">
            <Card.Body>
                <Card.Title>
                    {props.name}
                </Card.Title>
                <Card.Text>
                    {props.address}
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <Row style={styles.buttonGroup} xs={2}>
                    <Col sm={2}>
                        <Button
                            onClick={handleShowMessage}
                            className="modalBtn"
                            //disabled = {!isLoggedIn}
                            >
                            <FontAwesomeIcon icon={solid("comment")}></FontAwesomeIcon>
                            </Button>
                        <CreateComment 
                            show={showCreateMessage}
                            onHide={handleCloseMessage}
                            name = {props.name}
                            address = {props.address}
                            place_id = {props.place_id}
                            />
                    </Col>
                    <Col  sm={{ span: 3, offset: 4}}>
                        <Button
                            className="modalBtn"
                            onClick={handleShowSeeMore}
                            >
                                Explore
                            </Button>
                        <SeeMoreModal
                            show = {seeMore}
                            onHide={handleCloseSeeMore}
                            name = {props.name}
                            address = {props.address}
                            place_id = {props.place_id}
                        />
                    </Col>
                </Row>
            </Card.Footer>
        </Card>
    )
}