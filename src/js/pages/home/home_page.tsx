
import React from 'react';
import BasePage from '../../components/layout/base_page';
import ToolbarItem from '../../components/toolbar/toolbar_item';

export default function HomePage() {

    return (
        <BasePage
            left_toolbar_items={<ToolbarItem text="Topics" url="/topics" callback={()=>{}}/>}
            right_toolbar_items={<div></div>}
            page_content={<></>}
        />
    );
}
