import React from 'react'
import { Row } from 'react-bootstrap'
import { useQuery } from 'react-query'
import Wrapper from '../components/Wrapper'
import { ProjectViewCard } from '../components/Reader/ProjectViewCard'
import apiUrl from '../utils/apiUrl'

const ProjectBrowser = () => {
    const { isLoading, isError, data } = useQuery('allProjects', () =>
        fetch(`${apiUrl}/view/projects`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(res => res.json())
    )

    if (isLoading) return (<p>Loading ....</p>)

    if (isError) return (<p>Errored.</p>)

    const { projects } = data

    return (
        <Wrapper>
            <h1>Browse public projects</h1>
            <p>Explore projects posted by other users!</p>
            <Row xs={1} md={1} className="mx-2">
                {
                    projects.map(project => {
                        return <ProjectViewCard project={project} key={project._id}/>
                    })
                }
            </Row>
        </Wrapper>
    )
}

export default ProjectBrowser



