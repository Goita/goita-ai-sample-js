import * as goita from "goita-core";
import { Util } from "./ai.util";

export enum Stage {
    firstMove,
    beginning,
    middle,
    ending,
}

export class SimpleLogic {
    public static detectStage(info: goita.ThinkingInfo): Stage {
        const fields = Util.getFields(info);
        if (fields.every((f) => f.length === 0)) {
            return Stage.firstMove;
        }

        // count up number of koma on the fields
        let komaOnTheFields = 0;
        for (const f of fields) {
            komaOnTheFields += f.length;
        }
        // it's ending when more than or equal to 16 koma was played
        if (komaOnTheFields >= 16) {
            return Stage.ending;
        }

        if (komaOnTheFields >= 8) {
            return Stage.middle;
        }
        return Stage.beginning;
    }

    public static evalMoves(moves: goita.Move[], info: goita.ThinkingInfo, evalFunc: (move: goita.Move, info: goita.ThinkingInfo) => goita.EvaluatedMove): goita.EvaluatedMove[] {
        const list = new Array<goita.EvaluatedMove>();
        for (const m of moves) {
            list.push(evalFunc(m, info));
        }
        return list;
    }

    public static evalFirstMove(move: goita.Move, info: goita.ThinkingInfo): goita.EvaluatedMove {
        Util.replaceGyokuToOu(info);
        const myHand = Util.getMyHand(info);
        const myHandMap = Util.getKomaCountMap(myHand);

        let score: number = 0;

        const kh = [goita.Koma.kaku, goita.Koma.hisha];

        // eval block
        if (move.block === goita.Koma.shi) {
            score += myHandMap[goita.Koma.shi.value] * 5;
        }
        if (move.block.isKing) {
            score += -100;
        }

        for (const k of kh) {
            if (move.block === k) {
                score += -50;
            }
        }

        if (move.block === goita.Koma.gon) {
            score += -10;
        }

        // eval attack
        if (move.attack.isKing) {
            score += -50;
        }

        for (const k of kh) {
            if (move.attack === k) {
                score += myHandMap[k.value] * 20;
            }
        }

        score += myHandMap[move.attack.value] * 10;

        return new goita.EvaluatedMove(move, score);
    }

    public static evalMiddleMove(move: goita.Move, info: goita.ThinkingInfo): goita.EvaluatedMove {
        Util.replaceGyokuToOu(info);
        const myHand = Util.getMyHand(info);
        const myHandMap = Util.getKomaCountMap(myHand);
        const fields = Util.getFields(info);
        const leftNo = goita.Util.shiftTurn(info.turn, -1);
        const rightNo = goita.Util.shiftTurn(info.turn, 1);
        let score: number = 0;

        const kh = [goita.Koma.kaku, goita.Koma.hisha];

        // winning move
        if (!move.pass && myHand.length <= 2) {
            return new goita.EvaluatedMove(move, move.attack.score);
        }

        // partner's attack?
        if (goita.Util.isSameTeam(info.turn, info.lastAttack.no)) {
            if (move.pass) {
                score += 40;
            } else {
                score += -40;
            }
        }

        // eval pass------------------------
        if (move.pass) {
            // max will be range of 0-6
            const max = Math.max(fields[leftNo].length, fields[rightNo].length);
            score += (max - 4) * -15;

            return new goita.EvaluatedMove(move, score);
        }

        // eval block------------------------
        if (move.block.isKing) {
            score += -10;
        }

        // opponent's attack
        if (!goita.Util.isSameTeam(info.turn, info.lastAttack.no)) {

            // should block opponent's kaku/hisha attack
            for (const k of kh) {
                if (move.block.equals(k)) {
                    score += 30;
                }
            }

            // should pass gon attack while attacker's field count in 0-4
            if (move.block.equals(goita.Koma.gon)) {
                const gonCount = goita.KomaArray.count(fields[info.lastAttack.no], goita.Koma.gon);
                score += (gonCount - 4) * 10;
            }
        }

        // eval attack------------------------

        // king attack on 3rd attack wins at 100%
        if (move.attack.isKing && myHand.length <= 4) {
            score += 50;
        }

        // damadama on 2nd attack
        if (move.attack.isKing && myHand.length <= 6 && myHandMap[goita.Koma.ou.value]) {
            score += 50;
        }

        // better, you have more count of attack koma in hand
        score += myHandMap[move.attack.value] * 10;

        return new goita.EvaluatedMove(move, score);
    }

    public static getFirstMove(info: goita.ThinkingInfo): goita.Move {
        Util.replaceGyokuToOu(info);
        const myHand = Util.getMyHand(info);
        const myHandMap = Util.getKomaCountMap(myHand);

        // gon 4
        if (myHandMap[goita.Koma.gon.value] >= 4) {
            if (goita.KomaArray.count(myHand, goita.Koma.shi) > 0) {
                return goita.Move.ofFaceDown(info.turn, goita.Koma.shi, goita.Koma.gon);
            } else {
                return goita.Move.ofFaceDown(info.turn, goita.Koma.gon, goita.Koma.gon);
            }
        }

        // more than or equal to 4 shi
        if (myHandMap[goita.Koma.shi.value] >= 4) {
            return goita.Move.ofFaceDown(info.turn, goita.Koma.shi, goita.Koma.shi);
        }

        // double king
        if (myHandMap[goita.Koma.ou.value] >= 2) {
            // choose from other than king
            const left = myHand.filter((k) => !k.isKing);

            return SimpleLogic.basicFirstMoveSelect(info.turn, left);
        }

        return SimpleLogic.basicFirstMoveSelect(info.turn, myHand);
    }

    /**
     * eval moves for ending stage, using Monte Carlo method and perfect search
     */
    public static evalEndingMoves(info: goita.ThinkingInfo, attempt: number, searchLimit: number): goita.EvaluatedMove[] {

        const lists = new Array<goita.EvaluatedMove[]>();
        const solver = new goita.Solver();
        let evaledMoves: goita.EvaluatedMove[];
        for (let i = 0; i < attempt; i++) {
            const h = SimpleLogic.fillUnknownKoma(info);
            // process.stdout.write("attempt(" + i + "/" + attempt + ") guessed history: " + h + "\n");
            evaledMoves = solver.solve(h);
            if (evaledMoves.length === 0) {
                throw new Error("no result!");
            }
            lists.push(evaledMoves);
        }
        return Util.averageEvalScores(lists);
    }

    public static handsFromStr(handsStr: string): goita.Koma[][] {
        const hands = new Array<goita.Koma[]>();
        handsStr.split(",").forEach((s) => hands.push(goita.KomaArray.createFrom(s)));
        return hands;
    }

    public static handsToStr(hands: goita.Koma[][]): string {
        return hands.map((h) => goita.KomaArray.toString(h)).join(",");
    }

    /**
     * it returns string like "12345678,1123,45,4561"
     * get visible information about players hand
     */
    public static getOpenHands(info: goita.ThinkingInfo): string {
        const myHand = Util.getMyHand(info);
        const myField = Util.getMyOpenField(info);
        const fields = Util.getFields(info);

        // fill open koma list
        const openHands = new Array<goita.Koma[]>();
        for (let i = 0; i < goita.Define.maxPlayers; i++) {
            openHands[i] = new Array<goita.Koma>();
        }

        // my hand and field(includes face-down)
        myHand.forEach((k) => openHands[info.turn].push(k));
        myField.forEach((k) => openHands[info.turn].push(k));

        // the other players opened koma
        for (let i = 1; i <= 3; i++) {
            const no = goita.Util.shiftTurn(info.turn, i);
            fields[no].forEach((k) => {
                if (k.isHidden) {
                    return;
                }
                openHands[no].push(k);
            });
        }
        return SimpleLogic.handsToStr(openHands);
    }

    public static dequeueKomaFrom(list: goita.Koma[], ignoreShi: boolean): goita.Koma {
        if (list.length === 0) {
            throw new Error("list is empty");
        }
        if (ignoreShi && list.every((k) => k.isShi)) {
            throw new Error("cannot ignore shi");
        }
        let k: goita.Koma = list.pop();
        if (!ignoreShi || !k.isShi) {
            return k;
        }

        while (k.isShi) {
            list.unshift(k);
            k = list.pop();
        }
        return k;
    }

    public static removeFrom(list: goita.Koma[], koma: goita.Koma): void {
        const i = list.indexOf(koma);
        if (i < 0) {
            throw new Error("target koma is not in the list");
        }
        list.splice(i, 1);
    }

    public static getHiddenHands(info: goita.ThinkingInfo, openHandsStr: string, unknownListStr: string): string {
        const openHands = SimpleLogic.handsFromStr(openHandsStr);
        const openList = openHands[0].concat(openHands[1], openHands[2], openHands[3]);
        let unknownList = goita.KomaArray.createFrom(unknownListStr);

        const hiddenHands = new Array<goita.Koma[]>();

        // shi limit
        const shiLimitList = new Array<number>();
        for (let i = 0; i < goita.Define.maxPlayers; i++) {
            let shiLimit = 4;
            if (info.yakuInfo.some((yi) => yi.playerNo === i)) {
                shiLimit = 5;
            }
            shiLimitList[i] = shiLimit;
        }

        while (true) {
            // initialize hidden hands
            for (let i = 0; i < 4; i++) {
                hiddenHands[i] = new Array<goita.Koma>();
            }

            // fill shi to goshi player.
            for (let i = 0; i < shiLimitList.length; i++) {
                const limit = shiLimitList[i];
                if (limit === 5) {
                    const numberToAdd = limit - goita.KomaArray.count(openHands[i], goita.Koma.shi);
                    for (let c = 0; c < numberToAdd; c++) {
                        SimpleLogic.removeFrom(unknownList, goita.Koma.shi);
                        hiddenHands[i].push(goita.Koma.shi);
                    }
                }
            }

            // fill everyone's hand randomly
            try {
                for (let i = 0; i < goita.Define.maxPlayers; i++) {
                    const oh = openHands[i];
                    const hh = hiddenHands[i];
                    while ((oh.length + hh.length) < goita.Define.maxFieldLength) {
                        let k: goita.Koma;
                        const currentShiCount = goita.KomaArray.count(oh, goita.Koma.shi) + goita.KomaArray.count(hh, goita.Koma.shi);
                        k = SimpleLogic.dequeueKomaFrom(unknownList, currentShiCount >= shiLimitList[i]);
                        hh.push(k);
                    }
                }
            } catch (ex) {
                // re-arange hand

            }

            if (unknownList.length === 0) {
                break;
            } else {
                // initialize unknownlist
                unknownList = goita.KomaArray.createFrom(unknownListStr);
                goita.Util.shuffle(unknownList);
            }
        }

        return SimpleLogic.handsToStr(hiddenHands);
    }

    public static selectFaceDownKomaFromHiddenHand(hiddenHand: goita.Koma[]): goita.Koma {
        const len = hiddenHand.length;
        if (len === 0) {
            throw new Error("hidden hand must contain at least 1 koma");
        }
        const i = goita.Util.rand.integer(0, len - 1);
        return hiddenHand.splice(i, 1)[0];
    }

    /**
     * fill unknown hands and face down
     * @returns history string
     */
    public static fillUnknownKoma(info: goita.ThinkingInfo): string {

        const openHandsStr = SimpleLogic.getOpenHands(info);
        const openHands = SimpleLogic.handsFromStr(openHandsStr);
        const openList = openHands[0].concat(openHands[1], openHands[2], openHands[3]);

        const unknownList = SimpleLogic.getDiffKomaList(openList);
        goita.Util.shuffle(unknownList);

        const unknownListStr = goita.KomaArray.toString(unknownList);

        const hiddenHandsStr = SimpleLogic.getHiddenHands(info, openHandsStr, unknownListStr);
        const hiddenHands = SimpleLogic.handsFromStr(hiddenHandsStr);

        const facedownHands = new Array<goita.Koma[]>();
        for (let i = 0; i < goita.Define.maxPlayers; i++) {
            facedownHands[i] = new Array<goita.Koma>();
        }
        const moves = goita.BoardHistory.parseMoveHistory(info.history.split(","));
        // choose face down koma from owner's hiddenHand
        // TODO: AI can select a koma most likely to face-down
        for (const m of moves) {
            if (m.pass || !m.block.isHidden) {
                continue;
            }
            // choose randomly.
            const k = SimpleLogic.selectFaceDownKomaFromHiddenHand(hiddenHands[m.no]);

            // assign chosen koma as face down
            m.block = k;
            facedownHands[m.no].push(k);
        }

        const hands = Array<goita.Koma[]>();
        for (let i = 0; i < goita.Define.maxPlayers; i++) {
            hands[i] = new Array<goita.Koma>().concat(openHands[i], hiddenHands[i], facedownHands[i]);
        }

        // check #1. koma count in hand. if it's incorrect, retry filling koma
        // TODO: detect occurance condition to debug
        const komaMap = SimpleLogic.getKomaCountMap();
        const handList = new Array<goita.Koma>().concat(hands[0], hands[1], hands[2], hands[3]);
        let result = true;
        for (const km of komaMap) {
            if (km.count !== handList.filter((k) => k.value === km.key).length) {
                result = false;
            }
        }
        if (!result) {
            throw new Error("koma count in hand is incorrect");
        }

        // build history string
        const guessedHistoryStr = SimpleLogic.buildHistoryString(hands, info.dealer, moves);

        // check #2. if compare yakuInfo returns false, retry filling koma
        const guessedBoard = goita.Board.createFromString(guessedHistoryStr);
        if ((info.yakuInfo.length !== 0 && guessedBoard.yakuInfo.length !== 0) && (info.yakuInfo.length !== guessedBoard.yakuInfo.length || info.yakuInfo[0].playerNo !== guessedBoard.yakuInfo[0].playerNo || info.yakuInfo[0].yaku !== guessedBoard.yakuInfo[0].yaku)) {
            throw new Error("incorrect yaku information");
        }

        // build history string
        return guessedHistoryStr;
    }

    public static getKomaCountMap(): Array<{ key: string, count: number }> {
        return [
            { key: "1", count: 10 },
            { key: "2", count: 4 },
            { key: "3", count: 4 },
            { key: "4", count: 4 },
            { key: "5", count: 4 },
            { key: "6", count: 2 },
            { key: "7", count: 2 },
            { key: "8", count: 1 },
            { key: "9", count: 1 },
        ];
    }

    public static getDiffKomaList(list: goita.Koma[]): goita.Koma[] {
        const diff = new Array<goita.Koma>();
        const komaCountMap = SimpleLogic.getKomaCountMap();
        for (const m of komaCountMap) {
            const k = goita.Koma.fromStr(m.key);
            const diffCount = m.count - goita.KomaArray.countExact(list, k);
            for (let i = 0; i < diffCount; i++) {
                diff.push(k);
            }
        }
        return diff;
    }

    private static buildHistoryString(hands: goita.Koma[][], dealer: number, moves: goita.Move[]): string {
        const historyStr = new Array<string>();
        for (const h of hands) {
            if (h.length < goita.Define.maxFieldLength) {
                throw new Error("hand to put in history must be 8 char");
            }
            historyStr.push(goita.KomaArray.toString(h));
        }
        historyStr.push(goita.Define.dealerChar + (dealer + 1));
        for (const m of moves) {
            historyStr.push(m.toOpenString());
        }
        return historyStr.join(",");
    }

    private static basicFirstMoveSelect(turn: number, hand: goita.Koma[]): goita.Move {
        const myHandMap = Util.getKomaCountMap(hand);

        const sbgkgkh = [goita.Koma.shi, goita.Koma.bakko, goita.Koma.gin, goita.Koma.kin, goita.Koma.gon, goita.Koma.kaku, goita.Koma.hisha];
        const gbgk = [goita.Koma.gon, goita.Koma.bakko, goita.Koma.gin, goita.Koma.kin];
        const bgk = [goita.Koma.bakko, goita.Koma.gin, goita.Koma.kin];
        const kh = [goita.Koma.kaku, goita.Koma.hisha];

        for (const k of gbgk) {
            if (myHandMap[k.value] >= 4) {
                return goita.Move.ofFaceDown(turn, k, k);
            }
        }

        for (const k of kh) {
            if (myHandMap[k.value] >= 2) {
                if (myHandMap[goita.Koma.shi.value] >= 1) {
                    return goita.Move.ofFaceDown(turn, goita.Koma.shi, k);
                }
                for (const k2 of bgk) {
                    if (myHandMap[k2.value] >= 1) {
                        return goita.Move.ofFaceDown(turn, k2, k);
                    }
                }
            }
        }

        for (const k of gbgk) {
            if (myHandMap[k.value] >= 3) {
                if (myHandMap[goita.Koma.shi.value] >= 1) {
                    return goita.Move.ofFaceDown(turn, goita.Koma.shi, k);
                }
                for (const k2 of gbgk) {
                    if (myHandMap[k2.value] === 2) {
                        return goita.Move.ofFaceDown(turn, k2, k);
                    }
                }
            }
        }

        for (const k of gbgk) {
            if (myHandMap[k.value] >= 2) {
                if (myHandMap[goita.Koma.shi.value] >= 1) {
                    return goita.Move.ofFaceDown(turn, goita.Koma.shi, k);
                }
                for (const k2 of gbgk) {
                    if (myHandMap[k2.value] === 2) {
                        return goita.Move.ofFaceDown(turn, k2, k);
                    }
                }
                for (const k2 of gbgk.reverse()) {
                    if (myHandMap[k2.value] === 1) {
                        return goita.Move.ofFaceDown(turn, k2, k);
                    }
                }
            }
        }

        // haccho-bari
        for (const k of kh) {
            if (myHandMap[k.value] === 1) {
                for (const k2 of sbgkgkh) {
                    if (myHandMap[k.value] >= 1) {
                        return goita.Move.ofFaceDown(turn, k2, k);
                    }
                }
            }
        }

        // finallay, random pick
        const randKomas = Util.chooseUniqueItemsOfList(hand, 2);
        return goita.Move.ofFaceDown(turn, randKomas[0], randKomas[1]);
    }
}
