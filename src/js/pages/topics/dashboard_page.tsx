
import React, { useState, useEffect } from 'react';
import TopicDashboard, { TopicDashboardRightToolbarItems } from '../../components/topics/dashboard';
import ToolbarNavItems from '../../components/navbar/toolbar_nav_items';
import BasePage from '../base_page';
import { getCookie, setCookie } from '../../util/cookies';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function TopicsDashboardPage() {

    const getTopics = async () => {
        const {data, errors} = await client.models.Topic.list();

        if (errors != null) {
            console.log("Errors ", errors);
            return;
        }
        setTopics(data);
    }

    useEffect(() => { getTopics() }, []);

    let is_grid_cookie = getCookie("dashboard-grid-view-enabled");
    const [is_grid_view, set_is_grid_view] = useState((is_grid_cookie == null || is_grid_cookie === "true"));
    const [topics, setTopics] = useState(Array(0));

    function handle_view_mode(event: React.MouseEvent<HTMLButtonElement>) {
        const button: HTMLButtonElement = event.currentTarget;
        let new_is_grid_view = button.textContent === "grid";
        set_is_grid_view(new_is_grid_view);
        setCookie("dashboard-grid-view-enabled", new_is_grid_view ? "true" : "false", 365);
    }

    return (
        <BasePage
            left_toolbar_items={<ToolbarNavItems />}
            right_toolbar_items={<TopicDashboardRightToolbarItems is_grid_view={is_grid_view} view_mode_callback={handle_view_mode} />}
            page_content={<TopicDashboard is_grid_view={is_grid_view} topics={topics} />} 
        />
    );
}
