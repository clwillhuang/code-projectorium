import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import ErrorMessage from "../ErrorMessage";
import { MdEdit, MdSave, MdAdd, MdDelete } from "react-icons/md"
import { Button, Form } from "react-bootstrap";
import * as styles from './PageEditor.module.css'
import SnippetCard from "../SnippetCard";
import SnippetEditorCard from "./SnippetEditorCard";
import EditableTitle from "./EditableTitle";
import PageControls from "../PageControls";


const PageEditor = ({ id, onPreviousPage, onNextPage }) => {

    const pageTitleElementId = 'pageTitle';
    const queryClient = useQueryClient();
    const allSnippetsQueryKey = `retrieve-page-${id}`
    const url = `http://localhost:5000/pages/${id}`

    const [editTitle, setEditTitle] = useState(false);

    // retrieve data about this page
    const { isLoading, isError, error, data } = useQuery(allSnippetsQueryKey,
        () => fetch(url, {
            mode: 'cors',
            credentials: 'include',
        })
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }
            }).catch(err => {
                console.log(err)
                throw err;
            }),
        {
            retry: false,
            refetchOnWindowFocus: false,
            onSuccess: (data) => {
                setEditTitle(false);
            },
            enabled: !!id
        });

    // update the page title 
    const patchPageMutation = useMutation({
        mutationFn: newData => {
            fetch(`http://localhost:5000/pages/${id}`, {
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
                    queryClient.invalidateQueries({ queryKey: `retrieve-project-${data.project}` });
                    queryClient.invalidateQueries({ queryKey: allSnippetsQueryKey });
                    setEditTitle(false);
                    return res;
                })
                .catch(err => console.log(err));
        },
    })


    // delete this page
    const deletePageMutation = useMutation({
        mutationFn: () => {
            fetch(`http://localhost:5000/pages/${id}`, {
                method: 'DELETE',
                mode: 'cors',
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            })
                .then(res => {
                    if (res.ok) {
                        queryClient.invalidateQueries({ queryKey: `retrieve-project-${data.project}` });
                    } else {
                        throw new Error(`Error ${res.status}: ${res.statusText}.`)
                    }
                })
                .catch(err => console.log(err));
        },

    })

    const deletePage = () => {
        if (!deletePageMutation.isLoading) {
            deletePageMutation.mutate();
        }
    }

    // create a new snippet
    const createSnippet = () => {
        const formData = {
            markdown: '',
            code: '',
        }

        fetch(`http://localhost:5000/pages/${id}/snippets`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (res.ok) {
                    queryClient.invalidateQueries({ queryKey: allSnippetsQueryKey });
                } else {
                    throw new Error(`Error ${res.status}: ${res.statusText}.`)
                }
            })
            .catch(err => console.log(err));
    }

    const saveTitle = (title) => {
        const formData = { title: title }
        patchPageMutation.mutate(formData);
    }

    if (!id) {
        return (
            <div className={styles.pageEditor}>
                <p>Create a new page or select an existing one from the sidebar to start editing.</p>
            </div>)
    }

    if (isLoading || patchPageMutation.isLoading || deletePageMutation.isLoading) return (<p>Loading ... </p>);

    if (isError) return (<ErrorMessage error={error} />);

    const { title, snippets } = data;

    return (
        <div className={styles.viewport}>
            <div className={styles.pageEditor}>
                <EditableTitle title={title} titleComponent='h2' onSaveClick={saveTitle} uniqueElementId="pageEdit" />
                <div className={styles.buttonRow}>
                    {<Button onClick={createSnippet} variant="success"><MdAdd /> Add new snippet</Button>}
                    {<Button onClick={deletePage} variant="danger"><MdDelete />Delete page</Button>}
                </div>
                <div className={styles.snippetList}>
                    {
                        snippets.length > 0 ?
                            <div>
                                {snippets.map(snippet => <SnippetCard RenderComponent={SnippetEditorCard} key={snippet._id} snippetId={snippet._id} parentQueryKey={allSnippetsQueryKey} />)}
                            </div>
                            :
                            <p className={styles.emptyMessage}>
                                This page has no snippets yet. Add a snippet to start adding content.
                            </p>
                    }
                </div>
                <PageControls onNextPage={onNextPage} onPreviousPage={onPreviousPage} />
            </div>
        </div>
    )
}

export default PageEditor;