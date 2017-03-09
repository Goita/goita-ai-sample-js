import * as goita from "goita-core";
import { SimpleLogic, Stage } from "./ai.simple.logic";

export class SimpleAI implements goita.AI {

    public searchLimit: number = 10000;
    public monteCarloAttempts: number = 20;

    public chooseMove(info: goita.ThinkingInfo): goita.Move {
        const moves = this.evalMoves(info);
        moves.forEach((m) => m.score += goita.Util.rand.integer(0, 5));
        moves.sort((a, b) => b.score - a.score);
        return moves[0].move;
    }

    public evalMoves(info: goita.ThinkingInfo): goita.EvaluatedMove[] {
        const moves = info.getPossibleMoves();
        let result: goita.EvaluatedMove[] = null;

        const stage = SimpleLogic.detectStage(info);
        switch (stage) {
            case Stage.firstMove:
                result = SimpleLogic.evalMoves(moves, info, SimpleLogic.evalFirstMove);
                break;
            case Stage.beginning:
                result = SimpleLogic.evalMoves(moves, info, SimpleLogic.evalMiddleMove);
                break;
            case Stage.middle:
                result = SimpleLogic.evalMoves(moves, info, SimpleLogic.evalMiddleMove);
                break;
            case Stage.ending:
                try {
                    result = SimpleLogic.evalEndingMoves(info, this.monteCarloAttempts, this.searchLimit);
                } catch (e) {
                    // fallback
                    result = SimpleLogic.evalMoves(moves, info, SimpleLogic.evalMiddleMove);
                }

                break;
            default:
                throw new Error("cannot detect stage");
        }
        return result;
    }

    public continueGoshi(info: goita.ThinkingInfo): boolean {
        return false;
    }

    public continueGoshiGoshiOpposite(info: goita.ThinkingInfo): boolean {
        return false;
    }
};
