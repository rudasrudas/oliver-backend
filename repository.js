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
            console.log("Database connection error occured");
        });

        // this.connection.connect(function(error) {
        //     if(!!error){
        //         console.log(error.message);
        //     }
        //     else {
        //         console.log('Connected');
        //     }
        // });
    }
    
    static disconnect(){
        // try{
        //      this.connection.end();
        // }
        // catch(ex){
        //     console.log("Connection error occured");
        // }
        // console.log('Disconnected');
    }

    //Artworks
    static fetchArtworks(callback){
        this.connect();
        const query = `SELECT artwork_id as id, file_name as artwork, title, description FROM artworks WHERE is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
            }
            else {
                Repository.disconnect();
                return callback(rows);
            }
        });
    }

    static fetchArtwork(file_name, callback){
        this.connect();
        const query = `SELECT file_name as artwork, title, description FROM artworks WHERE file_name = ${this.connection.escape(file_name)} AND is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
            }
            else {
                Repository.disconnect();
                return callback(rows);
            }
        });
    }

    //Songs
    static fetchSongs(callback){
        this.connect();
        const query = `SELECT songs.song_id as id, songs.file_name as track, artist, songs.title, songs.description, artworks.file_name as cover FROM songs INNER JOIN artworks ON artworks.artwork_id = songs.cover_id WHERE songs.is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
            }
            else {
                Repository.disconnect();
                return callback(rows);
            }
        });
    }

    static fetchSong(file_name, callback){
        this.connect();
        const query = `SELECT songs.file_name as track, artist, songs.title, songs.description, artworks.file_name as cover FROM songs INNER JOIN artworks ON artworks.artwork_id = songs.cover_id WHERE songs.file_name = ${this.connection.escape(file_name)} AND songs.is_public = 1`;
        this.connection.query(query, function(error, rows){
            if(!!error) {
                console.log(error);
            }
            else {
                Repository.disconnect();
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
            }
            else {
                Repository.disconnect();
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
            }
            else {
                Repository.disconnect();
                return callback(rows);
            }
        });
    }
}

module.exports = Repository;