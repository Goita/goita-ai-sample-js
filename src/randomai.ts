import * as Goita from "goita-core";
export class RandomAI implements Goita.AI {

  private static getRandomIntegerBetween(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public chooseMove(boardHistory: string): Goita.Move {
    const board = Goita.Board.createFromString(boardHistory);
    const moves = board.getPossibleMoves();
    if (moves.length === 0) {
      return moves[0];
    }
    const i = RandomAI.getRandomIntegerBetween(0, moves.length - 1);
    return moves[i];
  }

  public evalMoves(boardHistory: string): Goita.EvaluatedMove[] {
    const board = Goita.Board.createFromString(boardHistory);
    const result = new Array<Goita.EvaluatedMove>();
    const moves = board.getPossibleMoves();
    for (const move of moves){
      const evaluated = new Goita.EvaluatedMove();
      // give some random value
      evaluated.score = RandomAI.getRandomIntegerBetween(0, moves.length - 1);
      evaluated.move = move;
      result.push(evaluated);
    }
    return result;
  }
};
