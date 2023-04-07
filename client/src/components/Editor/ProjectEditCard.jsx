import React from 'react';
import { Button, Card, Col } from 'react-bootstrap';
import { MdDelete, MdEdit, MdPublic, MdPublicOff} from 'react-icons/md';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import * as styles from './ProjectEditCard.module.css'

export function ProjectEditCard({project}) {
    const { name, description, _id, published } = project;
    const navigate = useNavigate();

    const deleteProject = useMutation({
        mutationFn: () => {
            return fetch(`http://localhost:5000/projects/${projectId}`, {
                method: 'DELETE',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(res => {
                    if (res.ok) {
                        navigate('/projects');
                    } else {
                        throw new Error(`Error ${res.status}: ${res.statusText}.`);
                    }
                })
                .catch(err => console.log(err));
        },
    })

    return (
        <Col className='col-12 col-md-9'>
            <Card className={styles.card}>
                <Card.Body className={styles.body}>
                    <Card.Title>{name}</Card.Title>
                    {
                        published ?
                        <Card.Text><MdPublic/> Public project</Card.Text>
                        :
                        <Card.Text><MdPublicOff/> Private project </Card.Text>
                    }
                    <Card.Text>{description}</Card.Text>
                <Button onClick={() => navigate(`/projects/${_id}/edit`)}><MdEdit/> Edit</Button>
                <Button variant="danger" onClick={deleteProject}><MdDelete/> Delete</Button>
                </Card.Body>
            </Card>
        </Col>
    );
}
