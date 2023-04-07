// Modal to edit description and title
import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const ProjectEditorModal = ({ initialData, onSubmit }) => {

    const { description, name } = initialData;

    function handleSubmit(e) {
        const formData = {
            name: e.target.name.value,
            description: e.target.description.value
        }
        e.preventDefault();
        e.stopPropagation();

        onSubmit(formData)
    }

    return (
        <React.Fragment>
            <Modal.Header closeButton>
                <Modal.Title>Edit project details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="editProjectForm" onSubmit={handleSubmit}>
                    <Form.Group controlId="projectName" className="py-2">
                        <Form.Label>Project name</Form.Label>
                        <Form.Control name="name" required type="text" placeholder="Enter project name" defaultValue={name}/>
                        <Form.Control.Feedback type="invalid">A unique project name is required.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="projectDescription" className="py-2">
                        <Form.Label>Description</Form.Label>
                        <Form.Control name="description" required type="textarea" placeholder="Describe your project here." rows={3} defaultValue={description} />
                        <Form.Control.Feedback type="invalid">A description is required.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="py-2">
                        <Button variant="primary" type="submit">Submit</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
        </React.Fragment>
    );
}

export default ProjectEditorModal;
