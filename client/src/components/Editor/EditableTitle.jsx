import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { MdEdit, MdSave } from "react-icons/md";
import * as styles from './EditableTitle.module.css'

// TitleComponent: The header JSX component to render (e.g.: h1, h2)
// title: A string of the title 
// onSaveClick: A callback function taking the submitted new title string as its only parameter
const EditableTitle = ({ titleComponent, title, onSaveClick, uniqueElementId}) => {
    const [isEdit, setIsEdit] = useState(false);

    const saveTitle = () => {
        if (typeof document === 'undefined') {
            return;
        }
        title = document.getElementById(uniqueElementId).value
        onSaveClick(title)
        setIsEdit(false);
    }

    if (isEdit) {
        return(
            <Form className={styles.titleForm}>
            <div className={styles.titleEditor}>
                <Form.Label>Rename</Form.Label>
                <Form.Control className='text-light bg-dark' id={uniqueElementId} type='text' defaultValue={title}></Form.Control>
                <Button variant="success" onClick={saveTitle}>
                    <MdSave /> Save
                </Button>
            </div>
        </Form>
        )
    } else {
        return(
            React.createElement(titleComponent, {className: styles.title, onClick: () => setIsEdit(true)}, title, <MdEdit/>)
        )
    }
}

export default EditableTitle;