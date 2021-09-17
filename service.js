const path = require("path");
const mailer = require('./mailer');
const Joi = require('joi');
const fs = require('fs');
const geoip = require('geoip-country');

class Service {

    static fetchCountry(ip){
        let country = geoip.lookup(ip.replace(/^.*:/, '')).country;

        const poundCountries = ['GB', 'UK', 'IE'];
        const euroCountries = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'IS', 'LI', 'NO', 'CH', 'ME', 'MK', 'AL', 'RS', 'TR', 'BA', 'XK', 'BY', 'MD', 'UA', 'RU'];

        let currency = 'USD';
        if(poundCountries.includes(country)) currency = 'GBP';
        else if (euroCountries.includes(country)) currency = 'EUR';

        return JSON.stringify({ 
            'country': country, 
            'currency': currency 
        });
    }

    static getImage(name, type){
        //Valid directories for storing image files
        //Format    -    type_to_provide: "folder_name_in_server"
        let validTypes = 
        {
            artwork: "artworks", 
            article: "articles"
        }; 

        if(validTypes.hasOwnProperty(type)){
            let fullPath = path.resolve(`./static/${validTypes[type]}/${name}`);
            if (fs.existsSync(fullPath))
                return fullPath;
        }
        return null;
    }
    
    static getTrack(name){
        let fullPath = path.resolve(`./static/tracks/${name}`);
        if (fs.existsSync(fullPath))
            return fullPath;
        else
            return null;
    }

    //Message send
    static sendMessage(sendInstance, res){
        let minName = 3, maxName = 50;
        let minEmail = 8, maxEmail = 100;
        let minMessage = 15, maxMessage = 2000;
        
        const schema = Joi.object({
            name: Joi.string().min(minName).max(maxName).required(),
            email: Joi.string().email().min(minEmail).max(maxEmail).required(),
            message: Joi.string().min(minMessage).max(maxMessage).required()
        });

        const result = schema.validate(sendInstance, {abortEarly: "false", render: "false"});

        if(result.error === undefined){

            const options = {
                from: 'hello@mecena.net',
                to: 'hello@mecena.net',
                subject: `Message from ${sendInstance.name}`,
                text: `replyto: ${sendInstance.email}\nname: ${sendInstance.name}\ncontent:\n${sendInstance.message}`
            };
    
            return mailer.send(res, options);
        }
        else {
            let type = result.error.details[0].type;
            let key = result.error.details[0].context.key;

                 if (key === 'name'  && type === 'string.empty' ) return res.status(430).send("Name is required");
            else if (key === 'name'  && type === 'string.min'   ) return res.status(431).send("Name must be at least " + minName + " characters long");
            else if (key === 'name'  && type === 'string.max'   ) return res.status(432).send("Name must be no longer than " + maxName + " characters");
            else if (key === 'email' && type === 'string.empty' ) return res.status(433).send("Email is required");
            else if (key === 'email' && type === 'string.email' ) return res.status(434).send("Email is invalid");
            else if (key === 'email' && type === 'string.email' ) return res.status(435).send("Email must be at least " + minEmail + " characters long");
            else if (key === 'email' && type === 'string.email' ) return res.status(436).send("Email must be no longer than " + maxEmail + " characters");
            else if (key === 'message' && type === 'string.empty' ) return res.status(437).send("Message is required");
            else if (key === 'message' && type === 'string.min' ) return res.status(438).send("Message must be at least " + minMessage + " characters long");
            else if (key === 'message' && type === 'string.max' ) return res.status(439).send("Message must be no longer than " + maxMessage + " characters");
        }

        return res.status(400).send("Message could not be sent. Unknown error occured.");
    }
}

module.exports = Service;