const Household = require("../model/household");
const HouseholdUser = require("../model/household_user");
const User = require("../model/user");
const Expense = require("../model/expense");
const ExpensePayer = require("../model/expense_payer");
const recurringExpense = require("../model/recurring_expense");
const Category = require("../model/category");

const HouseholdService = require("../service/household");

const mailer = require("../service/mailer");
const auth = require("../service/auth");
const mongoose = require("mongoose");
const keygen = require("keygenerator");

function generateKey(){
    return keygen._({
        chars: true,
        numbers: false,
        length: 6,
        forceUppercase: true
    });
}

module.exports = function (app) {
    //get all households - for testing purposes
    app.get("/households", async (req, res) => {
        try {
            const households = await Household.find();

            if (households != null) {
                res.status(200).json(households);
            }
        } catch (err) {
            console.log(err);
            res.status(400).send(
                "Error occured while retrieving household data"
            );
        }
    });

    // get household by ID
    app.get("/household/:hhid", auth.verify, async (req, res) => {
        try {
            const user = await auth.getUser(req);
            const hhid = req.params.hhid;

            const household = await Household.findOne({ _id: mongoose.Types.ObjectId(hhid) });
            if (!household) return res.status(400).send("Household not found");

            // await HouseholdService.calculateHouseholdExpenses(household);

            // check if logged in user is a household member
            const householdUser = await HouseholdUser.findOne({
                household_id: mongoose.Types.ObjectId(household._id),
                user_id: mongoose.Types.ObjectId(user._id),
                status: "active"
            });
            if (!householdUser)
                return res.status(403).send("User is not part of the household");

            const isAdmin = mongoose.Types.ObjectId(household.admin).equals(mongoose.Types.ObjectId(user._id));
            const hhUsers = await HouseholdUser.find({ "household_id": mongoose.Types.ObjectId(household._id) });
            const users = [];
            for await (const hhu of hhUsers){
                const user = await User.findOne({ "_id": mongoose.Types.ObjectId(hhu.user_id) });
                const expenses = await Expense.find({ "user_id": mongoose.Types.ObjectId(hhu.user_id), "household_id": mongoose.Types.ObjectId(household._id) });

                // const expensePays = await ExpensePayer.find({ "payer_id": mongoose.Types.ObjectId(hhu.user_id), "expense_id": mongoose.Types.ObjectId(household._id) });
                // // remove expense pays with own paid by
                // for await (const x of expensePays){
                //     const expense = await Expense.find({ "_id": mongoose.Types.ObjectId(x.expense_id) });
                //     if(expense) expensePays.pop(x);
                // };

                users.push({
                    "uid": user._id,
                    "name": user.name,
                    "surname": user.surname,
                    "balance": hhu.balance,
                    "expenses": expenses.length,
                    "roomSize": hhu.room_size
                });
            };

            const expenses = [];
            const recurringExpenses = [];
            const exps = await Expense.find({ "household_id": mongoose.Types.ObjectId(household._id) });
            for await (const e of exps){
                const recurringE = await recurringExpense.findOne({ "_id": e.recurring_id });

                const paidBy = await User.findOne({ "_id": mongoose.Types.ObjectId(e.user_id) });
                if(!paidBy) continue;

                const payers = await ExpensePayer.find({ "expense_id": mongoose.Types.ObjectId(e._id) });

                const category = await Category.findOne({ "_id": mongoose.Types.ObjectId(e.category_id) });
                if(!category) continue;
                
                try{
                    if(recurringE){
                        // recurring expense
                        recurringExpenses.push({
                            "eid": e._id,
                            "reid": recurringE._id,
                            "icon": category.icon,
                            "category": category.title,
                            "name": e.name,
                            "date": e.date,
                            "paidBy": (paidBy.name + ' ' + paidBy.surname),
                            "payers": payers.length,
                            "amount": e.amount,
                            "startDate": recurringE.start_date,
                            "endDate": recurringE.end_date,
                            "frequency": recurringE.frequency
                        });
                    } else {
                        // Regular expense
                        expenses.push({
                            "eid": e._id,
                            "icon": category.icon,
                            "category": category.title,
                            "name": e.name,
                            "date": e.date,
                            "paidBy": (paidBy.name + ' ' + paidBy.surname),
                            "payers": payers.length,
                            "amount": e.amount
                        });
                    }
                } catch(err) {
                    
                }
            }

            const response = {
                "hhid": household._id,
                "name": household.name,
                "address": household.address,
                "key": household.join_key,
                "currency": household.currency,
                "admin_id": household.admin,
                "users": users,
                "recurringExpenses": recurringExpenses,
                "expenses": expenses,
                "isAdmin": isAdmin
            }
            return res.status(200).json(response);
        } catch (err) {
            console.log(err);
            res.status(400).send("Error occured while retrieving household data");
        }
    });

    // create a household (and a household_user)
    app.post("/household", auth.verify, async (req, res) => {
        try {
            const user = await auth.getUser(req);

            const { name, address, currency } = req.body;

            if (!(name && address && currency)) {
                res.status(400).send("Provided data is invalid");
            } else {
                console.log(req.body);

                //check if user is in no more than 4 households
                const existingHouseholds = await HouseholdUser.find({ user_id: mongoose.Types.ObjectId(user._id), status: "active" });
                console.log(existingHouseholds);
                if (existingHouseholds.length >= 5) return res.status(400).send("User already is in 5 households");

                const household = await Household.create({
                    name,
                    address,
                    join_key: generateKey(),
                    currency: currency.toUpperCase(),
                    allow_edit: true,
                    admin: user,
                });
                console.log("Household created");
                console.log(household);

                //Create household_user who is the admin of the new household
                const newHouseholdUser = await HouseholdUser.create({
                    household_id: mongoose.Types.ObjectId(household),
                    user_id: mongoose.Types.ObjectId(user),
                    room_size: 0,
                    balance: 0,
                    created: new Date(),
                    status: "active",
                });
                console.log("Household user created successfully");
                console.log(newHouseholdUser);

                const response = {
                    hhid: household._id,
                    name: household.name,
                    address: household.address,
                    key: household.join_key,
                    currency: household.currency,
                    admin_id: user._id,
                    users: [
                        newHouseholdUser
                    ]
                };
                return res.status(200).send(JSON.stringify(response));
            }
        } catch (err) {
            console.log(err);
        }
    });

    app.delete("/household/:hhid", auth.verify, async (req, res) => {
        try {
            const user = await auth.getUser(req);
            const hhid = req.params.hhid;
            const household = await Household.findOne({ _id: mongoose.Types.ObjectId(hhid) });
            if(!household) return res.status(400).send("Household not found");

            //check if user is admin
            const isAdmin = mongoose.Types.ObjectId(household.admin).equals(mongoose.Types.ObjectId(user._id));
            if (isAdmin) {
                    household.remove();
                    return res.status(200).send("Household is deleted");
            } else return res.status(403).send("User is not the household admin");
        } catch (err) {
            console.log(err);
            return res.status(400).send("Error occured while deleting household");
        }
    });

    app.delete("/household/:hhid/user/:uid", auth.verify, async (req, res) => {
        try {
            const user = await auth.getUser(req);

            const hhid = req.params.hhid;
            const uid = req.params.uid;

            if (!hhid || hhid.length !== 24)
                return res.status(400).send("Household doesn't exist");
            if (!uid || uid.length !== 24)
                return res.status(400).send("User doesn't exist");

            const household = await Household.findOne({
                _id: mongoose.Types.ObjectId(hhid),
            });
            if (!household)
                return res.status(400).send("Household doesn't exist");

            const caller = await User.findOne({ email: user.email });
            if (!caller) return res.status(403).send("Logged in user does not have access to this function");

            const leaver = await User.findOne({
                _id: mongoose.Types.ObjectId(uid),
            });
            if (!leaver) return res.status(400).send("User doesn't exist");

            const householdUser = await HouseholdUser.findOne({
                household_id: household._id,
                user_id: leaver._id,
                status: "active"
            });
            if (!householdUser)
                return res
                    .status(200)
                    .send("User is not part of the household");

            const isAdmin = mongoose.Types.ObjectId(household.admin).equals(
                mongoose.Types.ObjectId(caller._id)
            );
            const removingThemselves = mongoose.Types.ObjectId(
                caller._id
            ).equals(mongoose.Types.ObjectId(leaver._id));

            //If user is an admin or is leaving the household by themselves, proceed
            if (isAdmin || removingThemselves) {
                await householdUser.updateOne({
                    left: Date.now(),
                    status: "inactive"
                });

                //If the admin is removing themselves, assign new admin
                if (isAdmin && removingThemselves) {
                    const newHouseholdUserAdmin = await HouseholdUser.findOne({
                        household_id: hhid,
                        status: "active"
                    }).sort({ created: 1 });

                    //If there's no members left, delete the household
                    if (!newHouseholdUserAdmin) {
                        //TODO: Delete household
                    }

                    const newAdmin = await User.findOneAndUpdate({
                        _id: newHouseholdUserAdmin.user_id,
                    });
                    household.updateOne({
                        admin: mongoose.Types.ObjectId(newAdmin),
                    });
                }

                return res.status(200).send("User removed from household");
            }

            res.status(403).send(
                "Caller is not allowed to remove the leaver from the household"
            );
        } catch (err) {
            console.log(err);
            res.status(400).send("Failed to remove user from a household");
        }
    });


    //INVITE HOUSEHOLD
    app.post( "/invite/household/:hhid/user/:uid", auth.verify, async (req, res) => {

            try {
                //If the invitation is already existent, no new duplicate invitation should be created,
                //but the email invitation can be sent as usual.

                const user = await auth.getUser(req);

                const hhid = req.params.hhid;
                const email = req.params.uid;
                const b = req.query.email;

                //The caller must be authenticated as the household’s admin to proceed with the invitation.
                const household = await Household.findOne({_id: mongoose.Types.ObjectId(hhid)});
                if (!household) return res.status(400).send("Household not found");
                const invitee = await User.findOne({ email });
                if (!invitee) return res.status(400).send("User not found");
                const isAdmin = mongoose.Types.ObjectId(household.admin).equals( mongoose.Types.ObjectId(user._id));
                if (!isAdmin)return res.status(403).send("User is not household administrator");

                const existingHouseholdUser = await HouseholdUser.findOne({ "household_id": household._id, "user_id": invitee._id });
                if(existingHouseholdUser){
                    if(existingHouseholdUser.status === "active"){
                        return res.status(400).send("User is already part of the household");
                    }
                } else {
                    //Create household_user who is the admin of the new household
                    const newHouseholdUser = await HouseholdUser.create({
                        household_id: mongoose.Types.ObjectId(household),
                        user_id: mongoose.Types.ObjectId(invitee),
                        room_size: 0,
                        balance: 0,
                        created: new Date(),
                        status: "pending",
                    });
                }

                if(b) {
                    const mailInfo = {
                        from: "Oliver <coliver.kea@gmail.com>",
                        to: email,
                        subject: `You been invited to Household ${household.name}`,
                        text: `You're invited to join a household. Enter the following join key in the Oliver system to accept: ${household.join_key}`,
                    };

                    mailer.send(mailInfo);
                    // if(!mailResult) return res.status(400).send("Failed to send email invite message");
                }

                res.status(200).send("User invited successfully");
            } catch (err) {
                console.log(err); 
                res.status(400).send(" Unknown error occured while inviting user");
            }
        }
    );


    //JOIN HOUSEHOLD
    app.post("/join/household", auth.verify, async (req, res) => {
        try {
            const user = await auth.getUser(req);

            const caller = await User.findOne({ email: user.email });
            if (!caller) return res.status(403).send("Logged in user does not have access to this function");

            const key = req.query.key;
            const hhid = req.query.hhid;

            let household;
            
            if(hhid){
                household = await Household.findOne({ _id: mongoose.Types.ObjectId(hhid) });
                if (!household) return res.status(403).send("Household ID is invalid");
            } else if(key) {
                household = await Household.findOne({ join_key: key });
                if (!household) return res.status(403).send("Join key is invalid");
            } else {
                return res.status(400).send("Either key or the household id must be provided to join");
            }

            const householdUser = await HouseholdUser.findOne({ household_id: household._id, user_id: caller._id });
            if(!householdUser) return res.status(530).send("User is not invited to household");

            if(householdUser.status === "active") {
                return res.status(530).send("User is already in the household");
            }
            else {
                await householdUser.updateOne({ status: "active" });
                return res.status(200).send("User joined household");
            }
            
        } catch (err) {
            console.log(err);
        }

        return res.status(400).send("Failed to join household");
    });
};
