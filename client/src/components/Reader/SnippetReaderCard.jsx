import React from 'react';
import { Card } from 'react-bootstrap';
import CommentSection from '../CommentSection';
import SnippetRenderer from '../SnippetRenderCard';
import CommentReaderCard from './CommentReaderCard';
import * as styles from './SnippetReaderCard.module.css'

export default function SnippetReaderCard({ model }) {
    const { code, markdown, language, comments, _id } = model;

    return (
        <div data-color-mode="dark">
            <Card className={styles.card}>
                <Card.Body>
                    <SnippetRenderer {...{ code, markdown, language }} />
                </Card.Body>
                <Card.Body>
                    <CommentSection comments={comments} CommentComponent={CommentReaderCard} allowCommentCreation snippetId={_id}/>
                </Card.Body>
            </Card>
        </div>
    )
}

