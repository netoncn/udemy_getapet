const mongoose = require('mongoose')

const main = async () => {
    await mongoose.connect(process.env.DBURI)
    console.log('Conectou ao Mongoose!')
}

main().catch((err) => console.log(err))

module.exports = mongoose