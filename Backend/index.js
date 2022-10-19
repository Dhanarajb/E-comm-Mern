const express = require('express')
const cors = require('cors');
require('./db/config');
const User = require('./db/User')
const app = express()
const Product = require('./db/Product')
app.use(express.json())    //its middleware it works for postapi// controls data
app.use(cors());

const Jwt = require('jsonwebtoken')
const jwtKey = 'e-comm';

app.post('/register', async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();   //to store in db
    result = result.toObject();   //result conver to object
    delete result.password;
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            resp.send({ result: "Try after some time" })
        }
        resp.send({ result, auth: token })
    })
})

app.post("/login", async (req, resp) => {
    console.log(req.body)
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password");
        // user ? (resp.send(user) ):(resp.send({ result: "No user found" }))
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    resp.send({ result: "Try after some time" })
                }
                resp.send({ user, auth: token })
            })

        } else {
            resp.send({ result: "No user found" })
        }
    }
    else {
        resp.send({ result: "No user found" })
    }

    // resp.send(user)
})

app.post('/add-product', async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save()
    resp.send(result)

})

app.get('/products', async (req, resp) => {
    let products = await Product.find();  //here return the promise Ao we used asynk and await 
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "no products found" })
    }
})

app.delete("/product/:id", async (req, resp) => {
    // resp.send(req.params.id)    //get exact id // using this id we can delete the data
    const result = await Product.deleteOne({ _id: req.params.id })
    resp.send(result)
})

app.get("/product/:id", async (req, resp) => {
    let result = await Product.findOne({ _id: req.params.id })
    if (result) {
        resp.send(result)
    } else {
        resp.send({ result: "No result found" })
    }
})

app.put("/product/:id", async (req, resp) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    resp.send(result)
})

app.get('/search/:key', async (req, resp) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
        ]
    })
    resp.send(result)
})


app.listen(5500)



// app.post('/login',async(req, resp) => {        //checking routing or not
//     let user = await User.findOne(req.body).select("-password");
//     resp.send(user)
    // if (req.body.password && req.body.email) {
    //     let user = await User.findOne(req.body).select("-password");     //fetching in db //findone will match only one result
    //     if (user) {       //suppose user is true then send the resp to user
    //         resp.send(user)
    //     } else {
    //         resp.send({ result: 'no user found' })
    //     }
    // } else {
    //     // resp.send({ result: 'no user found' })
    // }


// })
