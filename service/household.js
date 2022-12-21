const mongoose = require("mongoose");

const User = require('../model/user');
const Subscriber = require('../model/subscriber');
const HouseholdUser = require('../model/household_user.js');
const Household = require('../model/household.js');
const Earnings = require('../model/earnings');
const Category = require('../model/category');
const ExpensePayer = require('../model/expense_payer');
const Expense = require('../model/expense');
const RecurringExpense = require('../model/recurring_expense');

async function calculateHouseholdExpenses(household){
    const expenses = await Expense.aggregate([
        { $match: { 'household_id': mongoose.Types.ObjectId(household._id) } },
        { $lookup: 
          {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'paid_by'
          } 
        },
        { $lookup: 
          {
            from: 'expense_payers',
            localField: '_id',
            foreignField: 'expense_id',
            as: 'payers'
          } 
        },
        { $lookup: 
          {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          } 
        },
        { $lookup: 
          {
            from: 'recurring_expenses',
            localField: 'recurring_id',
            foreignField: '_id',
            as: 'recurring'
          } 
        }
    ]);

    const users = await HouseholdUser.aggregate([
        { $match: { 'household_id': mongoose.Types.ObjectId(household._id) } },
        { $lookup: 
          {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          } 
        }
    ]);

async function underFive(user){
    const household_users = await Household_user.find({ user_id: mongoose.Types.ObjectId(user._id) });
    const userBalances = [];
    users.forEach(user => {
        // console.log(user);
        userBalances.push({ "_id": user.user[0]._id, "balance": 0 });
    });

    if(household_users.length < 5){

        return true;
    function getUser(id) {
        try {
            return userBalances.filter(user => {
                // console.log(user._id, id);
                return mongoose.Types.ObjectId(user._id).equals(mongoose.Types.ObjectId(id)) })[0];
        } catch(err) { }
        return null;
    }


    expenses.forEach(expense => {
        //Calculate recurring expense
        if(expense.recurring.length){
            expense.recurring.forEach(recurrance => {
                let increment = 10000;
                switch(recurrance.frequency){
                    case "day": increment = 1; break;
                    case "week": increment = 7; break;
                    case "2-week": increment = 14; break;
                    case "month": increment = 30; break;
                    case "3-month": increment = 82; break;
                    case "6-month": increment = 165; break;
                    case "year": increment = 365; break;
                    default: break;
                }
                const now = new Date();
                const endDate = new Date(recurrance.end_date);
                const nowOrEnd = now.getTime() < endDate.getTime() ? now : endDate;

                for(let date = new Date(recurrance.start_date); date.getTime() < nowOrEnd.getTime() ; date.setDate(date.getDate() + increment)){
                    //Add to original payer
                    try {
                        getUser(expense.paid_by[0]._id).balance += expense.amount;
                    } catch(err) {
                        console.log("Failed to subtract payers balance");
                    }
            
                    //Subtract from people paying back
                    expense.payers.forEach(payer => {
                        try {
                            getUser(payer.payer_id).balance -= expense.amount/100*payer.percentage_to_pay;
                        } catch(err) {
                            console.log("Failed to subtract paybackers balance");
                        }
                    });
                }
            });
        } else {
            //Add to original payer
            try {
                getUser(expense.paid_by[0]._id).balance += expense.amount;
            } catch(err) {
                console.log("Failed to subtract payers balance");
            }
    
            //Subtract from people paying back
            expense.payers.forEach(payer => {
                try {
                    getUser(payer.payer_id).balance -= expense.amount/100*payer.percentage_to_pay;
                } catch(err) {
                    console.log("Failed to subtract paybackers balance");
                }
            });
        }
    });

    for await (const user of users){
        try {
            await HouseholdUser.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(user._id) }, { "balance": getUser(user.user[0]._id).balance });
        } catch(err) {
            console.log("Failed to save balance");
        }
    }
}


async function generateEveningOutExpenses(household){

}

module.exports = {
    calculateHouseholdExpenses, generateEveningOutExpenses
};