const mongoose = require("mongoose")
const punch = require("../Schema/punch")
const Customer = require("../Schema/customer")
const {messager} = require("./sender")

exports.intime = async(req,res) => {

    let now = new Date();
    const {id} = req.body;
    const user = await Customer.findOne({ID:id});

    let a = new Date();
    let dateString = `${a.getUTCFullYear()}-${(a.getUTCMonth() + 1).toString().padStart(2, "0")}-${a.getUTCDate().toString().padStart(2, "0")}`;
    let date = new Date(dateString);

    let Checking = await punch.findOne({CUSTOMER_PROFILE_ID:id, IN_TIME: {$lte: a, $gte: date}, CREATED_DATE: {$lte: a, $gte: date}})

    if(Checking)
        return res.json({status:"You already punch in for today."});

    if(!user)
        return res.status(404).status({status:"User not found."})
    const UserPunch = new punch({
        CUSTOMER_PROFILE_ID: id,
        IN_TIME: now,
        OUT_TIME:null,
        SLOT:"",
        PHONE:user.PHONE,
        CREATED_BY:"",
        CREATED_DATE: now
    });

    UserPunch.save().
    then(() => {
        let msg = `Hi ${user.NAME},
        
        Great to see you! You’ve punched in for your workout session at ${a.getHours()}:${a.getMinutes()}. Remember, you have 1 hour to crush your goals. Let’s make it count!
    
        Keep pushing,
        Titanfitnessstudio`
        messager(msg,user.PHONE,'in time entry message.')
        return res.status(200).json({status:"In time entried."})
    }).
    catch(() => {
        return res.status(500).json({status:"Internal Server Error"})
    })
}

exports.outTime = async(req,res) => {
    const {id} = req.body;
    let a = new Date();
    const user = await Customer.findOne({ID:id});
    let dateString = `${a.getUTCFullYear()}-${(a.getUTCMonth() + 1).toString().padStart(2, "0")}-${a.getUTCDate().toString().padStart(2, "0")}`;
    let date = new Date(dateString);

    let Checking = await punch.findOne({CUSTOMER_PROFILE_ID:id, IN_TIME: {$lte: a, $gte: date}, CREATED_DATE: {$lte: a, $gte: date}})
    if(!Checking) {
        return res.status(404).json({status:`In time not found for this user ${id}`})
    }

    if(Checking) {
        if(Checking.OUT_TIME !== null) {
            return res.status(301).json({status:`Out time already exist for this user ${id}`})
        }
    }

    await punch.findOneAndUpdate({CUSTOMER_PROFILE_ID:id, IN_TIME: {$lte: a, $gte: date}},{OUT_TIME:a},{new:true}).
    then((data) => {
        let msg = `Punch out from the gym at ${a.getHours()}:${a.getMinutes()}.
        
        Keep pushing,
        Titalfitnessstudio`
        messager(msg,user.PHONE,'in time entry message.')
        return res.status(200).json({status:"Out Time Entry"})
    }).
    catch((err) => {
        return res.status(500).json({status:"Internal Server Error",error:err})
    });

}