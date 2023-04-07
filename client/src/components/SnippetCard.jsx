import React from 'react';
import { useQuery } from 'react-query'

// Fetch data, and pass it to the appropriate components
export default function SnippetCard({ RenderComponent, snippetId, ...props }) {
    const url = `http://localhost:5000/view/snippets/${snippetId}`;
    // key to load the current snippet
    const loadSnippetQueryKey = `load-snippet-${snippetId}`;

    const { isLoading, isError, error, data } = useQuery(loadSnippetQueryKey,
        () => fetch(url)
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            })
            .catch(err => {
                console.log(err)
                throw err;
            }),
        {
            retry: false,
            refetchOnWindowFocus: false,
            initialData: {
                markdown: '',
                code: '',
                language: 'plaintext',
                showMarkdown: true,
                showCode: true,
                comments: []
            }
        });

    if (isLoading) {
        return (<p>Loading snippet ...</p>)
    }

    if (isError) {
        return (<p>Encountered unexpected error loading snippet.</p>)
    }

    return (
        <RenderComponent
            {...props}
            model={data}
            madeChanges={false}
            snippetId={snippetId}
            loadSnippetQueryKey={loadSnippetQueryKey}
        />
    );
}

