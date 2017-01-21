import * as Goita from "goita-core";
export declare class RandomAI implements Goita.AI {
    private static getRandomIntegerBetween(min, max);
    chooseMove(boardHistory: string): Goita.Move;
    evalMoves(boardHistory: string): Goita.EvaluatedMove[];
}
