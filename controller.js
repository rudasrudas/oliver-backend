const Repository = require('./repository');
const Services = require('./service');

module.exports = function(app){

    //////////////////////////////
    //        ENDPOINTS         //
    //////////////////////////////

    app.get('/', (req, res) => {
        res.send('Martynas gejus');
    });

    //Artworks
    app.get('/artworks', (req, res) => {
        Repository.fetchArtworks(function(artworks){
            res.json(artworks);
        });
    });

    app.get('/artwork/:id', (req, res) => {
        if (req.query.info === "true"){
            Repository.fetchArtwork(req.params.id, function(artwork){
                res.json(artwork);
            });
        }
        else {
            res.sendFile(Services.getArtwork(req.params.id));
        }
    });

    //Songs
    app.get('/tracks', (req, res) => {
        Repository.fetchSongs(function(songs){
            res.json(songs);
        });
    });

    app.get('/track/:id', (req, res) => {
        if (req.query.info === "true"){
            Repository.fetchSong(req.params.id, function(song){
                res.json(song);
            });
        }
        else {
            res.sendFile(Services.getSong(req.params.id));
        }
    });

    //Featured songs
    app.get('/featured', (req, res) => {
        Repository.fetchFeaturedSongs(function (featured){
            res.json(featured);
        });
    });

    //Testimonials
    app.get('/testimonials', (req, res) => {
        Repository.fetchTestimonials(function(testimonials){
            res.json(testimonials);
        });
    });

    //Articles
    app.get('/articles', (req, res) => {
        Repository.fetchArticles(function(articles){
            res.json(articles);
        });
    });

    app.get('/article/:id', (req, res) => {
        if (req.query.info === "true"){
            Repository.fetchArticle(req.params.id, function(article){
                res.json(article);
            });
        }
        else {
            res.sendFile(Services.getArticle(req.params.id));
        }
    });

    //Message send
    app.post('/send-message', (req, res) => {
        // console.log(req.socket.remoteAddress); //Getting remove address;
        res.send(Services.sendMessage(req.body));
    });
}