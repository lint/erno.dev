
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Topic: a
    .model({
      topic_id: a.id().required(),
      name: a.string(),
      input_num_users: a.integer(),
      input_num_entries: a.integer(),
      input_num_subjects: a.integer(),
      ratings: a.hasMany("Rating", "topic_id"),
      subjects: a.hasMany("Subject", "topic_id"),
      users: a.hasMany("User", "topic_id"),
    })
    .identifier(["topic_id"]),
  Subject: a
    .model({
      subject_id: a.id().required(),
      name: a.string(),
      topic_id: a.id(),
      topic: a.belongsTo("Topic", "topic_id"),
      ratings: a.hasMany("Rating", "subject_id"),
    })
    .identifier(["subject_id"]),
  Rating: a
    .model({
      rating_id: a.id().required(),
      value: a.integer(),
      index: a.integer(),
      topic_id: a.id(),
      subject_id: a.id(),
      user_id: a.id(),
      topic: a.belongsTo("Topic", "topic_id"),
      subject: a.belongsTo("Subject", "subject_id"),
      user: a.belongsTo("User", "user_id"),
    })
    .identifier(["rating_id"]),
  User: a
    .model({
      user_id: a.id().required(),
      name: a.string(),
      ratings: a.hasMany("Rating", "user_id"),
      topic_id: a.id(),
      topic: a.belongsTo("Topic", "topic_id"),
    })
    .identifier(["user_id"]),
})
.authorization((allow) => [allow.guest()]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
