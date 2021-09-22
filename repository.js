require('dotenv').config();
const mysql = require('mysql');

class Repository {

    //Connectivity
    static connect() {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });

        this.connection.on("error", (err) => {
            // console.log("Database connection error occured");
        });
    }

    //Artworks
    static fetchArtworks(callback){
        this.connect();
        const query = `SELECT artworks.artwork_id as id, artworks.file_name as artwork, artists.name as artist, artworks.title FROM artworks INNER JOIN artists ON artists.artist_id = artworks.artist_id WHERE is_public = 1`;
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
        const query = `SELECT artworks.file_name as artwork, artworks.title, artworks.description, artists.name as artist_name, artists.biography as artist_biography, artists.media_facebook as artist_media_facebook, artists.media_instagram as artist_media_instagram, artists.media_spotify as artist_media_spotify, artists.media_youtube as artist_media_youtube, artists.media_soundcloud as artist_media_soundcloud FROM artworks INNER JOIN artists ON artworks.artist_id = artists.artist_id WHERE artworks.artwork_id = ${this.connection.escape(id)} AND artworks.is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows[0]);
            }
        });
    }

    //Songs
    static fetchSongs(callback){
        this.connect();
        const query = `SELECT songs.song_id as id, songs.file_name as track, artists.name as artist, songs.title, artworks.file_name as cover FROM songs INNER JOIN artworks ON artworks.artwork_id = songs.cover_id INNER JOIN artists ON artists.artist_id = songs.artist_id WHERE songs.is_public = 1`;
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
        const query = `SELECT songs.file_name as track, songs.title, songs.description, artworks.file_name as cover, songs.media_spotify, songs.media_apple_music, songs.media_youtube, songs.media_soundcloud, songs.media_itunes, artists.name as artist_name, artists.biography as artist_biography, artists.media_facebook as artist_media_facebook, artists.media_instagram as artist_media_instagram, artists.media_spotify as artist_media_spotify, artists.media_youtube as artist_media_youtube, artists.media_soundcloud as artist_media_soundcloud FROM songs INNER JOIN artworks ON artworks.artwork_id = songs.cover_id INNER JOIN artists ON artists.artist_id = songs.artist_id WHERE songs.song_id = ${this.connection.escape(id)} AND songs.is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
                return null;
            }
            else {
                return callback(rows[0]);
            }
        });
    }

    //Featured songs
    static fetchFeaturedSongs(callback){
        this.connect();
        const query = 'SELECT songs.song_id as id, songs.title, artists.name as artist, songs.file_name AS track, artworks.file_name AS cover, featured_songs.start_time, featured_songs.end_time, songs.media_spotify, songs.media_apple_music, songs.media_youtube, songs.media_soundcloud, songs.media_itunes FROM featured_songs INNER JOIN songs ON songs.song_id = featured_songs.song_id INNER JOIN artworks ON artworks.artwork_id = songs.cover_id INNER JOIN artists ON artists.artist_id = songs.artist_id';
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
        const query = 'SELECT article_id, title, image_name, summary FROM articles WHERE is_visible = 1';
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
                return callback(rows[0]);
            }
        });
    }
}

module.exports = Repository;