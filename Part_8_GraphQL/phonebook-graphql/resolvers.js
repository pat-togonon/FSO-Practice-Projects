const { GraphQLError, subscribe } = require('graphql')
const jwt = require('jsonwebtoken')
const Person = require('./models/Person')
const User = require('./models/User')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()


const resolvers = {
  Query: {
    personCount: async () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
     if (!args.phone) {
        return Person.find({}).populate('friendOf')
      }
      console.log('user find friend')
      return Person.find({ phone: { $exists: args.phone === 'YES'}}).populate('friendOf')
    },
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    },
    /*friendOf: async (root) => {
      const friends = await User.find({ friends: { $in: [root._id] } })
      console.log('user friend')
      return friends
    }*/
  },
  Mutation: {
    addPerson: async (root, args, context) => {
      const person = new Person({ ...args })
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('Not authenticated. Please log in.', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      
      try {
        await person.save()
        person.friendOf = person.friendOf.concat(currentUser._id)
        await person.save()
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save()
      } catch (error) {
        console.log('error', error.errors)
        throw new GraphQLError('Saving new contact failed.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            originalError: error.message
          }
        })
      }

      pubsub.publish('PERSON_ADDED', { personAdded: person })

      return person
    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })
      person.phone = args.phone
      try {
        await person.save()
      } catch (error) {
        throw new GraphQLError('Saving number failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return person
    },
    createUser: async (root, args) => {
      const isAlreadyUser = await User.findOne({ username: args.username })

      if (isAlreadyUser) {
        throw new GraphQLError('Username must be unique', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username
          }
        })
      }

      const user = new User({ username: args.username })

      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET)}
    },
    addAsFriend: async (root, args, { currentUser }) => {
      const isFriend = (person) => 
        currentUser.friends.map(f => 
          f._id.toString()).includes(person._id.toString())
      
      if (!currentUser) {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const person = await Person.findOne({ name: args.name })

      if (!isFriend(person)) {
        currentUser.friends = currentUser.friends.concat(person)
      }

      await currentUser.save()
      return currentUser
        
    }
  },
  Subscription: {
    personAdded: {
      subscribe: () => pubsub.asyncIterableIterator('PERSON_ADDED')
    }
  },
}

module.exports = resolvers