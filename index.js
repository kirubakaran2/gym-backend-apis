const express = require("express")
const app = express()
const {createUser, userList, user, userSearch, nonactive, active, edit} = require('./Router/customer')
const {db} = require("./Router/database")
const {attendAt} = require("./Router/attendance")
const { intime,outTime } = require("./Router/punch")
const {paymentAt, payment,paymentOf, paymentEdit} = require("./Router/payment")
const {login, admin} = require("./Router/authentication")
const {authAdmin, authCustomer} = require("./middleware/auth")
const {dashboard,paymentofUser, punch} = require("./Router/dashboard")
const {specialoff} = require("./Router/offer")
app.use(express.json())

// Database manage
db();

// Server testing API
app.get("/testing", (req,res) => res.json({status:"GYM APIs working fine."}).status(200))

// User APIs
app.post("/admin/user/create", authAdmin, createUser);
app.get("/admin/user", authAdmin, userList)
app.get("/admin/user/searching", authAdmin, userSearch)
app.get("/admin/user/:userID", authAdmin, user)

// Attendance APIs
app.post("/admin/attendance", authAdmin, attendAt)

// Punch In/Out
app.post("/admin/time/in", authAdmin, intime )
app.post('/admin/time/out', authAdmin, outTime )


app.post("/admin/user/non-active", authAdmin, nonactive)
app.post("/admin/user/active", authAdmin, active)
app.post("/admin/special-offers", authAdmin, specialoff)


app.post("/admin/payment", authAdmin, paymentAt)
app.post("/admin/payment/add", authAdmin, payment)
app.patch("/admin/payment/edit", authAdmin, paymentEdit)
app.get("/admin/payment/:userID", authAdmin, paymentOf)

app.post("/login", login);
app.post("/admin/user/new",authAdmin, admin)

app.get("/customer/dashboard", authCustomer, dashboard)
app.get("/customer/payment", authCustomer, paymentofUser)
app.get("/customer/punch", authCustomer, punch)
app.patch("/admin/user/edit/:userId",authAdmin, edit);
app.patch("/customer/edit/:userId", authCustomer, edit);

app.listen(8080,() => {console.log("Server started")})
