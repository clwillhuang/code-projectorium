import React from "react";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Button } from "react-bootstrap";
import { MdDelete } from "react-icons/md";
import * as styles from '../Reader/CommentReaderCard.module.css'
import { useQueryClient } from "react-query";
import apiUrl from "../../utils/apiUrl";

// Render a card that shows a comment to the project editor, allowing the user to delete the card
const CommentDeleteCard = ({comment, snippetQueryKey }) => {
    const queryClient = useQueryClient();
    let { username, markdown, posted, _id } = comment;
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

    const deleteComment = () => {
        fetch(`${apiUrl}/comments/${_id}`, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            queryClient.invalidateQueries({queryKey: snippetQueryKey})
        })
    }

    return(
        <div className={styles.parent}>
            <p className={styles.header}><code>{username}</code> at {dateTimeRenderer.format(Date.parse(posted))} commented:
            </p>
            <MarkdownPreview source={markdown}/>
            <Button onClick={() => deleteComment()} variant='danger'><MdDelete/>Delete comment</Button>
        </div>
    )
}

export default CommentDeleteCard;