import React from "react"
import NavigationBar from "./Navigation"
import * as styles from "./Wrapper.module.css"

const Wrapper = ({children, margin}) => {
    return (
        <div className={styles.background}>
            <NavigationBar/>
            <div className={styles.wrapper}>
                {children}
            </div>
        </div>
    )
}

export default Wrapper;