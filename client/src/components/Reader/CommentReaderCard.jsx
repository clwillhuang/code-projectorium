import React, { useEffect } from "react";
import MarkdownPreview from '@uiw/react-markdown-preview';
import * as styles from './CommentReaderCard.module.css'

// Render a card that shows a comment to the project editor, allowing the user to delete the card
const CommentReaderCard = ({comment}) => {
    let { username, markdown, posted } = comment;
    let dateTimeRenderer = new Intl.DateTimeFormat('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    })

    if (!username) {
        username = 'Deleted user'
    }
    
    return(
        <div className={styles.parent}>
            <p className={styles.header}><code>{username}</code> at {dateTimeRenderer.format(Date.parse(posted))} commented:
            </p>
            <MarkdownPreview source={markdown}/>
        </div>
    )
}

export default CommentReaderCard;