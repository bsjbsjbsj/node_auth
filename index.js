const express = require('express')
const app = express()
const port = 8000
const { User } = require('./server/models/User');
const cookieParser = require('cookie-parser');
const { auth } = require('./server/middleware/auth');

//application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
//application/json
app.use(express.json());
app.use(cookieParser());

const config = require('./server/config/key')
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI).then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log(err))


app.get('/', (req, res) => res.send('hi node 하이노드'))
app.get('/api/hello', (req, res)=> res.send('axios'))

app.post('/api/users/register', (req, res) => {

    //회원가입 할 때 필요한 정보들을 클라이언트에서 가져오면 그 정보를 데이터베이스로

    const user = new User(req.body)

    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({ success: true, userInfo })
    })
})

app.post('/api/users/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSucess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSucess: false, message: "로그인 비번이 틀렸습니다." })
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id },
        { token: "" }, (err, user) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({ success: true })
        })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))