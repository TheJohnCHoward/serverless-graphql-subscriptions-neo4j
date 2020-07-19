Example integration of [serverless-graphql-subscriptions](https://github.com/AlpacaGoesCrazy/serverless-graphql-subscriptions) with [neo4j-graphql-js](https://github.com/neo4j-graphql/neo4j-graphql-js). Replace values in .env.example for the server and client before running each respectively.

After publishing a message, subscribers are alerted and the message is also persisted to a Neo4j database with a relationship to the publishing user.

**Warning:** The augmented schema generated by neo4j-graphql-js currently breaks serverless-offline, preventing offline testing. I was unable to resolve this error in the time I had, but will attempt to look into it further.