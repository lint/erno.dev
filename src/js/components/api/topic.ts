
const topics = [
    {
        name: "topic 1",
        topic_id: "1",
    },
    {
        name: "topic 2",
        topic_id: "2",
    }
];

export default function GetTopics() {
    return topics;
}

export function TopicDoesExist(topic_id: string) {
    return topics.some(e => e.topic_id === topic_id);
}
