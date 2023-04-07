import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import ErrorMessage from "../ErrorMessage";
import PageControls from "../PageControls";
import SnippetCard from "../SnippetCard";
import * as styles from './PageReader.module.css'
import SnippetReaderCard from "./SnippetReaderCard";

const PageReader = ({ id, onPreviousPage, onNextPage }) => {
    const allSnippetsQueryKey = `retrieve-page-${id}`
    const url = `http://localhost:5000/view/pages/${id}`

    // retrieve all snippets under this page
    const { isLoading, isError, error, data } = useQuery(allSnippetsQueryKey,
        () => fetch(url)
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
            enabled: !!id
        });

    if (!id) {
        return (
            <div className={styles.pageEditor}>
                <p>Select a page to begin reading</p>
            </div>)
    }

    if (isLoading) return (<p>Loading ... </p>);

    if (isError) return (<ErrorMessage error={error} />);

    const { title, snippets } = data;

    return (
        <div className={styles.pageEditor}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.snippetList}>
                {
                    snippets.length > 0 ?
                        <div>
                            {snippets.map(snippet => <SnippetCard RenderComponent={SnippetReaderCard} key={snippet._id} snippetId={snippet._id} parentQueryKey={allSnippetsQueryKey} />)}
                        </div>
                        :
                        <p className={styles.emptyMessage}>
                            This page has no snippets yet.
                        </p>
                }
            </div>
            <PageControls onNextPage={onNextPage} onPreviousPage={onPreviousPage}/>
        </div>
    )
}

export default PageReader;