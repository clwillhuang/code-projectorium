import React from "react";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import * as styles from './PageControls.module.css'

const PageControls = ({ onPreviousPage, onNextPage }) => {
    return (
        <div className={styles.container}>
            <div className={styles.side}>
                {onPreviousPage && <button onClick={onPreviousPage}><MdArrowBack/>Previous page</button>}
            </div>
            <div className={styles.side}>
                {onNextPage && <button onClick={onNextPage}>Next page<MdArrowForward/> </button>}
            </div>
        </div>
    )
}

export default PageControls;