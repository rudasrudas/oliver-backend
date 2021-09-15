const mysql = require('mysql');

class Repository {

    //Connectivity
    static connect() {
        this.connection = mysql.createConnection({
            host: '153.92.7.1',
            user: 'u335144674_root',
            password: 'YC@N6>DwZ6&k',
            database: 'u335144674_data'
        });

        this.connection.on("error", (err) => {
            // console.log("Database connection error occured");
        });
    }

    //Artworks
    static fetchArtworks(callback){
        this.connect();
        const query = `SELECT artwork_id as id, file_name as artwork, artist, title, description FROM artworks WHERE is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows);
            }
        });
    }

    static fetchArtwork(id, callback){
        this.connect();
        const query = `SELECT file_name as artwork, artist, title, description FROM artworks WHERE artwork_id = ${this.connection.escape(id)} AND is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows);
            }
        });
    }

    //Songs
    static fetchSongs(callback){
        this.connect();
        const query = `SELECT songs.song_id as id, songs.file_name as track, songs.artist, songs.title, songs.description, artworks.file_name as cover FROM songs INNER JOIN artworks ON artworks.artwork_id = songs.cover_id WHERE songs.is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows);
            }
        });
    }

    static fetchSong(id, callback){
        this.connect();
        const query = `SELECT songs.file_name as track, songs.artist, songs.title, songs.description, artworks.file_name as cover FROM songs INNER JOIN artworks ON artworks.artwork_id = songs.cover_id WHERE songs.song_id = ${this.connection.escape(id)} AND songs.is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows);
            }
        });
    }

    //Featured songs
    static fetchFeaturedSongs(callback){
        this.connect();
        const query = 'SELECT songs.song_id as id, songs.title, songs.artist, songs.file_name AS track, artworks.file_name AS cover, featured_songs.start_time, featured_songs.end_time, songs.media_spotify, songs.media_apple_music, songs.media_youtube, songs.media_soundcloud, songs.media_itunes FROM featured_songs INNER JOIN songs ON songs.song_id = featured_songs.song_id INNER JOIN artworks ON artworks.artwork_id = songs.cover_id';
        this.connection.query(query, function(error, rows) {
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows);
            }
        });
    }

    //Testimonials
    static fetchTestimonials(callback){
        this.connect();
        const query = 'SELECT content, author FROM testimonials WHERE is_visible = 1';
        this.connection.query(query, function(error, rows) {
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows);
            }
        });
    }

    //Articles
    static fetchArticles(callback){
        this.connect();
        const query = 'SELECT article_id, title, content, image_name, summary FROM articles WHERE is_visible = 1';
        this.connection.query(query, function(error, rows) {
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows);
            }
        });
    }

    static fetchArticle(id, callback){
        this.connect();
        const query = `SELECT title, content, image_name, summary FROM articles WHERE article_id = ${this.connection.escape(id)}`;
        this.connection.query(query, function(error, rows) {
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows);
            }
        });
    }
}

module.exports = Repository;