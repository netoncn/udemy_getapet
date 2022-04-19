const Pet = require('../models/Pet')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ObjectId = require('mongoose').Types.ObjectId

const status = require('../helpers/http-status')
const { imageRemove } = require('../helpers/image-remove')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

validate = {
    name: (value) => {
        if(!value) return false
        return true
    },
    age: (value) => {
        if(!value) return false
        return true
    },
    weight: (value) => {
        if(!value) return false
        return true
    },
    color: (value) => {
        if(!value) return false
        return true
    },
    images: (value) => {
        if(value.length === 0) return false
        return true
    }
}

module.exports = class UserController {
    
    static create = async (req, res) => {
        const { name, age, weight, color } = req.body
        const available = true
        const images = req.files
        
        if(!validate.name(name)) return res.status(status.unprocessable_entity).json({message: 'Invalid name!'})
        if(!validate.age(age)) return res.status(status.unprocessable_entity).json({message: 'Invalid age!'})
        if(!validate.weight(weight)) return res.status(status.unprocessable_entity).json({message: 'Invalid weight!'})
        if(!validate.color(color)) return res.status(status.unprocessable_entity).json({message: 'Invalid color!'})
        if(!validate.images(images)) return res.status(status.unprocessable_entity).json({message: 'Invalid images!'})

        const token = getToken(req)
        const user =  await getUserByToken(token)

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone
            }
        })
        
        images.map((image) => {
            pet.images.push(image.filename)
        })

        try {
            const newPet = await pet.save()
            res.status(status.created).json({ message: 'Pet cadastrado com sucesso!', newPet })
        } catch (error) {
            res.status(status.internal_server_error).json({ message: error })
        }
    }

    static getAll = async (req, res) => {
        const pets = await Pet.find().sort('-createdAt')
        res.status(status.ok).json({pets})
    }

    static getAllUserPets = async (req, res) => {
        const token = getToken(req)
        const user =  await getUserByToken(token)
        const pets = await Pet.find({'user._id': user._id}).sort('-createdAt')
        res.status(status.ok).json({pets})
    }

    static getAllUserAdoptions = async (req, res) => {
        const token = getToken(req)
        const user =  await getUserByToken(token)
        const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')
        res.status(status.ok).json({pets})
    }

    static getPetById = async (req, res) => {
        const id = req.params.id

        if(!ObjectId.isValid(id)) return res.status(status.unprocessable_entity).json({message: 'Invalid id!'})

        const pet = await Pet.findById(id)
        
        if(!pet) return res.status(status.unprocessable_entity).json({message: 'Invalid pet!'})
        return res.status(status.ok).json({pet})
        
    }

    static removePetById = async (req, res) => {
        const id = req.params.id

        if(!ObjectId.isValid(id)) return res.status(status.unprocessable_entity).json({message: 'Invalid id!'})

        const pet = await Pet.findById(id)
        
        if(!pet) return res.status(status.unprocessable_entity).json({message: 'Invalid pet!'})
        
        const token = getToken(req)
        const user =  await getUserByToken(token)
        
        if(pet.user._id.toString() !== user._id.toString()) return res.status(status.unprocessable_entity).json({message: 'Unprocessable entity!'})

        await Pet.findByIdAndRemove(id)
        
        pet.images.map((image) => {
            imageRemove('pets', image)
        })

        res.status(status.ok).json({ message: 'Pet removed!' })
    }
}