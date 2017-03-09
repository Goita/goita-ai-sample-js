import * as goita from "goita-core";
export class Util {

    public static chooseUniqueItemsOfList<T extends number | string>(list: T[], choiceCount: number): T[] {
        const indexList = new Array<number>();
        for (let i = 0; i < list.length; i++) {
            indexList.push(i);
        }
        goita.Util.shuffle(indexList);
        const uItemsIndexes = indexList.slice(indexList.length - choiceCount);
        const uItems = new Array<T>();
        for (const i of uItemsIndexes) {
            uItems.push(list[i]);
        }
        return uItems;
    }

    public static getMyHand(info: goita.ThinkingInfo): goita.Koma[] {
        return goita.KomaArray.createFrom(info.hand).filter((k) => k !== goita.Koma.empty);
    }

    public static getMyOpenField(info: goita.ThinkingInfo): goita.Koma[] {
        return goita.KomaArray.createFrom(info.hiddenField).filter((k) => k !== goita.Koma.empty);
    }

    public static getFields(info: goita.ThinkingInfo): goita.Koma[][] {
        const list = new Array<goita.Koma[]>();
        for (const f of info.fields) {
            list.push(goita.KomaArray.createFrom(f).filter((k) => k !== goita.Koma.empty));
        }
        return list;
    }

    public static getDiff(baseList: goita.Koma[], targetList: goita.Koma[]): goita.Koma[] {
        const diff = new Array<goita.Koma>();
        const targetCopy = targetList.slice();
        for (const k of baseList) {
            if (goita.KomaArray.containsExact(targetCopy, k)) {
                const i = targetCopy.indexOf(k);
                targetCopy.splice(i, 1);
            } else {
                diff.push(k);
            }
        }
        return diff;
    }

    public static averageScores(scoreLists: number[][]): number[] {
        if (!scoreLists[0]) {
            throw new Error("wrong parameter");
        }
        const len = scoreLists[0].length;
        const itemCount = scoreLists.length;
        const result = new Array<number>();

        for (let i = 0; i < len; i++) {
            let sum: number = 0;
            for (const list of scoreLists) {
                if (list.length !== len) {
                    throw new Error("all of list's length must be the same");
                }
                sum += list[i];
            }
            result[i] = sum / itemCount;
        }
        return result;
    }

    public static averageEvalScores(evalLists: goita.EvaluatedMove[][]): goita.EvaluatedMove[] {
        if (!evalLists[0]) {
            throw new Error("wrong parameter");
        }
        const lists = new Array<number[]>();
        const ret = new Array<goita.EvaluatedMove>();
        for (const evlist of evalLists) {
            lists.push(evlist.map((e) => e.score));
        }

        const averagedScores = Util.averageScores(lists);
        for (let i = 0; i < evalLists[0].length; i++) {
            ret[i] = evalLists[0][i];
            const v = averagedScores[i];
            if (isNaN(v)) {
                throw new Error("averaged socre is NaN");
            }
            ret[i].score = v;
        }
        return ret;
    }

    public static replaceGyokuToOu(info: goita.ThinkingInfo): void {
        info.hand = info.hand.replace(goita.Koma.gyoku.value, goita.Koma.ou.value);
        for (let i = 0; i < info.fields.length; i++) {
            info.fields[i] = info.fields[i].replace(goita.Koma.gyoku.value, goita.Koma.ou.value);
        }
        if (info.lastAttack) {
            if (info.lastAttack.block === goita.Koma.gyoku) {
                info.lastAttack.block = goita.Koma.ou;
            }
            if (info.lastAttack.attack === goita.Koma.gyoku) {
                info.lastAttack.attack = goita.Koma.ou;
            }
        }
    }

    public static getKomaCountMap(hand: goita.Koma[]): { [key: string]: number } {
        const map: { [key: string]: number } = {};
        for (const uk of goita.KomaArray.getUnique(hand)) {
            map[uk.value] = goita.KomaArray.count(hand, uk);
        }
        for (const k of Util.getAllKomaList()) {
            if (!map[k.value]) {
                map[k.value] = 0;
            }
        }
        map[goita.Koma.gyoku.value] = map[goita.Koma.ou.value];
        return map;
    }

    private static getAllKomaList(): goita.Koma[] {
        const list = new Array<goita.Koma>();
        list.push(goita.Koma.shi);
        list.push(goita.Koma.gon);
        list.push(goita.Koma.bakko);
        list.push(goita.Koma.gin);
        list.push(goita.Koma.kin);
        list.push(goita.Koma.kaku);
        list.push(goita.Koma.hisha);
        list.push(goita.Koma.ou);
        return list;
    }
}
