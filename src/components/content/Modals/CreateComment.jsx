import {Button, Form, Modal, InputGroup} from "react-bootstrap"
import { useState } from "react"
import "../weather.css"
import {toast} from "react-toastify";

export default function CreateComment(props){
    const [content, setContent] = useState("")

    const postFlagged = () => toast.info("comment flagged for inappropriate content, failed to post.");
    const postError = () => toast.warning("Server error (500), try again later");
    const postSuccess = () => toast.success("Comment posted");

    const postComment = async() => {
        try{
            let username = localStorage.getItem("username")
            console.log(username, content, props.place_id)
            const response = await fetch("/post-comment", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    place_id: props.place_id, 
                    user_id: username,
                    content: content
                })
            })
            const response_json = await response.json()
            console.log(response_json)
            if (response.ok) {
                postSuccess(); 
            }else if(response.status === 403){ // 403 is content moderation
                postFlagged();
            }else{ // server error (500)
                postError();
            }
        }catch (error) {
            console.error("error posting comment")
        }
        setContent("")
        props.onHide()
    }
    return (
        <Modal
            {...props}
            size = "lg"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    {props.address}
                </p>
                <Form onSubmit={postComment}>
                    <InputGroup>
                        <Form.Control 
                            as="textarea"
                            placeholder="Enter comment here"
                            value = {content}
                            onChange={(e) => setContent(e.target.value)}
                            />
                    </InputGroup>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    onClick={postComment}
                    className="submitBtn">
                    Post
                </Button>
            </Modal.Footer>
        </Modal>
    )
}