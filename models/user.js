const mongoose = require('mongoose') // This is needed to create a new schema and model
const bcrypt = require('bcrypt') // Our chosen our library used to hash passwords

const ratingSchema = new mongoose.Schema({
  rating: { type: Number, required: true }
}, {
  timestamps: true
})

const offersPendingSchema = new mongoose.Schema({
  offeringUser: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
})

const offersAcceptedSchema = new mongoose.Schema({
  acceptedUser: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
})

const reviewSchema = new mongoose.Schema({
  review: { type: String, required: true }
}, {
  timestamps: true
})

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: Object, required: true },
  skills: { type: Array, required: true },
  city: { type: String, required: true },
  postcode: { type: String, required: true },
  password: { type: String, required: true },
  rating: [ratingSchema],
  offersPending: [offersPendingSchema],
  offersAccepted: [offersAcceptedSchema],
  review: [reviewSchema]
}, {
  timestamps: true
})

userSchema.plugin(require('mongoose-unique-validator'))

userSchema
  .virtual('avgRating')
  .get(function () {
    const mappedUsers = [...this.rating]
    if (mappedUsers.length) {
      const newMappedUsers = mappedUsers.map(rating => {
        return rating.rating
      })
      const sum = newMappedUsers.reduce((previous, current) => current += previous)
      const avgRating = (sum / newMappedUsers.length).toFixed(1)
      return avgRating
    } else {
      return 0
    }
  })

userSchema
  .set('toJSON', {
    virtuals: true,
    transform(doc, json) {
      delete json.password
      return json
    }
  })

// This validates whether a password is correct at login
userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password) // bcyrpt hashes the password our user is trying to login with the same it hashed the one stored in the DB when they registered, it then compares them for us to see if they match, and returns true or false depending on the outcome
}

userSchema
  .virtual('passwordConfirmation')
  .set(function setPasswordConfirmation(passwordConfirmation) {
    console.log('here')
    this._passwordConfirmation = passwordConfirmation
  })

userSchema
  .pre('validate', function checkPassword(next) { // running before validation step
    if (this.isModified('password') && this._passwordConfirmation !== this.password) {
      this.invalidate('passwordConfirmation', 'does not match') // throws an error back to the controllers if the password passConf do not match
    }
    next() // otherwise allows to move on the Validate step
  })

userSchema
  .pre('save', function hashPassword(next) { // this happens before the mode is saved
    if (this.isModified('password')) { // if the password has been created or changed
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8)) // reassign as a hash of itself
    }
    next() // now move on to saving
  })


module.exports = mongoose.model('User', userSchema)