
const topics = [
    {
        name: "topic 1",
        topic_id: "1",
        num_users: 2,
        num_subjects: 6, 
        num_entries: 4,
    },
    {
        name: "topic 2",
        topic_id: "2",
        num_users: 2,
        num_subjects: 6, 
        num_entries: 4,
    }
];

export default function GetTopics() {
    return topics;
}

export function TopicDoesExist(topic_id: string) {
    return topics.some(e => e.topic_id === topic_id);
}

export function GetTopic(topic_id: string) {
    let match = topics.filter(e => e.topic_id === topic_id);
    return match.length > 0 ? match[0] : null;
}
