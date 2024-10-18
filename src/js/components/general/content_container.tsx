
import React from 'react';
import ContentHeader from './content_header';

export interface ContentContainerProps {
    children: React.ReactElement;
    header_text: string;
}

export default function ContentContainer({ children, header_text }: ContentContainerProps) {

    return (
        <div className="content-container">
            <ContentHeader text={header_text} />
            {children}
        </div>
    );
}
