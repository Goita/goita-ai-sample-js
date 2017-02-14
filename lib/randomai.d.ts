import * as Goita from "goita-core";
export declare class RandomAI implements Goita.AI {
    private static getRandomIntegerBetween(min, max);
    chooseMove(info: Goita.ThinkingInfo): Goita.Move;
    evalMoves(info: Goita.ThinkingInfo): Goita.EvaluatedMove[];
}
