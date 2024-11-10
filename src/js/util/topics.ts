import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function createRatingsGrid(subjects: any[], ratings: any[], numRows: number, numCols: number) {
    // console.log("createRatingsGridForTopic topic: ", topic, "user: ", user);

    // TODO, subject sorting options by input
    // subjects.sort((a, b) => a.attr.localeCompare(b.attr));

    let grid = [];

    function findRating(index: number, subjectName: string) {

        for (let rating of ratings) {
            if (rating.subject.name === subjectName && rating.index === String(index)) {
                return rating;
            }
        }

        return undefined;
    }

    for (let y = 0; y < numRows; y++) {

        let row: any[] = [];
        let subject = y-1 < subjects.length ? subjects[y-1] : undefined;
        let subjectName = subject ? subject.name : "Subject " + y;
        

        for (let x = 0; x < numCols; x++) {

            let cellContent = "";

            if (x === 0 && y !== 0) {
                cellContent = subjectName;
            } else if (y === 0 && x !== 0) {
                cellContent = String(x);
            } else {
                let foundRating = findRating(x-1, subjectName);
                if (foundRating) {
                    cellContent = foundRating.value;
                }
            }

            row.push(cellContent);
        }

        grid.push(row);
    }

    return grid;;
}

export function createUserNameListFromUsers(users: any) {
    return users.map((user: { name: any; }) => user.name ?? "test");
}

export async function getUsersForTopic(topic: any) {
    
    const { data: users } = await client.models.User.list({
        filter: {
            topic_id: {
                eq: topic.topic_id
            },
        }
    });
    
    return users;
}

export async function getUserRatingsForTopic(topic: any, user: any) {
    
    const { data: ratings } = await client.models.Rating.list({
        filter: {
            topic_id: {
                eq: topic.topic_id
            },
            user_id: {
                eq: user.user_id
            },
        }
    });
    
    return ratings;
}

export async function getRatingsForTopic(topic: any) {
    
    const { data: ratings } = await client.models.Rating.list({
        filter: {
            topic_id: {
                eq: topic.topic_id
            },
        }
    });
    
    return ratings;
}

export async function getSubjectsForTopic(topic: any) {

    const { data: ratings } = await client.models.Subject.list({
        filter: {
            topic_id: {
                eq: topic.topic_id
            },
        }
    });
    
    return ratings;
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
