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
        Services.getArtworks(function(artworks){
            res.json(artworks);
        });
    });

    app.get('/artwork/:id', (req, res) => {
        if (req.query.info === "true"){
            Services.getFullArtwork(req.params.id, function(artwork){
                res.json(artwork);
            });
        }
        else {
            res.sendFile(Services.getArtwork(req.params.id));
        }
    });

    //Songs
    app.get('/tracks', (req, res) => {
        try{
            Services.getSongs(function(songs){
                res.json(songs);
            });
        }
        catch(ex){
            
        }
    });

    app.get('/track/:id', (req, res) => {
        if (req.query.info === "true"){
            Services.getFullSong(req.params.id, function(song){
                res.json(song);
            });
        }
        else {
            res.sendFile(Services.getSong(req.params.id));
        }
    });

    //Featured songs
    app.get('/featured', (req, res) => {
        Services.getFeaturedSongs(function(featured){
            res.json(featured);
        });
    });

    //Testimonials
    app.get('/testimonials', (req, res) => {
        Services.getTestimonials(function(testimonials){
            res.json(testimonials);
        });
    });

    //Message send
    app.post('/send-message', (req, res) => {
        res.send(Services.sendMessage(req.body));
    });
}