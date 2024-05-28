const Customer = require("../Schema/customer");
const Payment = require("../Schema/payment")
const Punch = require("../Schema/punch")
const {messager} = require("./sender")
const bcrypt = require("bcryptjs")

exports.createUser = async (req,res) => {
    const {image,password, name, mobile, email, dob, address, refer, diet} = req.body;

    const existUser = await Customer.findOne({EMAIL:email});
    if(existUser) {
        return res.status(409).json({status:"Already user exist"})
    }

    let nowDate = new Date()
    let ID = await Customer.countDocuments();
    let encPwd = bcrypt.hashSync(password,5);

    try {
        const user = await Customer({
            ID: ID+1,
            IMAGE_PATH: image,
            NAME: name,
            PHONE: mobile,
            EMAIL: email,
            DOB: dob,
            ADDRESS: address,
            REFERENCE: refer,
            CREATED_DATE: nowDate,
            CREATED_BY:"",
            PASSWORD:encPwd,
            LAST_MODIFIED_DATE:null,
            LAST_MODIFIED_BY:null,
            GYM_PROFILE_ID:1,
            STATUS:1
        });

        user.save().
        then((data) => {
            if(diet){
                let msg = `Hello ${user.NAME},
                
                Welcome aboard! Your account registration was successful. To kickstart your fitness journey, here’s your personalized diet plan: ${diet}. Let's achieve your goals together!
                
                Cheers,
                Titanfitnessstudio`
                // messager(msg,mobile,"diet plan");
            }
            return res.json({status:"created",userID:ID+1}).status(200)
        }).
        catch((err) => {
            return res.json({status:"not created", err: err}.status(301));
        })
    }
    catch(err){
        return res.json({status:"error", err: err})
    }
}

exports.edit = async(req,res) => {
    const id = req.params.userId;
    const {image,password, name, mobile, email, dob, address, refer, diet} = req.body;

    const existUser = await Customer.findOne({_id:id});
    if(!existUser) {
        return res.status(409).json({status:"User does not exist"})
    }

    

    let nowDate = new Date()
    let ID = await Customer.countDocuments();
    if(password)    
        var encPwd = bcrypt.hashSync(password,5);

    try {

        Customer.findOneAndUpdate({_id:id},{
            IMAGE_PATH: image ? image : existUser.image,
            NAME: name ? name : existUser.name,
            PHONE: mobile ? mobile : existUser.mobile,
            EMAIL: email ? email : existUser.email,
            DOB: dob ? dob : existUser.dob,
            ADDRESS: address ? address : existUser.address,
            PASSWORD:encPwd ? password : existUser.password,
            LAST_MODIFIED_DATE:nowDate,
            LAST_MODIFIED_BY:'admin',
            GYM_PROFILE_ID:1,
            STATUS:1
        },{new:true}).
        then((data) => {
            if(diet){
                let msg = `Hello ${user.NAME},
                
                Welcome aboard! Your account registration was successful. To kickstart your fitness journey, here’s your personalized diet plan: ${diet}. Let's achieve your goals together!
                
                Cheers,
                Titanfitnessstudio`
                // messager(msg,mobile,"diet plan");
            }
            return res.json({status:"updated"}).status(200)
        }).
        catch((err) => {
            return res.json({status:"not updated", err: err}.status(301));
        })
    }
    catch(err){
        return res.json({status:"error", err: err})
    }
}

exports.userList = async(req,res) => {
    try {
        let today = new Date();
        const User = await Customer.find({},{PASSWORD:0,STATUS:0,CREATED_BY:0,CREATED_DATE:0,LAST_MODIFIED_BY:0,LAST_MODIFIED_DATE:0,REFERENCE:0});
        const payment = await Payment.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$PAYMENT_DATE" }, today.getMonth() + 1] },
                    { $eq: [{ $year: "$PAYMENT_DATE"}, today.getUTCFullYear()]}
                ]
            }
        });
        const punch = await Punch.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$CREATED_DATE" }, today.getMonth() + 1] },
                    { $eq: [{ $year: "$CREATED_DATE"}, today.getUTCFullYear()]}
                ]
            }
        });
        return res.status(200).json({users: User,payment:payment,punch:punch});
    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong", error: err});
    }
}

exports.user = async(req,res) => {
    const {userID} = req.params;
    try {
        const User = await Customer.findOne({_id:userID});
        if(!User) {
            return res.status(404).json({user:"User not found"})
        }
        return res.status(200).json({user:User})
    }
    catch(err) {
        return res.status(500).json({error:err})
    }
}

exports.userSearch = async(req,res) => {
    let {customerID, name, mobile, dob, userID} = req.query;

    if(userID) {
        const User = await Customer.findOne({ID:userID});
        if(!User) 
            return res.status(404).json({user:"Not found"})
        return res.status(200).json({user:User})
    }

    if(!name && !mobile && !dob) {
        const User = await Customer.find()
        return res.status(200).json({user:User})
    }

    customerID = customerID ? customerID : ''
    name = name ? name : '/^(?!)$/'
    mobile = mobile ? mobile : '/^(?!)$/'
    dob = dob ? dob : null

    try {
        console.log(name,mobile,dob)
        const User = await Customer.find({
            $or: [ 
                {DOB: dob},
                {NAME: {$regex: name}}, 
                {PHONE: {$regex: mobile}}
            ]
        })
        if(!User) {
            return res.status(404).json({user: "User not found"})
        }
        return res.status(200).json({user:User})
    }
    catch(err) {

    }
}

exports.nonactive = async(req,res) => {
    const {userID} = req.body;
    const user = await Customer.findOne({_id:userID});
    if(!user) 
        return res.status(404).json({status:"User not found."})
    if(user?.STATUS == 0) 
        return res.status(406).json({status:`User ${user.NAME} has already been non-active`});
    await Customer.findOneAndUpdate({_id:userID},{STATUS:0}).then(async (user) => {
        let msg = `Hi ${user.NAME},

We noticed that your payment is pending. To avoid any disruption to your access, please complete your payment as soon as possible. Until then, your account is temporarily inactivated.

Thank you,
Titanfitnessstudio
        `
        // await messager(msg, user.PHONE, "non-active")
        return res.json({status:`User ${user.NAME} has been non-active. And send a notification.`})
    });
}

exports.active = async(req,res) => {
    const {userID} = req.body;
    const user = await Customer.findOne({_id:userID});
    if(user?.STATUS == 1) 
        return res.status(406).json({status:`User ${user.NAME} has already been active.`});
    await Customer.findOneAndUpdate({_id:userID},{STATUS:1}).then(async (user) => {
        // await messager("Your gym account has been active now. You can enjoy our gym services.", user.PHONE, "active")
        return res.json({status:`User ${user.NAME} has been active now. You can enjoy our gym services.`})
    });
}