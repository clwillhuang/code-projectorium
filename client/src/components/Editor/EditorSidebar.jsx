import React from "react";
import { Button } from "react-bootstrap";
import { MdAdd } from "react-icons/md";
import { useQueryClient } from "react-query";
import * as styles from './EditorSidebar.module.css'

const EditorSidebar = ({ projectId, pages, selectedPageId, onChangePageId }) => {
    const queryClient = useQueryClient();

    const selectPageId = (pageId) => {
        onChangePageId(pageId);
    }

    const createPage = () => {
        const formData = {
            title: `New page`
        }

        fetch(`http://localhost:5000/projects/${projectId}/pages`, {
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
                if (res.ok) return res.json();
                // TODO: Show an error screen if request failed
                else throw new Error(`Error ${res.status}: ${res.statusText}.`)
            })
            .then(res => {
                selectPageId(res._id);
                queryClient.invalidateQueries({ queryKey: `retrieve-project-${projectId}` });
                queryClient.invalidateQueries({ queryKey: `retrieve-${selectedPageId}` });
            })
            .catch(err => console.log(err));
    }

    return (
        <div className={styles.pageSidebar}>
            <h4>Pages</h4>
            <Button className={styles.addButton} onClick={createPage}><MdAdd/>Create a new page</Button>
            {
                pages.length > 0 &&
                <div className={styles.linkList}>
                    {
                        pages.map((page, index) =>
                            selectedPageId === page._id ?
                                <p className={styles.pageLinkSelected} key={page._id}>{page.title}</p>
                                :
                                <button className={styles.pageLink} key={page._id} onClick={() => selectPageId(page._id)}>{page.title}</button>

                        )
                    }
                </div>
            }
        </div>
    )
}

export default EditorSidebar;