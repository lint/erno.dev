
import React from 'react';
import BasePage from '../../components/layout/base_page';
import ToolbarNavItems from '../../components/navbar/toolbar_nav_items';

export default function HomePage() {

    return (
        <BasePage
            left_toolbar_items={<ToolbarNavItems />}
            right_toolbar_items={<div></div>}
            page_content={<></>}
        />
    );
}
