var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../references.ts" />
var Cell = (function () {
    function Cell(row, column) {
        this.row = row;
        this.column = column;
        this.element = $("<div class='cell notBombed'></div>")[0];
    }
    Cell.parseCellLocation = function (pos) {
        var indices = pos.split(",");
        return { 'row': parseInt(indices[0]), 'column': parseInt(indices[1]) };
    };
    Cell.prototype.cellLocation = function () {
        return "" + this.row + "," + this.column;
    };
    return Cell;
})();
var Ship = (function () {
    function Ship(size) {
        this.size = size;
        this.column = 0;
        this.row = 0;
        this.isVertical = true;
        this.hits = 0;
        this.element = $("<div class='ship'></div>")[0];
    }
    Ship.prototype.updatePosition = function (row, column, vertical) {
        this.row = row;
        this.column = column;
        this.isVertical = vertical;
        this.updateLayout();
    };
    Ship.prototype.updateLayout = function () {
        var width = "9.9%";
        var height = "" + (this.size * 9.9) + "%";
        this.element.style.left = "" + (this.column * 10) + "%";
        this.element.style.top = "" + (this.row * 10) + "%";
        this.element.style.width = this.isVertical ? width : height;
        this.element.style.height = this.isVertical ? height : width;
    };
    Ship.prototype.flipShip = function () {
        this.isVertical = !this.isVertical;
        if (this.isVertical) {
            if (this.row + this.size > 10) {
                this.row = 10 - this.size;
            }
        }
        else {
            if (this.column + this.size > 10) {
                this.column = 10 - this.size;
            }
        }
        this.updateLayout();
    };
    Ship.prototype.getCellsCovered = function () {
        var cells = [];
        var row = this.row;
        var col = this.column;
        for (var i = 0; i < this.size; i++) {
            cells.push(row.toString() + "," + col.toString());
            if (this.isVertical) {
                row++;
            }
            else {
                col++;
            }
        }
        return cells;
    };
    Ship.prototype.isSunk = function () {
        return this.hits === this.size;
    };
    return Ship;
})();
var Board = (function () {
    function Board(element) {
        this.element = element;
        this.playerTurn = false;
        this.cells = [];
        this.ships = [];
        var cell = null;
        for (var row = 0; row < 10; row++) {
            this.cells[row] = [];
            for (var column = 0; column < 10; column++) {
                cell = new Cell(row, column);
                this.cells[row][column] = cell;
                element.appendChild(cell.element);
                $(cell.element).data("cellLocation", cell.cellLocation());
            }
        }
    }
    Board.getRandomPosition = function () {
        return {
            "row": Math.floor(Math.random() * 10),
            "column": Math.floor(Math.random() * 10),
            "vertical": (Math.floor(Math.random() * 2) === 1)
        };
    };
    Board.prototype.randomize = function () {
        var shipCount = this.ships.length;
        do {
            for (var shipIndex = 0; shipIndex < shipCount; shipIndex++) {
                var pos = Board.getRandomPosition();
                this.ships[shipIndex].updatePosition(pos.row, pos.column, pos.vertical);
            }
        } while (!this.boardIsValid());
    };
    Board.prototype.boardIsValid = function () {
        var allCells = [];
        for (var i = 0; i < this.ships.length; i++) {
            allCells = allCells.concat(this.ships[i].getCellsCovered());
        }
        allCells.sort();
        var dups = allCells.some(function (val, idx, arr) {
            return val === arr[idx + 1];
        });
        var outOfRange = allCells.some(function (val) {
            var pos = Cell.parseCellLocation(val);
            return !(pos.column >= 0 && pos.column <= 9 && pos.row >= 0 && pos.row <= 9);
        });
        if (dups || outOfRange) {
            return false;
        }
        else {
            this.updateCellData();
            return true;
        }
    };
    Board.prototype.updateCellData = function () {
        for (var i = 0; i < 100; i++) {
            var x = this.cells[Math.floor(i / 10)][i % 10];
            x.hasHit = false;
            x.shipIndex = -1;
        }
        for (var index = 0; index < this.ships.length; index++) {
            var ship = this.ships[index];
            ship.hits = 0;
            var cells = ship.getCellsCovered();
            for (var cell = 0; cell < cells.length; cell++) {
                var cellPos = Cell.parseCellLocation(cells[cell]);
                var targetCell = this.cells[cellPos.row][cellPos.column];
                targetCell.shipIndex = index;
            }
        }
        $(this.element).children(".cell").removeClass("cellHit cellMiss").addClass("notBombed");
    };
    return Board;
})();
var MyBoard = (function (_super) {
    __extends(MyBoard, _super);
    function MyBoard(element) {
        var _this = this;
        _super.call(this, element);
        this.element = element;
        this.shipSizes = [2];
        this.positioningEnabled = true;
        for (var row = 0; row < this.cells.length; row++) {
            for (var column = 0; column < this.cells[0].length; column++) {
                var cell = this.cells[row][column];
                $(cell.element).droppable({
                    disabled: false,
                    drop: function (event, ui) {
                        var shipElement = ui.draggable[0];
                        var shipIndex = $(shipElement).data("shipIndex");
                        var ship = _this.ships[shipIndex];
                        var shipX = Math.round(shipElement.offsetLeft / cell.element.offsetWidth);
                        var shipY = Math.round(shipElement.offsetTop / cell.element.offsetHeight);
                        ship.updatePosition(shipY, shipX, ship.isVertical);
                    }
                });
            }
        }
        var referenceCell = $("#playerBoard .cell").first();
        for (var i = 0; i < this.shipSizes.length; i++) {
            var ship = new Ship(this.shipSizes[i]);
            this.ships[i] = ship;
            ship.updatePosition(i, 0, false);
            this.element.appendChild(ship.element);
            ship.updateLayout();
            $(ship.element).data("shipIndex", i).draggable({
                disabled: false,
                containment: 'parent',
                grid: [referenceCell.width() * 0.99 + 2, referenceCell.height() * 0.99 + 2],
                cursor: 'crosshair'
            }).click(function (evt) {
                if (_this.positioningEnabled) {
                    var shipIndex = $(evt.target).data("shipIndex");
                    _this.ships[shipIndex].flipShip();
                }
            });
        }
        $(window).resize(function (evt) {
            $(_this.element).children(".ship").draggable("option", "grid", [referenceCell.width() * 0.99 + 2, referenceCell.height() * 0.99 + 2]);
        });
    }
    MyBoard.prototype.onCellClick = function (evt) {
        var x = evt.target;
        if ($(x).hasClass("cell") === false) {
            return;
        }
        if (!this.playerTurn) {
            this.onEvent.call(this, 'click');
        }
        if (this.playerTurn) {
            this.bombCell(x);
        }
    };
    MyBoard.prototype.bombCell = function (cellElem) {
        var cellPos = Cell.parseCellLocation($(cellElem).data("cellLocation"));
        var cell = this.cells[cellPos.row][cellPos.column];
        if (cell.hasHit) {
            return;
        }
        cell.hasHit = true;
        $(cellElem).removeClass("notBombed");
        var response = { type: "bombResponse", cellPos: cellPos, hit: false };
        if (cell.shipIndex >= 0) {
            $(cellElem).addClass("cellHit");
            var ship = this.ships[cell.shipIndex];
            ship.hits++;
            response.hit = true;
            if (ship.isSunk()) {
                this.element.appendChild(ship.element);
                ship.updateLayout();
                response.ship = { row: ship.row, column: ship.column, isVertical: ship.isVertical, size: ship.size };
                if (this.allShipsSunk()) {
                    response.allSunk = true;
                    this.onEvent.call(this, 'allSunk', response);
                }
                else {
                    this.onEvent.call(this, 'shipSunk', response);
                }
            }
            else {
                this.onEvent.call(this, 'hit', response);
            }
        }
        else {
            $(cellElem).addClass("cellMiss");
            this.onEvent.call(this, 'playerMissed', response);
        }
    };
    Object.defineProperty(MyBoard.prototype, "dragAndDropEnabled", {
        set: function (val) {
            var cells = $(this.element).children(".cell");
            var ships = $(this.element).children(".ship");
            this.positioningEnabled = val;
            ships.draggable("option", "disabled", !val);
            cells.droppable("option", "disabled", !val);
        },
        enumerable: true,
        configurable: true
    });
    MyBoard.prototype.allShipsSunk = function () {
        return this.ships.every(function (val) {
            return val.isSunk();
        });
    };
    return MyBoard;
})(Board);
var EnemyBoard = (function (_super) {
    __extends(EnemyBoard, _super);
    function EnemyBoard(element) {
        var _this = this;
        _super.call(this, element);
        $(element).click(function (evt) { return _this.onCellClick(evt); });
    }
    EnemyBoard.prototype.onCellClick = function (evt) {
        var x = evt.target;
        if ($(x).hasClass("cell") === false) {
            return;
        }
        if (!this.playerTurn) {
            this.onEvent.call(this, 'click');
        }
        if (this.playerTurn) {
            var cellPos = Cell.parseCellLocation($(x).data("cellLocation"));
            this.onEvent.call(this, 'bombCell', { type: 'bombCell', cellPos: cellPos });
        }
    };
    EnemyBoard.prototype.updateBoard = function (msg) {
        var cell = this.cells[msg.cellPos.row][msg.cellPos.column];
        $(cell.element).removeClass("notBombed");
        if (msg.hit) {
            $(cell.element).addClass("cellHit");
        }
        else {
            $(cell.element).addClass("cellMiss");
        }
        if (msg.hasOwnProperty('ship')) {
            var ship = new Ship(msg.ship.size);
            ship.updatePosition(msg.ship.row, msg.ship.column, msg.ship.isVertical);
            this.ships.push(ship);
            this.element.appendChild(ship.element);
        }
    };
    return EnemyBoard;
})(Board);
var Game = (function () {
    function Game(connection) {
        var _this = this;
        this.connection = connection;
        this.state = Game.gameState.begin;
        $("#game").append("<div id='status'></div><div id='boards'></div>");
        $("#boards").append("<div id='enemyBoard' class='board'></div><div id='playerBoard' class='board'></div>");
        this.updateStatus(Game.msgs.gameStart);
        this.startTime = Date.now();
        this.myBoard = new MyBoard($("#playerBoard")[0]);
        this.enemyBoard = new EnemyBoard($("#enemyBoard")[0]);
        this.myBoard.randomize();
        this.myBoard.dragAndDropEnabled = true;
        this.enemyBoard.onEvent = function (evt, evtData) {
            switch (evt) {
                case 'click':
                    switch (_this.state) {
                        case Game.gameState.begin:
                            _this.readyToStartGame();
                            break;
                        case Game.gameState.enemyReady:
                            _this.readyToStartGame();
                            break;
                        case Game.gameState.iAmReady:
                            _this.updateStatus(Game.msgs.waitForStart);
                            break;
                        case Game.gameState.enemyTurn:
                            _this.updateStatus(Game.msgs.wait);
                            break;
                        case Game.gameState.finished:
                            break;
                    }
                    break;
                case 'bombCell':
                    _this.connection.send(evtData);
                    break;
            }
        };
        this.myBoard.onEvent = function (evt, evtData) {
            switch (evt) {
                case 'playerMissed':
                    _this.connection.send(evtData);
                    break;
                case 'hit':
                    _this.connection.send(evtData);
                    break;
                case 'shipSunk':
                    _this.connection.send(evtData);
                    _this.updateStatus(Game.msgs.lostShip);
                    break;
                case 'allSunk':
                    _this.updateStatus(Game.msgs.lostGame);
                    _this.state = Game.gameState.finished;
                    _this.duration = Date.now() - _this.startTime;
                    _this.connection.send(evtData);
                    var gameOverEvent = new CustomEvent("gameOver", { detail: { gameResult: false, gameLength: game.duration } });
                    document.dispatchEvent(gameOverEvent);
                    break;
            }
        };
    }
    Game.prototype.readyToStartGame = function () {
        if (this.myBoard.boardIsValid()) {
            this.myBoard.dragAndDropEnabled = false;
            this.connection.send({ type: "readyToPlay" });
            if (this.state == Game.gameState.begin) {
                this.state = Game.gameState.iAmReady;
                this.updateStatus(Game.msgs.waitForStart);
            }
            else if (this.state = Game.gameState.enemyReady) {
                this.passToken();
                this.updateStatus(Game.msgs.wait);
            }
        }
        else {
            this.updateStatus(Game.msgs.invalidPositions);
        }
    };
    Game.prototype.updateStatus = function (msg) {
        $("#status").slideUp('fast', function () {
            $(this).text(msg).slideDown('fast');
        });
    };
    Game.prototype.getToken = function () {
        this.myBoard.playerTurn = false;
        this.enemyBoard.playerTurn = true;
        this.state = Game.gameState.myTurn;
        this.updateStatus(Game.msgs.yourTurn);
    };
    Game.prototype.passToken = function () {
        this.myBoard.playerTurn = true;
        this.enemyBoard.playerTurn = false;
        this.state = Game.gameState.enemyTurn;
        this.connection.send({ type: "passToken" });
    };
    Game.prototype.incomingBomb = function (cellPos) {
        var cell = this.myBoard.cells[cellPos.row][cellPos.column];
        this.myBoard.bombCell(cell.element);
    };
    Game.gameState = { begin: 0, enemyReady: 1, iAmReady: 2, enemyTurn: 3, myTurn: 4, finished: 5 };
    Game.msgs = {
        gameStart: "Drag your ships to the desired location on your board (on the right), then bomb a square on the left board to start the game!",
        invalidPositions: "All ships must be in valid positions before the game can begin.",
        waitForStart: "Wait until your enemy places all his ships.",
        wait: "Wait your turn!",
        gameOn: "Game on!",
        yourTurn: "Your turn, bomb now!",
        hit: "Good hit!",
        miss: "Miss.",
        shipSunk: "You sunk a ship!",
        lostShip: "You lost a ship!",
        lostGame: "You lost this time.",
        allSunk: "Congratulations!  You won!"
    };
    return Game;
})();
var game;
function handleMessage(message) {
    var msg = message;
    console.log(message);
    if (!msg || !msg.hasOwnProperty('type'))
        return;
    switch (msg.type) {
        case "readyToPlay":
            if (game.state == Game.gameState.iAmReady) {
                game.updateStatus(Game.msgs.gameOn);
            }
            else if (game.state == Game.gameState.begin) {
                game.state = Game.gameState.enemyReady;
            }
            break;
        case "passToken":
            game.getToken();
            break;
        case "bombCell":
            if (game.state == Game.gameState.enemyTurn) {
                game.incomingBomb(msg.cellPos);
            }
            break;
        case "bombResponse":
            game.enemyBoard.updateBoard(msg);
            if (msg.hit) {
                game.updateStatus(Game.msgs.hit);
                if (msg.hasOwnProperty("ship")) {
                    game.updateStatus(Game.msgs.shipSunk);
                }
            }
            else {
                game.updateStatus(Game.msgs.miss);
            }
            if (msg.hasOwnProperty("allSunk")) {
                if (msg.allSunk) {
                    game.state = Game.gameState.finished;
                    game.enemyBoard.playerTurn = false;
                    game.duration = Date.now() - game.startTime;
                    game.updateStatus(Game.msgs.allSunk);
                    var gameOverEvent = new CustomEvent("gameOver", { detail: { gameResult: true, gameLength: game.duration } });
                    document.dispatchEvent(gameOverEvent);
                }
            }
            if (game.state != Game.gameState.finished) {
                game.passToken();
            }
            break;
    }
}
function ereaseGame() {
    game = null;
    $("#game").empty();
}
//# sourceMappingURL=game.js.map