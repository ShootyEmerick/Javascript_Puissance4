(function ($) {
    $.fn.myFourInRow = function (options) {
        var defaults = {
                columns: 7,
                rows: 6,
                colorJ1: '#f4f000',
                colorJ2: '#f22613'
            },
            options = $.extend(defaults, options);

        var dom_table = [];
        var turn = 1;
        var played = 0;
        var game_status = 0;
        var game = $('#game');
        var lastToken;
        var settings = {};
        var score = {
            J1 : 0,
            J2 : 0
        };
        game.before('<div class="container" id="param_content"></div>');
        var divContent = $('#param_content');
        divContent.before('<div class="container" id="img_puissance"><img src="docs/image4.jpeg"></div>');
        divContent.append('<div class="container"><div class="row"><div class="col-6"><form id="param_form"' +
            ' name="param_form" method="post" action="index.html"><p>Lignes : </p><input class="form-control col-8" type="text"' +
            ' id="rows_param" name="rows_param" placeholder="4 à 100 lignes"><br><p>Colonnes : </p>' +
            '<input class="form-control col-8" type="text" id="columns_param"' +
            ' name="columns_param" placeholder="4 à 25 colonnes"><br>' +
            '<p>Couleur Joueur 1 : </p><input type="color" id="color_param_J1" value="' + options.colorJ1 + '"><br><br>' +
            '<p>Couleur Joueur 2 : </p><input type="color" id="color_param_J2" value="' + options.colorJ2 + '"><br><br>' +
            '<input class="btn btn-warning" type="submit" id="param_game" value="Lancer la partie"></form></div>' +
            '<div class="col-6" id="img_description"><img src="docs/puissance4.jpeg"></p></div></div></div>');

        $('#img_description').append('<p>Il s’agit d’un jeu, tout à tour, à deux joueurs.</p>'+
            '<p>Quand un joueur aligne à la suite au moins 4 de ses pièces horizontalement, verticalement,' +
            ' ou en diagonal, il remporte la partie.</p>' +
            '<p>La partie est déclarée nulle si la grille de jeu est pleine.</p>');

        $('#param_form').on("submit", function (e) {
            e.preventDefault();
            var rows = $('#rows_param').val();
            var columns = $('#columns_param').val();
            var colorJ1 = $('#color_param_J1').val();
            var colorJ2 = $('#color_param_J2').val();
            settings = {
              rows,
              columns,
              colorJ1,
              colorJ2
            };
            if (settings.colorJ1 === settings.colorJ2) {
                window.alert("Merci de choisir des couleurs différentes\nEvitez les couleurs qui se ressemblent ou amusez vous bien");
            } else {
                $('#param_content').remove();
                $('#img_puissance').remove();
                init($('#game'), settings, turn);
            }
        });

        function init (domTarget, settings)
        {
            if (settings.rows === "") {
                settings.rows = options.rows;
            }
            if (settings.rows > 100) {
                settings.rows = 100;
            }
            if (settings.columns === "") {
                settings.columns = options.columns;
            }
            if (settings.columns > 25) {
                settings.columns = 25;
            }
            game.append('<div id="container-table" class="container-fluid">' +
                '<div class="container"><table id="myTable"></table></div></div>');
            var table = $('#myTable');
            table.attr("id", "plateau");
            table.css("border", '2px #fff outset');
            table.css("background-color", 'rgba(141, 21, 18, 0.5');
            $('body').css('background', "url('docs/bg_dragon.jpg')");

            $('#container-table').before('<div class="container" id="container-parameters">' +
                '<div class="row"><div class="col-4" id="container_score"><h3>Score</h3>' +
                '<div class="col-6"><p id="scoreJ1">Joueur 1 : ' + score.J1 + '</p></div>' +
                '<div class="col-6"><p id="scoreJ2">Joueur 2 : ' + score.J2 + '</p></div></div></div>' +
                '<button id="resetPlateau" class="btn btn-warning">Relancer la partie</button>' +
                '<button id="resetScore" class="btn btn-warning">Remettre à zéro le score</button></div>');
            var resetPlateau = $('#resetPlateau');
            resetPlateau.css('margin-right', '20px');
            var container_params = $('#container-parameters');
            container_params.css('color', 'white');
            $('#container_score').after('<div class="col-8" id="container_turn">' +
                '<h3 id="h3_turn">Joueur ' + turn + '<br> A vous de jouer.</h3></div>');
            $('#h3_turn').css('margin-bottom', '20px');
            var container_turn = $('#container_turn');
            container_turn.css('color', 		'white');
            container_turn.append('<div id="undoLastToken"></div>');
            var undoLastToken = $('#undoLastToken');
            undoLastToken.css('width', '70px').css('height', '70px').css('margin-bottom', '20px')
                .css('background', "url('docs/undoLastToken.png')")
                .css('background-size', '100% 100%');
            container_params.css('margin-bottom', '100px');
            var y, tr, x, td;
            for (y = 0; y < settings.rows; y++) {
                table.append('<tr id="tr' + y + '">');
                tr = $("#tr" + y);
                dom_table[y] = [];
                for (x = 0; x < settings.columns; x++) {
                    tr.append('<td id="td' + x + 'row' + y + '">');
                    td = $('#td' + x + 'row' + y);
                    td.css('width', '50px').css('height', '50px').css('border-radius', '50%')
                        .css('background-color', 'rgba(255, 255, 255, 0.8)').css('border', '2px #000 inset');
                    td.attr("data-column", x);
                    dom_table[y][x] = td;
                }
            }
            resetPlateau.on('click', function () {
               resetTheGame();
            });

            $('#plateau').on('click', (function (e) {
                catchClick(e, settings);
            }));

            undoLastToken.on('click', function () {
                cancelLastToken();
            });

            var btnScore = $('#resetScore');
            btnScore.on('click', function () {
                resetTheGame();
                resetScore();
                var game = $('#game');
                game.empty();
                init(game, settings, turn);
            });
        }

        function resetScore()
        {
            score.J1 = 0;
            score.J2 = 0;
        }

        function cancelLastToken()
        {
            lastToken.css('background-color', 'rgba(255, 255, 255, 0.8)');
            if (lastToken.hasClass("J1")) {
                lastToken.removeClass("J1");
                turn = 3 - turn;
                $('#h3_turn').html('Joueur ' + turn + '<br> A vous de jouer.');
            }
            if (lastToken.hasClass("J2")) {
                lastToken.removeClass("J2");
                turn = 3 - turn;
                $('#h3_turn').html('Joueur ' + turn + '<br> A vous de jouer.');
            }
            $('#undoLastToken').off('click');
        }

        function createToken(column, settings)
        {
            var tdFirstRow = $('#td' + column + 'row0');
            var offsetFirstRow = tdFirstRow.offset();
            $('#game').prepend('<span id="token"></span>');
            if (turn === 1) {
                $('#token').css({
                    position : "absolute",
                    left : parseInt(offsetFirstRow.left),
                    top : parseInt(offsetFirstRow.top) - 50,
                    width : 50,
                    height : 50,
                    zIndex : 100,
                    backgroundColor : settings.colorJ1,
                    borderRadius : 50
                });
            }
            if (turn === 2) {
                $('#token').css({
                    position : "absolute",
                    left : parseInt(offsetFirstRow.left),
                    top : parseInt(offsetFirstRow.top) - 50,
                    width : 50,
                    height : 50,
                    zIndex : 100,
                    backgroundColor : settings.colorJ2,
                    borderRadius : 50
                });
            }
        }

        function animateToken(row, column, settings)
        {
            var tdAnimate = $('#td' + column + 'row' + row);
            lastToken = tdAnimate;
            var offsetAnimate = tdAnimate.offset();
            if (turn === 1) {
                $('#plateau').off('click');
                $('#resetPlateau').off('click');
                $('#resetScore').off('click');
                $('#token').animate({
                    'top' : parseInt(offsetAnimate.top)
                }, 1000, function () {
                    $(this).remove();
                    tdAnimate.css("background-color", settings.colorJ1);
                    checkForWin(row, column);
                    $('#plateau').on('click', (function (e) {
                        catchClick(e, settings);
                    }));
                    $('#undoLastToken').on('click', function () {
                        cancelLastToken();
                    });
                    $('#resetPlateau').on('click', function () {
                        resetTheGame();
                    });
                    $('#resetScore').on('click', function () {
                        resetTheGame();
                        resetScore();
                        var game = $('#game');
                        game.empty();
                        init(game, settings, turn);
                    });
                });
            }
            if (turn === 2) {
                $('#plateau').off('click');
                $('#resetPlateau').off('click');
                $('#resetScore').off('click');
                $('#token').animate({
                    'top' : parseInt(offsetAnimate.top)
                }, 1000, function () {
                    $(this).remove();
                    tdAnimate.css("background-color", settings.colorJ2);
                    checkForWin(row, column);
                    $('#plateau').on('click', (function (e) {
                        catchClick(e, settings);
                    }));
                    $('#undoLastToken').on('click', function () {
                        cancelLastToken();
                    });
                    $('#resetPlateau').on('click', function () {
                        resetTheGame();
                    });
                    $('#resetScore').on('click', function () {
                        resetTheGame();
                        resetScore();
                        var game = $('#game');
                        game.empty();
                        init(game, settings, turn);
                    });
                });
            }
        }

        function playGame (column, settings)
        {
            if (game_status !== 0) {
                if (window.confirm("La partie est finie!\nVous ne pouvez pas rejouer maintenant !\nSouhaitez-vous relancer une autre partie?")) {
                    resetTheGame();
                }
                return;
            }
            var row;
            for (let y = 0; y < settings.rows; y++) {
                if (dom_table[y][column].hasClass('J1') || dom_table[y][column].hasClass('J2')) {
                    row = y -1;
                    break;
                } else {
                    row = settings.rows -1;
                }
            }
            if (row < 0 || row > settings.rows) {
                window.alert("La colonne sélectionnée est pleine!\nChoisissez en un autre.");
                return;
            } else {
                createToken(column, settings);
                animateToken(row, column, settings);
                setData(row, column, turn, settings);
            }
        }

        function catchClick (event, settings) {
            var column = event.target.dataset.column;
            if (column === undefined) {
                window.alert("Merci de cliquer sur un rond du plateau.\nLe fond ne fait pas partie du jeu.");
            }
            if (column) {
                playGame(parseInt(column), settings);
            }
        }

        function setData (row, column, player)
        {
            if (player === 1) {
                dom_table[row][column].addClass("J1");
            }
            if (player === 2) {
                dom_table[row][column].addClass("J2");
            }
            played++;
            turn = 3 - turn;
            $('#h3_turn').html('Joueur ' + turn + '<br> A vous de jouer.');
        }

        function checkForWin(row, column)
        {
            if (winChecker(row, column, 'J' + parseInt((3 - turn)))) {
                game_status = 3 - turn;
            } else if (played >= settings.rows * settings.columns) {
                game_status = -1;
            }

            switch (game_status) {
                case -1:
                    window.alert("Egalité parfaite !");
                    break;
                case 1:
                    window.alert("Victoire du joueur 1");
                    score.J1++;
                    $('#scoreJ1').html('Joueur 1 : ' + score.J1);
                    break;
                case 2:
                    window.alert("Victoire du joueur 2");
                    score.J2++;
                    $('#scoreJ2').html('Joueur 2 : ' + score.J2);
                    break;
            }
        }


        function winChecker(row, column, caracterName) {

            if (checkWinHorizontal(row, column, caracterName)) {
                return true;
            } else if (checkWinVertical(row, column, caracterName)) {
                return true;
            } else if (checkWinDiagonalDown(row, column, caracterName)) {
                return true;
            } else if (checkWinDiagonalUp(row, column, caracterName)) {
                return true;
            } else {
                return false;
            }
        }

        function checkWinHorizontal(row, column, caracterName)
        {
            var count, y;
            count = 0;
            for (y = 0; y < settings.columns; y++) {
                if (dom_table[row][y].hasClass(caracterName)) {
                    count++;
                } else {
                    count = 0;
                }
                if (count >= 4) {
                    count = 0;
                    for (y = 0; y < settings.columns; y++) {
                        if (dom_table[row][y].hasClass(caracterName)) {
                            if (caracterName === "J1") {
                                dom_table[row][y].css("border", "2px outset " + settings.colorJ1);
                                count++;
                            }
                            if (caracterName === "J2") {
                                dom_table[row][y].css("border", "2px outset " + settings.colorJ2);
                                count++;
                            }
                        }
                        if (count === 4) {
                            break;
                        }
                    }
                    return true;
                }
            }
        }

        function checkWinVertical(row, column, caracterName)
        {
            var count, x;
            count = 0;
            for (x = 0; x < settings.rows; x++) {
                if (dom_table[x][column].hasClass(caracterName)) {
                    count = count+1;
                } else {
                    count = 0;
                }
                if (count >= 4) {
                    count = 0;
                    for (x = 0; x < settings.rows; x++) {
                        if (dom_table[x][column].hasClass(caracterName)) {
                            if (caracterName === "J1") {
                                dom_table[x][column].css("border", "2px outset " + settings.colorJ1);
                                count++;
                            }
                            if (caracterName === "J2") {
                                dom_table[x][column].css("border", "2px outset " + settings.colorJ2);
                                count++;
                            }
                        }
                        if (count === 4) {
                            break;
                        }
                    }
                    return true;
                }
            }
        }

        function checkWinDiagonalDown(row, column, caracterName)
        {
            var count, x;
            count = 0;
            var firstAssociatedToken = row - column;

            for (x = Math.max(firstAssociatedToken, 0); x < Math.min(settings.rows, settings.columns + firstAssociatedToken); x++) {
                if (dom_table[x][x - firstAssociatedToken].hasClass(caracterName)) {
                    count = count+1;
                } else {
                    count = 0;
                }
                if (count >= 4) {
                    count = 0;
                    for (x = Math.max(firstAssociatedToken, 0); x < Math.min(settings.rows, settings.columns + firstAssociatedToken); x++) {
                        if (dom_table[x][x - firstAssociatedToken].hasClass(caracterName)) {
                            if (caracterName === "J1") {
                                dom_table[x][x - firstAssociatedToken].css("border", "2px outset " + settings.colorJ1);
                                count++;
                            }
                            if (caracterName === "J2") {
                                dom_table[x][x - firstAssociatedToken].css("border", "2px outset " + settings.colorJ2);
                                count++;
                            }
                        }
                        if (count === 4) {
                            break;
                        }
                    }
                    return true;
                }
            }
        }
        
        function checkWinDiagonalUp(row, column, caracterName)
        {
            var count, x;
            count = 0;
            var firstAssociatedToken = row + column;

            for (x = Math.max(firstAssociatedToken - settings.columns + 1, 0); x < Math.min(settings.rows, firstAssociatedToken + 1); x++) {
                if (dom_table[x][firstAssociatedToken - x].hasClass(caracterName)) {
                    count = count+1;
                } else {
                    count = 0;
                }
                if (count >= 4) {
                    count = 0;
                    for (x = Math.max(firstAssociatedToken - settings.columns + 1, 0); x < Math.min(settings.rows, firstAssociatedToken + 1); x++) {
                        if (dom_table[x][firstAssociatedToken - x].hasClass(caracterName)) {
                            if (caracterName === "J1") {
                                dom_table[x][firstAssociatedToken - x].css("border", "2px outset " + settings.colorJ1);
                                count++;
                            }
                            if (caracterName === "J2") {
                                dom_table[x][firstAssociatedToken - x].css("border", "2px outset " + settings.colorJ2);
                                count++;
                            }
                        }
                        if (count === 4) {
                            break;
                        }
                    }
                    return true;
                }
            }
        }

        function resetTheGame()
        {
            let i, j;
            for (i = 0; i < settings.rows; i++) {
                for (j = 0; j < settings.columns; j++) {
                    dom_table[i][j].css('background-color', 'rgba(255, 255, 255, 0.8)');
                    $('#td' + j + 'row' + i).css('border', '2px inset #000');
                    if (dom_table[i][j].hasClass("J1")) {
                        dom_table[i][j].removeClass("J1");
                    }
                    if (dom_table[i][j].hasClass("J2")) {
                        dom_table[i][j].removeClass("J2");
                    }
                }
            }
            played = 0;
            game_status = 0;
        }
    };
}(jQuery));
