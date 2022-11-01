const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const UserModel = require('../Model/User'); 

dotenv.config({
    path: '../config.env'
})
const router = express.Router();



router.get('/', (req, res)=>{
    res.status(200).json({
        message: `Welcome to ${req.originalUrl} :D`
    });
});

router.post('/signup', async(req, res)=>{
    try {
        
        const name = req.body.name;
        const email = req.body.email;
        const passwordEncrypt = await bcrypt.hash(req.body.password, 12);
    
        await UserModel.create({
            name,
            email,
            password: passwordEncrypt
        });
    
        res.status(200).json({
            name,
            message: 'User successfully created.'
        });
        
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Error'
        })
    }

});

router.post('/signin', async (req,res)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password){
            throw Error('Please provide email and password')
        }

        const user = await UserModel.findOne({
            email: 'mfitrie78@gmail.com'
        })
        .select('+password');
    
        const isValidate = await user.correctPassword(password, user.password);
        
        if(!user || !isValidate){
            throw Error('Email or password is incorrect');
        }

        const token = createToken(user._id);

        // createSendToken(user._id, req, res);
    
        res.status(200).json({
            message: 'Login sucess',
            token
        })
        
    } catch (error) {
        console.log(error);
        res.status(401).json({
            message: error.message
        });
    }
});


router.get('/post', isLoggin, async(req, res)=>{
    const {id} = res.locals.user;

    const user = await UserModel.findById(id);

    res.status(200).json({
        message: 'You allowed!',
        name: user.name
    });
});

router.get('/logout', (req, res)=>{
    // console.log(res.locals.user);
    res.status(200).json({
        message: 'Successfully log out!'
    });
});







function createToken(id){
    return jwt.sign({id}, process.env.TOKEN_SECRET, {
        expiresIn: '1d'
    });
}


function createSendToken(id, req, res){
    const token = createToken({id});

    const cookieOptions = {
        expires: (new Date(Date.now()+ 86400*1000)).toUTCString(),
        httpOnly: true
    }

    res.cookie('jwt', token, cookieOptions);
}


function isLoggin(req, res, next){
    const authHeaders = req.headers['authorization'];
    if(!authHeaders){
        return res.status(403).json({
            message: `You're not logged in!`
        });
    }
    const token = authHeaders.split(' ')[1];

    // const token = res.cookie.jwt.id;

    jwt.verify(token, process.env.TOKEN_SECRET, (err, data)=>{
        res.locals.user = data;
        if(err){
            return res.status(403).json({
                message: 'Not allowed'
            });
        }

        next();
    })
}


module.exports = router;