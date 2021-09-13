const path = require("path");
const Repository = require('./repository');
const mailer = require('./mailer');
const Joi = require('joi');

class Service {

    static getArticle(id){
        return path.resolve(`./static/articles/${id}`);
    }

    static getArtwork(id){
        return path.resolve(`./static/artworks/${id}`);
    }
    
    static getSong(id){
        return path.resolve(`./static/tracks/${id}`);
    }

    //Message send
    static sendMessage(sendInstance){
        const schema = Joi.object({
            name: Joi.string().min(3).max(50).required().label('Name'),
            email: Joi.string().email().min(8).max(100).required().label('Email'),
            message: Joi.string().min(15).max(1000).required().label('Message')
        });

        const schemaOptions = {
            abortEarly: "false",
            render: "false"
        }
        const result = schema.validate(sendInstance, schemaOptions);
        console.log(result.error.details);

        const options = {
            from: 'hello@mecena.net',
            to: 'hello@mecena.net',
            subject: `Message from ${sendInstance.name}`,
            text: `replyto: ${sendInstance.email}\nname: ${sendInstance.name}\ncontent:\n${sendInstance.message}`
        };

        mailer.send(options);
        return 'Success';
    }
}

module.exports = Service;