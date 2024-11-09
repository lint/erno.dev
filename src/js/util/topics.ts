import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function createRatingsGridForTopic(topic : any, user : any) {
    // console.log("createRatingsGridForTopic topic: ", topic, "user: ", user);
    return [];
}

export function createUserNameListFromUsers(users: any) {
    console.log("createUserFromUsers users: ", users);
    return users.map((user: { name: any; }) => user.name ?? "test");
}

export async function getTopicUsers(topic: any) {
    
    const { data: users } = await client.models.Topic.get(
        { topic_id: topic.topic_id }, 
        { selectionSet: ["topic_id", "users.*"] },
    );
    
    return users;
}

export function getNextTopicId(topics: any[]) {

    let max_id = 0;

    topics.forEach(topic => {
        if (Number(topic.topic_id) > Number(max_id)) {
            max_id = Number(topic.topic_id);
        }
    });

    return max_id + 1;
}

export function getUniqueTopicName(topics: any[], name: string) {
    
    let max_iterations = 50;
    let i = 0;
    let foundUnusedName = false;
    while (!foundUnusedName && i < max_iterations) {
        foundUnusedName = true;
        topics.forEach(topic => {

            if (topic.name === name) {
                foundUnusedName = false;
                name += "*";
            }
        });
        i++;
    }

    return name;
}