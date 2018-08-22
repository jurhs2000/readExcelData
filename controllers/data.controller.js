var connection = require('../connection');

function setData(req, res) {
    console.log(req.body)
    //Ordenar datos del excel
    var xlsx2json = require('xlsx2json');
    xlsx2json(req.body.src).then(jsonArray => {
        var dataFormated = [];
        jsonArray[0].forEach((element) => {
            var movie = {
                id: 0,
                name: '',
                originalName: '',
                year: '',
                genre: []
            }
            var A = (element.A.split("::"))
            var B = (element.B.split("::"))
            var C = (element.C.split("::"))
            movie.id = +A[0];
            movie.name = A[1].split("(")[0];
            switch (A[1].split("(").length) {
                case 2:
                    movie.year = A[1].split("(")[1];
                    break;
                case 3:
                    movie.originalName = A[1].split("(")[1];
                    movie.originalName = movie.originalName.slice(0, movie.originalName.length - 2);
                    movie.year = A[1].split("(")[2];
                    break;
            }
            if(A.length == 3) { movie.genre = A[2].split("|"); }
            //Componer strings
                movie.name = movie.name.slice(0, movie.name.length - 1);
            //
            if(element.B != '') {
                movie.name = B[0].split("(")[0] + A[1].split("(")[0];
                switch (B[0].split("(").length) {
                    case 2:
                        movie.year = B[0].split("(")[1];
                        break;
                    case 3:
                        movie.originalName = B[0].split("(")[1];
                        movie.year = B[0].split("(")[2];
                        break;
                }
                if(B.length == 2) { movie.genre = B[1].split("|"); }
                //Componer strings
                    movie.name = movie.name.slice(1, movie.name.length);
                    movie.originalName = movie.originalName.slice(0, movie.originalName.length - 2);
                //
            }
            if(element.C != '') {
                switch (C[0].split("(").length) {
                    case 2:
                        movie.originalName = (C[0].split("(")[0]).slice(0, (C[0].split("(")[0]).length - 2) + " " + B[0].split("(")[1];
                        movie.originalName = movie.originalName.slice(1, movie.originalName.length);
                        movie.year = C[0].split("(")[1];
                        break;
                    case 3:
                        movie.name = C[0].split("(")[0] + A[1].split("(")[0] + B[0].split("(")[0];
                        movie.name = movie.name.slice(1, movie.name.length);
                        movie.originalName = C[0].split("(")[1];
                        movie.originalName = movie.originalName.slice(0, movie.originalName.length - 2);
                        movie.year = C[0].split("(")[2];
                        break;
                }
                if(C.length == 2) { movie.genre = C[1].split("|"); }
            }
            //Componer strings
                movie.year = +(movie.year.slice(0, movie.year.length - 1));
            //
            dataFormated.push(movie);
        });
        //Insertar generos
        var genres = [];
        connection.query('SELECT * FROM genre', (error, results, fields) => {
            if (error) throw error;
            results.forEach((element) => {
                genres.push(element.title);
            }, this);

            dataFormated.forEach((element) => {
                element.genre.forEach((genre) => {
                    if(genres.indexOf(genre) == -1) {
                        genres.push(genre);
                        var data  = {title: genre};
                        connection.query('INSERT INTO genre SET title = ?', data.title, (error, results, fields) => {
                            if (error) throw error;
                        });
                    }
                }, this);
            }, this);

        });
        //insertando todas las peliculas
        dataFormated.forEach((element) => {
            var movie = {
                title: element.name,
                originalTitle: element.originalName,
                productionYear: element.year
            }
            connection.query('INSERT INTO movie SET title = ?, originalTitle = ?, productionYear = ?',
            [movie.title, movie.originalTitle, movie.productionYear],
            (error, results, fields) => {
                if (error) throw error;
            });
        }, this);
        //Insertar peliculas_generos
        dataFormated.forEach((element) => {
            element.genre.forEach((genre) => {
                var data  = {title: genre};
                connection.query('SELECT id FROM genre WHERE title = ?', data.title, (error, results, fields) => {
                    if (error) throw error;
                    var id = results[0].id;
                    connection.query('INSERT INTO movie_genre SET idGenre = ?, idMovie = ?', [id, (dataFormated.indexOf(element) + 1)], (error, results, fields) => {
                        if (error) throw error;
                    });
                });
            }, this);
        }, this);
    });
}

module.exports = setData