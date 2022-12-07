const Household_user = require('../model/household_user');

function isUnderFourHouseholds(user){
//get all household users
//check how many is the same user
const household_users = Household_user.find();
var count = 0;
household_users.forEach(hUser => {
    if(hUser == user){
        count ++;
    }   
});
    if(count < 5){
        return true;
    }
    return false;
}

function isHouseholdMember(user, household){
//get household members
//check if logged in user is one of them

const household_users = Household_user.find();

// household_users.forEach(hUser => {
//     if(hUser.household_id == household._id){

//     }
    
// });l



}


module.exports = {isUnderFourHouseholds, isHouseholdMember};