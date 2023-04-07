import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import * as styles from './SnippetRenderCard.module.css'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SnippetRenderer({ code, markdown, language }) {
    return (
        <div className={styles.body} data-color-mode="dark">
            <div className={`wmde-markdown-var`}/>
            <MarkdownPreview source={markdown} className={styles.markdown}/>
            {code &&
            <React.Fragment>
                <SyntaxHighlighter language={language} style={vscDarkPlus}>
                    {code}
                </SyntaxHighlighter>
                <em style={{fontSize: '0.8em'}}>({language})</em>
                </React.Fragment>
            }
        </div>
    );
}



