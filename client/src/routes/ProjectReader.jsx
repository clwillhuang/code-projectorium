// View a project from a end-user perspective
import React from 'react'
import { useQuery } from 'react-query'
import { useParams, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import PageReader from '../components/Reader/PageReader';
import ReaderSidebar from '../components/Reader/ReaderSidebar';
import Wrapper from '../components/Wrapper';
import * as styles from './ProjectDetail.module.css'

const ProjectReader = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageId = searchParams.get('pageId')
    const { projectId } = useParams();

    const url = `http://localhost:5000/view/projects/${projectId}`
    const queryString = `retrieve-project-${projectId}`

    const { isLoading, isError, error, data } = useQuery(queryString,
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
            refetchOnMount: false,
            retry: false,
            refetchOnWindowFocus: false,
            onSuccess: (newData) => {
                if (newData.pages.length > 0) {
                    if (typeof pageId === 'undefined' || !newData.pages.some(page => page._id === pageId)) {
                        setSearchParams({ pageId: newData.pages[0]._id});
                    }
                } else {
                    setSearchParams({})
                }
            }
        });

    if (isLoading) return (<p>Loading ... </p>);

    if (isError) return (<ErrorMessage error={error} />);

    const { name, description, username, pages } = data;

    const onChangePageId = (newPageId) => {
        if (typeof newPageId === 'undefined') {
            setSearchParams({})
        } else {
            setSearchParams({ pageId: newPageId });
        }
    }

    let goToPreviousPage, goToNextPage;
    const currIndex = pages.findIndex(page => page._id === pageId)
    if (currIndex > -1) {
        goToPreviousPage = currIndex === 0 ? undefined : () => { onChangePageId(pages[currIndex - 1]._id) }
        goToNextPage = currIndex === pages.length - 1 ? undefined : () => { onChangePageId(pages[currIndex + 1]._id) };
    }

    return (
        <Wrapper margin='0' style={{ maxHeight: '100%' }}>
            <div className={styles.header}>
                <h1>Project {name}</h1>
                <p>by {username}</p>
                <p>{description}</p>
            </div>
            <div className={styles.contentRow}>
                <ReaderSidebar pages={pages} selectedPageId={pageId} onChangePageId={onChangePageId} />
                <PageReader id={pageId} onNextPage={goToNextPage} onPreviousPage={goToPreviousPage}/>
            </div>
        </Wrapper>
    )
}

export default ProjectReader;