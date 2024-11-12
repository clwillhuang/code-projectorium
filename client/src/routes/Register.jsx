import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Wrapper from '../components/Wrapper';
import * as styles from './Login.module.css'
import apiUrl from '../utils/apiUrl';

export default function Register() {
    const redirectTimeout = 500;
    const [registerStatus, setRegisterStatus] = useState({
        status: undefined,
        usernameValid: true,
        emailValid: true,
        passwordValid: true,
        matches: true
    })
    const fetchOptions = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }

    const navigate = useNavigate();

    const onRegister = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const formData = {
            username: event.target.username.value,
            email: event.target.email.value,
            password: event.target.password.value
        }

        const validity = {
            ...registerStatus,
            usernameValid: event.target.username.value.length > 0,
            emailValid: event.target.email.value.length > 0,
            passwordValid: event.target.password.value.length > 0,
            matches: event.target.password.value === event.target.passwordConfirm.value
        }
        if (!validity.emailValid || !validity.passwordValid || !validity.usernameValid || !validity.matches) {
            setRegisterStatus(validity);
        }



        const url = `${apiUrl}/users/register`
        fetch(url, {
            ...fetchOptions,
            body: JSON.stringify(formData),
        })
            .then(res => res.json())
            .then(data => {
                const status = data.usernameValid && data.emailValid && data.passwordValid;
                setRegisterStatus({
                    ...data,
                    status: status,
                    matches: true
                });
                setTimeout(() => {
                    navigate('/projects')
                }, redirectTimeout)
            })
            .catch(err => {
                console.log(err);
            })
    }

    const registerFailed = () => {
        return (typeof registerStatus !== 'undefined') && !registerStatus
    }

    const resetRegisterStatus = () => {
        setRegisterStatus({
            status: undefined,
            usernameValid: true,
            emailValid: true,
            passwordValid: true,
            matches: true
        })
    }

    return (
        <Wrapper margin='0' style={{ maxHeight: '100%' }}>
            <div className={styles.container}>
                <h1>Register for an account</h1>
                <Modal show={registerFailed()} onHide={resetRegisterStatus}>
                    <Modal.Body>Registration failed.</Modal.Body>
                </Modal>
                <Modal show={registerStatus.status} onHide={resetRegisterStatus}>
                    <Modal.Body>Registration success.</Modal.Body>
                </Modal>
                <Form onSubmit={onRegister} className={styles.form}>
                    <Form.Group className='text-light'>
                        <Form.Label>Username</Form.Label>
                        <Form.Control required isInvalid={!registerStatus.usernameValid} name='username' type='text' className='bg-dark text-light'></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            Username must be at least 3 characters long and not already taken.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className='text-light'>
                        <Form.Label>Email</Form.Label>
                        <Form.Control required isInvalid={!registerStatus.emailValid} name='email' type='email' className='bg-dark text-light'></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            Email is invalid or already taken.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className='text-light'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control required isInvalid={!registerStatus.passwordValid} name='password' type='password' className='bg-dark text-light'></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            Must 8-16 characters long. With at least one lowercase letter, one uppercase letter, and one digit. Characters !@#$%^&* also allowed.
                        </Form.Control.Feedback>
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control required isInvalid={!registerStatus.matches} name='passwordConfirm' type='password' className='bg-dark text-light'></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            Passwords do not match.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button className={styles.submitButton} type='submit'>Register</Button>
                </Form>
                <Link className={styles.link} to='/login'>Already have an account? Login here.</Link>
            </div>
        </Wrapper>
    );
}



