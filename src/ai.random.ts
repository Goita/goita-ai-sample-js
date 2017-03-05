import * as goita from "goita-core";
export class RandomAI implements goita.AI {

    public chooseMove(info: goita.ThinkingInfo): goita.Move {
        const moves = info.getPossibleMoves();
        if (moves.length === 0) {
            throw new Error("no move to choose");
        }
        const i = goita.Util.rand.integer(0, moves.length - 1);
        return moves[i];
    }

    public evalMoves(info: goita.ThinkingInfo): goita.EvaluatedMove[] {
        const result = new Array<goita.EvaluatedMove>();
        const moves = info.getPossibleMoves();
        for (const move of moves) {
            // give some random value
            const score = goita.Util.rand.integer(0, moves.length - 1);
            const evaluated = new goita.EvaluatedMove(move, score);
            result.push(evaluated);
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
