import React, { useEffect, useState } from 'react';
import { Button, Card, Dropdown, Form } from 'react-bootstrap';
import { useMutation, useQueryClient } from 'react-query'
import MDEditor from '@uiw/react-md-editor';
import { MdSave, MdEdit, MdDelete } from 'react-icons/md'
import Editor from '@monaco-editor/react';
import SnippetRenderer from '../SnippetRenderCard';
import * as styles from './SnippetEditorCard.module.css'
import Languages from '../../utils/languageOptions'
import CommentDeleteCard from './CommentDeleteCard';
import CommentSection from '../CommentSection';

export default function SnippetEditorCard({ model, madeChanges, loadSnippetQueryKey, snippetId, parentQueryKey }) {
    const [isEdit, setIsEdit] = useState(false);
    const [editorValue, setEditorValue] = useState({ model, madeChanges });
    const url = `http://localhost:5000/snippets/${snippetId}`;

    // refresh state on receiving new code, markdown, madeChanges data
    useEffect(() => {
        setEditorValue({ model, madeChanges });
        setIsEdit(false);
    }, [model, madeChanges])

    const queryClient = useQueryClient();

    const saveMutation = useMutation({
        mutationFn: () => {
            fetch(url, {
                method: 'PATCH',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(editorValue.model),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
                .then(res => {
                    if (res.ok) {
                        setEditorValue({ model, madeChanges: false });
                        queryClient.invalidateQueries(loadSnippetQueryKey);
                        setIsEdit(false);
                    }
                    else throw new Error(`Error ${res.status}: ${res.statusText}.`)
                })
                .catch(err => console.log(err));
        }
    })

    const deleteMutation = useMutation({
        mutationFn: () => {
            fetch(url, {
                method: 'DELETE',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(res => {
                    if (res.ok) {
                        queryClient.invalidateQueries(parentQueryKey);
                    } else {
                        throw new Error(`Error ${res.status}: ${res.statusText}.`)
                    }
                })
                .catch(err => console.log(err));
        }
    })

    if (deleteMutation.isLoading) {
        return (<p>Snippet marked for deletion ... </p>)
    }

    const modelValue = editorValue.model

    return (<div data-color-mode="dark">
        <Card className={styles.card}>
            <Card.Header className={styles.header}>
                <div className={styles.headerButtons}>
                    {!isEdit &&
                        <Button variant="success" onClick={() => setIsEdit(true)}>
                            <MdEdit />Edit
                        </Button>}
                    {isEdit &&
                        <Button onClick={() => saveMutation.mutate()}>
                            <MdSave />Save
                        </Button>}
                    {!isEdit &&
                        <Button variant="danger" onClick={() => deleteMutation.mutate()}>
                            <MdDelete />Delete
                        </Button>}
                </div>
            </Card.Header>
            <Card.Body>
                {isEdit ?
                    <div className={styles.body} data-color-mode="dark">
                        <Form>
                            <div className="wmde-markdown-var" />
                            <p>Markdown</p>
                            <MDEditor value={modelValue.markdown}
                                onChange={(value) => setEditorValue({ model: { ...modelValue, markdown: value }, madeChanges: true })}
                                preview='edit'
                                height="300px" />
                            <p>Code</p>

                            <Form.Select className='bg-dark text-light my-2 border-none' onChange={(event) => setEditorValue({ model: { ...modelValue, language: event.target.value }, madeChanges: true })}>
                                {Languages.map(language => <option key={language}>{language}</option>)}
                            </Form.Select>

                            <Editor
                                height="300px"
                                width="100%"
                                defaultLanguage='plaintext'
                                language={modelValue.language}
                                defaultValue={modelValue.code}
                                theme="vs-dark"
                                options={{
                                    readOnly: !isEdit,
                                    automaticLayout: true,
                                }}
                                onChange={(value) => setEditorValue({ model: { ...modelValue, code: value }, madeChanges: true })} />
                            {isEdit && <Button onClick={() => saveMutation.mutate()}>Save <MdSave /></Button>}
                        </Form>
                    </div>
                    :
                    <SnippetRenderer markdown={modelValue.markdown} code={modelValue.code} language={modelValue.language} />}
            </Card.Body>
            <Card.Body>
                <CommentSection comments={modelValue.comments} CommentComponent={CommentDeleteCard} snippetQueryKey={loadSnippetQueryKey} allowCommentCreation/>
            </Card.Body>
        </Card>
    </div>
    )
}

