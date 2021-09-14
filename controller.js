const Repository = require('./repository');
const Services = require('./service');

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

    app.get('/', (req, res) => {
        return res.send("Server is running.");
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
        // console.log(req.socket.remoteAddress); //Getting remove address;
        // res.send(Services.sendMessage(req.body));
        return Services.sendMessage(req.body, res);
    });
}