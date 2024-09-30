const express = require("express")
const cors = require("cors");
const path = require("path")
const fs = require("fs")

const app = express()
const {createUser, userList, user, userSearch, nonactive, active, edit, Admindashboard} = require('./Router/customer')
const {db} = require("./Router/database")
const {attendAt,monthlyAttendance,eveningAttendance,morningAttendance} = require("./Router/attendance")
const { intime,outTime, getIn, getOut, attendance } = require("./Router/punch")
const {paymentAt, payment,paymentOf, paymentEdit, delPay, paymentOfAll} = require("./Router/payment")
const {login, admin} = require("./Router/authentication")
const {authAdmin, authCustomer} = require("./middleware/auth")
const {dashboard,paymentofUser, punch} = require("./Router/dashboard")
const {specialoff} = require("./Router/offer")
app.use(express.json())
app.use(cors({origin:"*"}));

const multer  = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname;
        const fileExtension = path.extname(originalName); // Extract extension
    
        let uniqueName = originalName;
        let counter = 1;
    
        const checkAndSave = (fileName) => {
          const filePath = path.join(__dirname, 'uploads', fileName); // Full path
    
          // Check if file already exists
          fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) { // File doesn't exist, save with this filename
              cb(null, fileName);
            } else {
              // If file exists, create a new filename with a counter
              uniqueName = `${originalName.slice(0, -fileExtension.length)}-${counter}${fileExtension}`;
              counter++;
              checkAndSave(uniqueName); // Recursively check the new filename
            }
          });
        };
    
        checkAndSave(uniqueName); // Initiate the filename check
    }
});
const upload = multer({ storage: storage });

// Database manage
db();

// Server testing API
app.get("/testing", (req,res) => res.json({status:"GYM APIs working fine."}).status(200))

// User APIs
app.post("/admin/user/create",authAdmin, upload.single('image'), createUser);
app.get("/admin/user", authAdmin, userList)
app.get("/admin/dashboard", authAdmin, Admindashboard)
app.get("/admin/user/searching", authAdmin, userSearch)
app.get("/admin/user/:userID", authAdmin, user)

app.get("/image/:filename", (req,res) => {
    let {filename} = req.params;
    const imagePath = path.join(__dirname, 'uploads', filename); 
    if (!fs.existsSync(imagePath)) {
        return res.status(404).send('Error: Image not found!');
      }
    try {
        res.sendFile(imagePath);
    }
    catch(e){
        res.status(500).json({status:"Something went wrong"});
    }
})

// Attendance APIs
app.post("/admin/attendance", authAdmin, attendAt)
app.get("/admin/attendance/monthly", authAdmin,monthlyAttendance)
app.get("/admin/attendance/morning", authAdmin,morningAttendance)
app.get("/admin/attendance/evening", authAdmin,eveningAttendance)


// Punch In/Out
app.post("/admin/time/in", authAdmin, intime )
app.post('/admin/time/out', authAdmin, outTime )
app.get("/admin/attendance", authAdmin, attendance);
app.get("/admin/punch/in", authAdmin, getIn);
app.get("/admin/punch/out", authAdmin, getOut);

app.post("/admin/user/non-active", authAdmin, nonactive)
app.post("/admin/user/active", authAdmin, active)
app.post("/admin/special-offers", authAdmin, specialoff)


app.post("/admin/payment", authAdmin, paymentAt)
app.get("/admin/payment", authAdmin, paymentOfAll)
app.post("/admin/payment/add", authAdmin, payment)
app.patch("/admin/payment/edit", authAdmin, paymentEdit)
app.get("/admin/payment/:userID", authAdmin, paymentOf)
app.delete("/admin/payment/:_id", authAdmin, delPay);

app.post("/login", login);
app.post("/admin/user/new",authAdmin, admin)

app.get("/customer/dashboard", authCustomer, dashboard)
app.get("/customer/payment", authCustomer, paymentofUser)
app.get("/customer/punch", authCustomer, punch)
app.patch("/admin/user/edit/:userId",authAdmin,upload.single('image'), edit);
app.patch("/customer/edit/:userId", authCustomer,upload.single('image'), edit);

app.listen(8080,() => {console.log("Server started")})
