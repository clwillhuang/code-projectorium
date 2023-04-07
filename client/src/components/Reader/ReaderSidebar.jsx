import React from "react";
import * as styles from '../Editor/EditorSidebar.module.css'

const ReaderSidebar = ({ pages, selectedPageId, onChangePageId }) => {

    const selectPageId = (pageId) => {
        onChangePageId(pageId);
    }

    return (
        <div className={styles.pageSidebar}>
            <h4>Contents</h4>
            {
                pages.length > 0
                    ?
                    <div className={styles.linkList}>
                        {
                            pages.map(page => {
                                return (
                                selectedPageId === page._id ?
                                    <p className={styles.pageLinkSelected} key={page._id}>{page.title}</p>
                                    :
                                    <button className={styles.pageLink} key={page._id} onClick={() => selectPageId(page._id)}>{page.title}</button>
                            )}
                            )
                        }
                    </div>
                    :
                    <p>This project has no pages!</p>
            }
        </div>
    )
}

export default ReaderSidebar;