import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CreateProjectModal = ({ modalShow, closeModal }) => {

    const navigate = useNavigate();

    function handleSubmit(e) {
        const formData = {
            name: e.target.name.value,
            description: e.target.description.value
        }
        e.preventDefault();
        e.stopPropagation();

        fetch('http://localhost:5000/projects', {
            mode: 'cors',
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (res.ok) return res.json();
                // TODO: Show an error screen if request failed
                else throw new Error(`Error ${res.status}: ${res.statusText}.`)
            })
            .then((data) =>
                navigate(`/projects/${data._id}/edit`)
            )
            .catch(err => console.log(err));
    }

    return (
        <div>
            <Modal show={modalShow} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a new Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="createProjectForm" onSubmit={handleSubmit}>
                        <Form.Group controlId="projectName" className="py-2">
                            <Form.Label>Project name</Form.Label>
                            <Form.Control name="name" required type="text" placeholder="Enter project name" />
                            <Form.Control.Feedback type="invalid">A unique project name is required.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="projectDescription" className="py-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control name="description" required type="textarea" placeholder="Describe your project here." rows={3} />
                            <Form.Control.Feedback type="invalid">A description is required.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="py-2">
                            <Button variant="primary" type="submit">Submit</Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>);
}

export default CreateProjectModal;
