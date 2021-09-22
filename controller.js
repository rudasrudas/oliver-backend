require('dotenv').config();
const Repository = require('./repository');
const Services = require('./service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = function(app){

    //////////////////////////////
    //        ENDPOINTS         //
    //////////////////////////////

    //Checks if the element received actually exists and returns the appropriate response.
    function ExistCheck(element, res, title){
        if (element === null)
            return res.status(404).send(`${title} could not be retrieved. An unexpected error occured.`);
        else 
            return res.json(element);
    }

    app.get('/', async (req, res) => {
        let json = JSON.parse(await Services.fetchUserData(req.socket.remoteAddress));
        console.log(json);
        return res.json(json);
    });

    //Raw files
    app.get('/image/:name', (req, res) => {
        let image = Services.getImage(req.params.name, req.query.type);

        if (image === null)
            return res.status(404).send('Specified file type and/or name does not exist or is not publicly accessible.');
        else 
            res.sendFile(image);
    });

    app.get('/track/:name', (req, res) => {
        let track = Services.getTrack(req.params.name);

        if (track === null)
            return res.status(404).send('Specified file name does not exist or is not publicly accessible.');
        else
            res.sendFile(track);
    });

    //Artworks
    app.get('/artworks', (req, res) => {
        Repository.fetchArtworks(function(element){
            return ExistCheck(element, res, 'Artworks');
        });
    });

    app.get('/artwork/:id', (req, res) => {
        Repository.fetchArtwork(req.params.id, function(element){
            return ExistCheck(element, res, 'Artwork');
        });
    });

    //Songs
    app.get('/songs', (req, res) => {
        Repository.fetchSongs(function(element){
            return ExistCheck(element, res, 'Songs');
        });
    });

    app.get('/song/:id', (req, res) => {
        Repository.fetchSong(req.params.id, function(element){
            return ExistCheck(element, res, 'Song');
        });
    });

    //Featured songs
    app.get('/featured', (req, res) => {
        Repository.fetchFeaturedSongs(function (element){
            return ExistCheck(element, res, 'Featured songs');
        });
    });

    //Testimonials
    app.get('/testimonials', (req, res) => {
        Repository.fetchTestimonials(function(element){
            return ExistCheck(element, res, 'Testimonials');
        });
    });

    //Articles
    app.get('/articles', (req, res) => {
        Repository.fetchArticles(function(element){
            return ExistCheck(element, res, 'Articles');
        });
    });

    app.get('/article/:id', (req, res) => {
        Repository.fetchArticle(req.params.id, function(element){
            return ExistCheck(element, res, 'Article');
        });
    });

    //Message send
    app.post('/send-message', (req, res) => {
        return Services.sendMessage(req.body, res);
    });

    app.post('/checkout/create-checkout-session', async (req, res) => {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    // TODO: replace this with the `price` of the product you want to sell
                    price: 'price_1JcFXtDo9XRibKj1knGZMc4Z',
                    quantity: req.body.quantity,
                },
            ],
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `https://api.mecena.net/success?id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://api.mecena.net/cancel`,
        })
        res.json({
            id: session.id
        });
    })
}