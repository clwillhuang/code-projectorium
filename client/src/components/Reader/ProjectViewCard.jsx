import React from 'react';
import { Button, Card, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as styles from '../Editor/ProjectEditCard.module.css'

export function ProjectViewCard({project}) {
    const { name, description, _id, username } = project;
    const navigate = useNavigate();

    return (
        <Col className='col-12 col-md-9'>
            <Card className={styles.card}>
                <Card.Body className={styles.body}>
                    <Card.Title>{name}</Card.Title>
                    by {username}
                    <Card.Text>{description}</Card.Text>
                    <Button onClick={() => navigate(`/projects/${_id}/view`)}>Read</Button>
                </Card.Body>
            </Card>
        </Col>
    );
}
