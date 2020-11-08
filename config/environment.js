const env = process.env.NODE_ENV || 'development'
const port = process.env.PORT || 4000
const dbURI = process.env.DB_URI || `mongodb://localhost/chow-vow-${env}`
const secret = process.env.SECRET || 'noshlord'

module.exports = { port, dbURI, secret, env }