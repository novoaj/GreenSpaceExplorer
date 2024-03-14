import { Card } from "react-bootstrap";

export default function Comment(props){

    return (
        <Card>
            <Card.Body>
                <Card.Title>
                    {props.username}
                </Card.Title>
                <Card.Text>
                    {props.content}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}