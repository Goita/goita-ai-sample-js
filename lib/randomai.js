"use strict";
var Goita = require("goita-core");
var RandomAI = (function () {
    function RandomAI() {
    }
    RandomAI.getRandomIntegerBetween = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    RandomAI.prototype.chooseMove = function (info) {
        var moves = info.getPossibleMoves();
        if (moves.length === 0) {
            return moves[0];
        }
        var i = RandomAI.getRandomIntegerBetween(0, moves.length - 1);
        return moves[i];
    };
    RandomAI.prototype.evalMoves = function (info) {
        var result = new Array();
        var moves = info.getPossibleMoves();
        for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
            var move = moves_1[_i];
            var score = RandomAI.getRandomIntegerBetween(0, moves.length - 1);
            var evaluated = new Goita.EvaluatedMove(move, score);
            result.push(evaluated);
        }
        return result;
    };
    return RandomAI;
}());
exports.RandomAI = RandomAI;
;
