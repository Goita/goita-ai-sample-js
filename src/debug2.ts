import * as goita from "goita-core";
import { RandomAI } from "./ai.random";
import { SimpleAI } from "./ai.simple";

const randomAI = new RandomAI();
const simpleAI = new SimpleAI();
const myNo = 0;
const games = 5;
let winCount = 0;
const game = goita.Factory.createGame();

for (let i = 0; i < games; i++) {
    game.startNewGame();
    while (!game.isEnd) {
        game.startNewDeal();
        if (game.board.isGoshiSuspended) {
            game.board.redeal();
        }
        while (!game.board.isEndOfDeal) {
            const info = game.board.toThinkingInfo();
            if (goita.Util.isSameTeam(myNo, game.board.turnPlayer.no)) {
                const m = simpleAI.chooseMove(info);
                game.board.playMove(m);
            } else {
                const rm = randomAI.chooseMove(info);
                game.board.playMove(rm);
            }
        }
        process.stdout.write(game.roundCount + " round has done. history: " + game.board.toHistoryString() + "\n");
    }

    process.stdout.write((i + 1) + "games done.\n");

    if (game.scores[0] > game.scores[1]) {
        winCount++;
    }
}

process.stdout.write("win/games: " + winCount + "/" + games + "\n");
process.stdout.write("win ratio: " + winCount / games * 100 + " [%]\n");

process.exit(0);
