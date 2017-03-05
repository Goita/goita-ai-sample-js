import * as chai from "chai";
import * as goita from "goita-core";
import { RandomAI } from "../src/ai.random";

const expect = chai.expect;
describe("#RandomAI", () => {
    describe("#chooseMove", () => {
        it("should choose one of the possible moves", () => {
            const history = "12345678,12345679,11112345,11112345,s1,113,2p,3p,431,1p,2p,315";
            const board = goita.Board.createFromString(history);
            const info = board.toThinkingInfo();
            const ai = new RandomAI();
            const chosenMove = ai.chooseMove(info).toOpenString();
            const possibleMoves = new Array<string>();
            for (const move of info.getPossibleMoves()) {
                possibleMoves.push(move.toOpenString());
            }
            expect(chosenMove).is.oneOf(possibleMoves);
        });
    });
    describe("#evalMoves", () => {
        it("should return evaluatedMoves", () => {
            const history = "12345678,12345679,11112345,11112345,s1,113,2p,3p,431,1p,2p,315";
            const board = goita.Board.createFromString(history);
            const info = board.toThinkingInfo();
            const ai = new RandomAI();
            const moves = ai.evalMoves(info);
            expect(moves.length).to.equal(info.getPossibleMoves().length);
        });
    });
});
