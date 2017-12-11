const Discord = require('discord.js');
const keys = require("../keys.js");

module.exports.run = async (client, serverInfo, message, blackListedWords, args) => {
    switch (args[1]) {
        case "title":
            (args[0].toLowerCase() == "!set" ? setTitle(client, serverInfo, message, blackListedWords, args) : overrideTitle(client, serverInfo, message, blackListedWords, args));
            break;
        case "color":
        case "colour":
            (args[0].toLowerCase() == "!set" ? setColour(client, serverInfo, message, blackListedWords, args) : overrideColour(client, serverInfo, message, blackListedWords, args));
            break;
        default:
            break;
    }

}

function setTitle(client, serverInfo, message, blackListedWords, args) {
    var userTitle = createTitle(message, args, 2); //make title
    if (userTitle.replace(/[^::]/g, "").length > 5) {
        message.author.send('AlphaConsole does not support more than 5 rotations in your custom title. Please try again.');
    } else {
        var invalidTitle = isValidTitle(message, blackListedWords, userTitle); //check if title is valid
        if (!invalidTitle) {
            //Make web req.
            setUsersTitle(message.author, userTitle, message);
        } else {
            //DM user and say invalid.
            message.member.send("Your custom title was not set because it contained a blacklisted phrase. \n"
            + "AlphaConsole does not allow faking of real titles. If you continue to try and bypass the blacklist system, it could result in loss of access to our custom titles.");
        }
    }
    message.delete().catch(console.error);
}

function setColour(client, serverInfo, message, blackListedWords, args) {

}

function overrideTitle(client, serverInfo, message, blackListedWords, args) {
    if (hasRole(message.member, "Moderator") || hasRole(message.member, "Admin") || hasRole(message.member, "Developer")) {
        var user = message.mentions.users.first();
        var userTitle = createTitle(message, args, 3); //make title
        setUsersTitle(user, userTitle, message);
    } 
    message.delete().catch(console.error);
}

function overideColour(client, serverInfo, message, blackListedWords, args) {

}

//---------------------------//
//      Helper Functions     //
//---------------------------//

function setUsersTitle(user, userTitle, message) {
    var request = require('request');
    var url = keys.SetTitleURL;
    url+= '?DiscordID=' + user.id + '&key=' + keys.Password + "&title=" + userTitle;
    request({
        method: 'GET',
        url: url
    }, function(err, response, body) {
        if (err) user.send('Their was an error updating your title. Please' + 
        ' pm an admin this error: \n' + err);
        if (body.toLowerCase().includes('done')) {
            user.send('Your title has been updated to: `' + userTitle + '`');
            if (user != message.author) message.author.send('You have successfully updated ' + user.username + '\'s title');
        } else if (body.toLowerCase().includes('the user does not exist')) {
            user.send('Hi, in order to use our custom title service you must authorize your discord account. \n'
        + "Please click this link: http://alphaconsole.net/auth/index.php and login with your discord account.")
        }
    });
}

/**
 * Checks if titles are valid
 * @param {*} message 
 * @param {*} blackListedWords 
 * @param {*} userTitle 
 */
function isValidTitle(message, blackListedWords, userTitle) {
    var userTitleBad = false;
    if (!hasRole(message.member, "Admin") && !hasRole(message.member, "Developer")) {
        if (hasRole(message.member, "Moderator")) {
            var exemptWords = ['alphaconsole', 'mod', 'moderator', 'staff'];
            userTitleBad = inBlacklist(message, blackListedWords, userTitle, exemptWords);
        } else if (hasRole(message.member, "Support")) {
            var exemptWords = ['alphaconsole', 'support', 'staff'];
            userTitleBad = inBlacklist(message, blackListedWords, userTitle, exemptWords);
        } else if (hasRole(message.member, "Community Helper")) {
            var exemptWords = ['alphaconsole', 'community helper'];
            userTitleBad = inBlacklist(message, blackListedWords, userTitle, exemptWords);
        } else if (hasRole(message.member, "Legacy")) {
            var exemptWords = ['alphaconsole', 'legacy'];
            userTitleBad = inBlacklist(message, blackListedWords, userTitle, exemptWords);
        } else {
            var exemptWords = [];
            userTitleBad = inBlacklist(message, blackListedWords, userTitle, exemptWords);
        }
    }
    return userTitleBad;
}

/**
 * Checks if the title has bad words taking into consideratriion exempt words
 * @param {*} message 
 * @param {*} blackListedWords 
 * @param {*} userTitle 
 * @param {*} exemptWords 
 */
function inBlacklist(message, blackListedWords, userTitle, exemptWords) {
    var userTitleBad = false;
    blackListedWords.forEach(badWord => {
        if (badWord != '' && !exemptWords.includes(badWord)) {
            if (userTitle.toLowerCase().includes(badWord)) {
                userTitleBad = true;
            }
        }
    });
    return userTitleBad;
}

/**
 * Turns the args array into the title
 * @param {*} message 
 * @param {*} args 
 * @param {*} indexStart 
 */
function createTitle(message, args, indexStart) {
    var title = "";
    for (let word = indexStart; word < args.length; word++) {
        title += args[word] + ' ';
    }
    return title.trim();
}

function pluck(array) {
    return array.map(function(item) { return item["name"]; });
}
function hasRole(mem, role)
{
    if (pluck(mem.roles).includes(role))
    {
        return true;
    } else {
        return false;
    }
}