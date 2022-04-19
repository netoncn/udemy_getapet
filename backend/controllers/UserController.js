const User = require('../models/User')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const status = require('../helpers/http-status')
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
    static register = async (req, res) => {
        const { name, email, phone, password, confirmpassword } = req.body

        if(!name) {
            res.status(status.unprocessable_entity).json({ message: 'Nome obrigatório' })
            return
        }
        if(!email) {
            res.status(status.unprocessable_entity).json({ message: 'Email obrigatório' })
            return
        }
        if(!phone) {
            res.status(status.unprocessable_entity).json({ message: 'Telefone obrigatório' })
            return
        }
        if(!password) {
            res.status(status.unprocessable_entity).json({ message: 'Senha obrigatório' })
            return
        }
        if(!confirmpassword) {
            res.status(status.unprocessable_entity).json({ message: 'Confirmação de senha obrigatório' })
            return
        }
        if(password !== confirmpassword) {
            res.status(status.unprocessable_entity).json({ message: 'Confirmação de senha diferente da senha' })
            return
        }

        const userExists = await User.findOne({email: email})

        if(userExists) {
            res.status(status.unprocessable_entity).json({ message: 'Email já utilizado' })
            return
        }

        // Create password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)
        
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })
        
        try {
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(status.internal_server_error).json({ message: error })
        }
    }

    static login = async (req, res) => {
        const { email, password } = req.body

        if(!email) {
            res.status(status.unprocessable_entity).json({ message: 'Email obrigatório' })
            return
        }
        if(!password) {
            res.status(status.unprocessable_entity).json({ message: 'Senha obrigatório' })
            return
        }

        const user = await User.findOne({ email: email })

        if(!user) {
            res.status(status.unprocessable_entity).json({ message: 'Usuário e/ou senha não encontrado' })
        }

        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword) {
            res.status(status.unprocessable_entity).json({ message: 'Usuário e/ou senha não encontrado' })
        }

        await createUserToken(user, req, res)
    }

    static checkUser = async (req, res) => {
        let currentUser

        if(req.headers.authorization) {
            const token = getToken(req)
            const decoded = jwt.verify(token, process.env.JWTSECRET)

            currentUser = await User.findById(decoded.id).select('-password')
        } else {
            currentUser = null
        }

        res.status(status.ok).send(currentUser)
    }

    static getUserById = async (req, res) => {
        const id = req.params.id

        const user = await User.findById(id).select('-password').catch(() => {
            res.status(status.unprocessable_entity).json({ message: 'Usuário não encontrado' })
            return
        })

        res.status(status.ok).json({user})
        return
    }

    static editUser = async (req, res) => {

        const { name, email, phone, password, confirmpassword } = req.body
        let image = ''

        if(req.file) {
            user.image = req.file.filename
        }
        
        const token = getToken(req)
        const user = getUserByToken(token)

        user.name = name || user.name
        user.email = email || user.email
        user.phone = phone || user.phone
        user.password = password || user.password
        user.save()

        res.status(status.ok).json({user})
        return
    }
}