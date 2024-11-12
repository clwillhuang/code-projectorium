import React, { useState } from 'react'
import { Button, ButtonToolbar, Row } from 'react-bootstrap'
import { useQuery } from 'react-query'
import CreateProjectModal from '../components/Editor/CreateProjectModal'
import Wrapper from '../components/Wrapper'
import { ProjectEditCard } from '../components/Editor/ProjectEditCard'
import apiUrl from '../utils/apiUrl'

const Projects = () => {
    const [modalShow, setModalShow] = useState(false);

    const { isLoading, isError, error, data } = useQuery('allProjects', () =>
        fetch(`${apiUrl}/projects`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        }).then(res =>
            res.json()
        )
    )

    if (isLoading) return (<p>Loading ....</p>)

    if (isError) return (<p>Errored.</p>)

    const { projects, username } = data

    const closeModal = () => {
        setModalShow(false);
    }

    return (
        <Wrapper>
            <h1>Welcome, {username}</h1>
            <CreateProjectModal {...{ modalShow, closeModal }} />
            <ButtonToolbar>
                <Button onClick={() => setModalShow(!modalShow)}>Create new project</Button>
            </ButtonToolbar>
            {
                projects.length > 0
                    ?
                    <div className='my-5'>
                        <p className='mt-4'>View your projects:</p>
                        <Row xs={1} md={1} className="mx-2 g-1">
                            {
                                projects.map(project => {
                                    return <ProjectEditCard project={project} key={project._id} />
                                })
                            }
                        </Row>
                    </div>
                    :
                    <div className='my-5'>
                        <p>Uh-oh, you don't have any projects yet! Start making one by clicking the button above.</p>
                    </div>
            }
        </Wrapper>
    )
}

export default Projects



