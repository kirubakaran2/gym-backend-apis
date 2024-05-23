const Customer = require("../Schema/customer")
const punch = require("../Schema/punch")
const { user } = require("./customer")

function TimeZoneFormat(now) {
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let date = now.getDate() + 1
    now = `${year}-${month}-${date}`
    return now
}

function TimeZoneFormatOfNextDate(now) {
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let date = now.getDate() + 2
    now = `${year}-${month}-${date}`
    return now
}

function CalculateDuration(inTime,outTime) {
    let duration = outTime.getTime() - inTime.getTime()

    let hr = Math.floor(duration / (1000*60*60))
    let min = Math.floor( (duration % (1000*60*60)) / (1000*60) ) 
    return `${hr}:${min}`
}

exports.attendAt = async(req,res) => {

    try{
        let {date} = req.body;
        if(!date){
            date = new Date();
            date = new Date(await TimeZoneFormat(date));
        }

        let nextDate = new Date(await TimeZoneFormatOfNextDate(new Date(date)));

        date = new Date(date);

        
        const UserPunch = await punch.find({CREATED_DATE: {$gte: date, $lte: nextDate}});
        
        if(!UserPunch) {
            return res.status(200).json({user:"Not user present on that date."})
        }

        let users = new Array();
        for(const user of UserPunch) {
            let tmp = await Customer.findOne({ID:user.CUSTOMER_PROFILE_ID});
            let response = {
                ID: tmp.ID,
                NAME: tmp.NAME,
                PHONE: tmp.PHONE,
                IN_TIME: user.IN_TIME,
                OUT_TIME: user.OUT_TIME,
            }
            users.push(response)
        }
        if(!users) {
            return res.status(200).json({user:"No user present on that date."})
        }
        return res.status(200).json({user:users})

    }
    catch(err) {
        return res.status(500).json({user:"Internal Server Error",err:err})
    }
}