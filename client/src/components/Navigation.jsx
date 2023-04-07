import React, { useState } from 'react'
import { Button, Container, Modal, Nav, Navbar } from 'react-bootstrap'
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import * as styles from "./Navigation.module.css"

const NavigationBar = () => {

    const url = `http://localhost:5000/user`
    const navigate = useNavigate();
    const [authError, setAuthError] = useState(undefined);

    const logout = () => {
        fetch(`http://localhost:5000/users/logout`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
        }).then(res => {
            if (res.ok) {
                navigate('/')
            } else {
                setAuthError("Failed to logout")
            }
        })
            .catch(error => {
                console.log(error);
                setAuthError("Failed to logout")
            })
    }

    const { isLoading, isError, error, data } = useQuery(`fetch-current-user`,
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
        });

    if (isLoading) {
        return <Navbar bg="dark" fixed="top" variant="dark" expand="lg" className={styles.navigationBar}>
            <Container>
                <Navbar.Brand href="#home">Code Projectorium</Navbar.Brand>
                <p>Loading ... </p>
            </Container>
        </Navbar>
    }

    const renderLogin = () => {
        if (isLoading) {
            return null;
        } else if (isError) {
            return <p>User service down</p>
        } else {
            const { isAuthenticated } = data;
            if (!isAuthenticated) {
                return (
                    <Nav>
                        <Nav.Link href='/login'>Login</Nav.Link>
                    </Nav>
                )
            } else {
                return (
                    <Nav>
                        <Navbar.Text className={styles.loginName}>Signed in as: {data.username}</Navbar.Text>
                        <Button onClick={logout}>Logout</Button>
                    </Nav>
                )
            }
        }
    };

    return <Navbar bg="dark" variant="dark" expand="lg" className={styles.navigationBar}>
        <Container>
            <Modal show={!!authError} onHide={() => setAuthError(undefined)}>
                <Modal.Body>{authError}</Modal.Body>
            </Modal>
            <Navbar.Brand href="#home">Code Projectorium</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link href='/'>Home</Nav.Link>
                    <Nav.Link href='/browse'>Browse Projects</Nav.Link>
                    {
                        !isError && data.isAuthenticated &&
                        <React.Fragment>
                            <Nav.Link href='/projects'>My Projects</Nav.Link>
                        </React.Fragment>
                    }
                </Nav>
                {renderLogin()}
            </Navbar.Collapse>
        </Container>
    </Navbar>

}

export default NavigationBar;