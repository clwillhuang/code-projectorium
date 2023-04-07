import React from "react";
import Wrapper from "./Wrapper";

const ErrorMessage = ({error}) => {
    return(
        <Wrapper>
            <h1>{error.message}</h1>
            <p>An unexpected error occurred.</p>
        </Wrapper>
    )
}

export default ErrorMessage;