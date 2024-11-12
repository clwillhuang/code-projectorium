import React, { useState } from 'react';
import { Button, Card, Form, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Wrapper from '../components/Wrapper';
import * as styles from './Login.module.css'
import apiUrl from '../utils/apiUrl';

export default function Login() {
    const redirectTimeout = 500;
    const [loginStatus, setLoginStatus] = useState(undefined);
    const navigate = useNavigate();

    const onLogin = (event) => {
        const formData = {
            username: event.target.username.value,
            password: event.target.password.value
        }
        event.preventDefault();
        event.stopPropagation();

        const url = `${apiUrl}/users/login`
        fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData),
        })
            .then(res => {
                if (res.ok) {
                    setLoginStatus(true);
                    setTimeout(() => {
                        navigate('/projects')
                    }, redirectTimeout)
                    return res.json();
                } else {
                    setLoginStatus(false);
                    throw new Error(res);
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    const loginFailed = () => {
        return (typeof loginStatus !== 'undefined') && !loginStatus
    }

    return (
        <Wrapper margin='0' style={{ maxHeight: '100%' }}>
            <div className={styles.container}>
            <h1>Welcome back</h1>
                <Modal show={loginFailed()} onHide={() => setLoginStatus(undefined)}>
                    <Modal.Body>Login failed.</Modal.Body>
                </Modal>
                <Modal show={loginStatus} onHide={() => setLoginStatus(undefined)}>
                    <Modal.Body>Login success.</Modal.Body>
                </Modal>
                <Form onSubmit={onLogin} className={styles.form}>
                    <Form.Group className='text-light'>
                        <Form.Label>Username</Form.Label>
                        <Form.Control name='username' type='text' className='bg-dark text-light'></Form.Control>
                    </Form.Group>
                    <Form.Group className='text-light'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control name='password' type='password' className='bg-dark text-light'></Form.Control>
                    </Form.Group>
                    <Button className={styles.submitButton} type='submit'>Login</Button>
                </Form>
                <Link className={styles.link} to='/register'>Don't have an account? Register here.</Link>
            </div>
        </Wrapper>
    );
}



