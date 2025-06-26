const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [5, 'Name must have at least 5 characters']
  },
  phone: {
    type: String,
    minlength: 5
  },
  street: {
    type: String,
    required: true,
    minlength: [5, 'Street must have at least 5 characters']
  },
  city: {
    type: String,
    required: true,
    minlength: [3, 'City must have at least 3 characters']
  },
  friendOf: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

module.exports = mongoose.model('Person', schema)

