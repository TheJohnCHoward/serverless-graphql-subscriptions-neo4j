import { makeAugmentedSchema } from 'neo4j-graphql-js'
import { ApolloServer, gql } from 'apollo-server-lambda'
import neo4j from 'neo4j-driver'
import publish from './utils/publish'
import subscribe from './utils/subscribe'

const typeDefs = gql`
	type Query {
		_: String
	}
	type Mutation {
		sendMessage(message: String!): String
	}
	type Subscription {
		listenMessage: String
	}
	type Message {
		id: String!,
		text: String!,
		author: [User] @relation(name: "AUTHORED", direction: "IN"),
		similar(first: Int = 3): [Message]
       		@cypher(statement:"MATCH (this)<-[:AUTHORED]-(:User)-[:AUTHORED]->(message:Message) RETURN message, COUNT(*) ORDER BY COUNT(*) DESC")
	}
	type User {
		id: String!,
		username: String!,
		messages: [Message] @relation(name: "AUTHORED", direction: "OUT")
	}
`

const resolvers = {
	Mutation: {
		sendMessage: async (root, { message }) => {
			await publish('MY_TOPIC', { listenMessage: message })
			return message
		}
	},
	Subscription: {
		listenMessage: {
			subscribe: subscribe('MY_TOPIC')
		}
	}
}

export const schema = makeAugmentedSchema({
	typeDefs,
	resolvers
})

const config = {
	logging: neo4j.logging.console('debug')
}

const driver = neo4j.driver(
	process.env.NEO4J_ENDPOINT,
	neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
	config
)

const server = new ApolloServer({ 
	schema, 
	context: { driver }
})

export const handler = server.createHandler({
	cors: {
		origin: '*',
		credentials: true,
	}
})