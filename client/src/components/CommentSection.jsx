import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import CommentCreator from './Reader/CommentCreator';
import * as styles from './CommentSection.module.css'

function CommentSection({ comments, CommentComponent, allowCommentCreation, snippetId, ...commentComponentProps }) {

    const [showComments, setShowComments] = useState(false);

    if (showComments) {
        return (
            <div className={styles.container}>
                <hr className={styles.divider} />
                <h4 className={styles.header}>Comments</h4>
                <div className={styles.parent}>
                    {comments.map(comment => <CommentComponent {...commentComponentProps} comment={comment} key={comment._id} />)}
                    {allowCommentCreation && <CommentCreator snippetId={snippetId} />}
                </div>
                <Button onClick={() => setShowComments(false)}>Hide comments</Button>
            </div>
        )
    } else if (comments.length > 0) {
        return (
            <div className={styles.container}>
                <Button style={{marginBottom: '15px'}} onClick={() => setShowComments(true)}>Show comments ({comments.length})</Button>
                {allowCommentCreation && <CommentCreator snippetId={snippetId} />}
            </div>
        )
    } else {
        return (
            <div className={styles.container}>
                <p>No comments yet.</p>
                {allowCommentCreation && <CommentCreator snippetId={snippetId} />}
            </div>
        )
    }
}

CommentSection.defaultProps = {
    comments: [],
    allowCommentCreation: false,
    commentComponentProps: {},
    snippetId: '',
}

export default CommentSection;



