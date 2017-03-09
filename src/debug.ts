import * as AI from "./";
import * as goita from "goita-core";

const h = "12345678,12345679,11112345,11112345,s1,116,263,331,411,1p,2p,3p,411,1p,2p,311,4p,1p,217,3p,4p,175";
const b = goita.Board.createFromString(h);
const info = b.toThinkingInfo();
const ai = new AI.SimpleAI();
ai.monteCarloAttempts = 1000;
const stage = AI.SimpleLogic.detectStage(info);
let s: string = "";
switch (stage) {
    case AI.Stage.firstMove:
        s = "firstMove";
        break;
    case AI.Stage.beginning:
        s = "beginning";
        break;
    case AI.Stage.middle:
        s = "middle";
        break;
    case AI.Stage.ending:
        s = "ending";
        break;
    default:
        break;
}
// tslint:disable-next-line:no-console
console.log(s);

const ret = ai.evalMoves(info);
ret.sort((m1, m2) => m2.score - m1.score);
for (const evm of ret) {
    // tslint:disable-next-line:no-console
    console.log(evm.move.toOpenTextString() + ", " + evm.move.toOpenString() + " ,score: " + evm.score);
}

process.exit(0);
