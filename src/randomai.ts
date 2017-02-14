import * as Goita from "goita-core";
export class RandomAI implements Goita.AI {

  private static getRandomIntegerBetween(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public chooseMove(info: Goita.ThinkingInfo): Goita.Move {
    const moves = info.getPossibleMoves();
    if (moves.length === 0) {
      return moves[0];
    }
    const i = RandomAI.getRandomIntegerBetween(0, moves.length - 1);
    return moves[i];
  }

  public evalMoves(info: Goita.ThinkingInfo): Goita.EvaluatedMove[] {
    const result = new Array<Goita.EvaluatedMove>();
    const moves = info.getPossibleMoves();
    for (const move of moves){
      // give some random value
      const score = RandomAI.getRandomIntegerBetween(0, moves.length - 1);
      const evaluated = new Goita.EvaluatedMove(move, score);
      result.push(evaluated);
    }
    return result;
  }
};
