import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { MdDelete, MdLock, MdPublic, MdPublish, MdPublicOff, MdEdit } from "react-icons/md";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import * as styles from './EditorHeader.module.css'
import ProjectEditorModal from "./ProjectEditorModal";
import apiUrl from "../../utils/apiUrl";

const EditorHeader = ({ projectId, name, published, description }) => {

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showModal, setShowModal ] = useState(false);

    const deleteProject = useMutation({
        mutationFn: () => {
            return fetch(`${apiUrl}/projects/${projectId}`, {
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

    // update the page title 
    const patchProject = useMutation({
        mutationFn: newData => {
            return fetch(`${apiUrl}/projects/${projectId}`, {
                method: 'PATCH',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(newData),
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
                .then(res => {
                    const projectDetailQuery = `retrieve-project-${projectId}`
                    queryClient.invalidateQueries({ queryKey: projectDetailQuery });
                    return res;
                })
                .catch(err => console.log(err));
        },
    })

    const onSaveDetails = (formData) => {
        patchProject.mutate(formData); 
        setShowModal(false);
    }

    const togglePublish = () => {
        patchProject.mutate({ published: !published })
    }

    return (
        <div className={styles.header}>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <ProjectEditorModal initialData={{name, description}} onSubmit={onSaveDetails}/>
            </Modal>
            <div className={styles.headerText}>
                <h1 onClick={() => setShowModal(true)}>{name}<MdEdit/></h1>
                {/* <EditableTitle title={name} titleComponent='h1' onSaveClick={onSaveTitle} uniqueElementId="projectEdit" /> */}
                <p>{description}</p>
                {
                    published ?
                        <p><MdPublic /> Public (visible to all)</p>
                        :
                        <p><MdPublicOff /> Private (only visible to you)</p>
                }
            </div>
            <div className={styles.headerButton}>
                {
                    published ?
                        <Button onClick={togglePublish} variant="warning"><MdLock/>Unpublish</Button>
                        :
                        <Button onClick={togglePublish} variant="warning"><MdPublish/>Publish</Button>
                }
                <Button variant="danger" onClick={() => { deleteProject.mutate() }}><MdDelete />Delete</Button>
            </div>
        </div>
    )
}

export default EditorHeader;