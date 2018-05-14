/*
This code sample demonstrates a more complex dialog. It uses session.userData and session.dialogData to store 
conversation state and uses beginDialog and endDialogWithResult to manipulate the conversation stack. Step 
through the code and take a look at how the session.sessionState.callstack object changes as we begin and 
end dialogs.
*/
var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//Root dialog
bot.dialog('/', [
    function (session) {
        //Get user info
        session.beginDialog('/ensureProfile', session.userData.profile);
    },
    function (session, results) {
        //We've gotten the user's information and can now give a response based on that data
        session.userData.profile = results.response;
        session.send('Hello %(name)s! I love %(company)s!', session.userData.profile);
    }
]);

bot.dialog('/ensureProfile', [
    function (session, args, next) {
        session.dialogData.profile = args || {};
        //Checks whether or not we already have the user's name
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "What's your name?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        //Checks whether or not we already have the user's company
        if (!session.dialogData.profile.company) {
            builder.Prompts.text(session, "What company do you work for?");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.profile.company = results.response;
        }
        //We now have the user's info (name, company), so we end this dialog
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);


