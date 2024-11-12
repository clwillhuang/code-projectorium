import MDEditor from '@uiw/react-md-editor';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { MdCancel, MdComment, MdSend } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import * as styles from './CommentCreator.module.css'
import apiUrl from '../../utils/apiUrl';

export default function CommentCreator({ snippetId }) {

    const queryClient = useQueryClient();
    const [isTypingComment, setIsTypingComment] = useState(false);
    const [markdown, setMarkdown] = useState('')

    const url = `${apiUrl}/snippets/${snippetId}/comments`
    const postCommentMutation = useMutation({
        mutationFn: (formData) => fetch(url, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(formData),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }),
        retry: false,
        onSuccess: () => {
            // invalidate the query for the entire page
            queryClient.invalidateQueries({ queryKey: `retrieve-page-${snippetId}` })
            setIsTypingComment(false);
        }
    })

    const userUrl = `${apiUrl}/user`
    // Fetch user information
    const { isLoading, isError, data } = useQuery(`fetch-current-user`,
        () => fetch(userUrl, {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
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

    const { isAuthenticated } = data;

    if (isLoading) {
        return <div></div>
    }

    if (isError) {
        return <div><p>Commenting service unavailable</p></div>
    }

    if (!isAuthenticated) {
        return <div>
            <Link to='/login'>Sign-in to comment</Link>
        </div>
    }

    if (isTypingComment) {
        return (
            <div>
                <Form>
                    <div className="wmde-markdown-var" />
                    <MDEditor value={markdown}
                        onChange={(value) => setMarkdown(value)}
                        preview='edit'
                        height="300px" />
                    <div className={styles.buttonRow}>
                        <Button variant="danger" onClick={() => setIsTypingComment(false)}><MdCancel />Cancel</Button>
                        <Button variant="success" onClick={() => postCommentMutation.mutate({ markdown: markdown })}><MdSend />Post </Button>
                    </div>
                </Form>
            </div>
        )
    } else {
        return <div>
            <Button onClick={() => setIsTypingComment(true)}>
                <MdComment />Add a comment</Button>
        </div>
    }
}

