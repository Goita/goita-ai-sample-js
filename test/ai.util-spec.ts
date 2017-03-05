import * as chai from "chai";
import * as goita from "goita-core";
import { Util } from "../src/ai.util";

const expect = chai.expect;
describe("#Util", () => {
    describe("#chooseUniqueItemsOfList", () => {
        it("should choose given count of number items", () => {
            const list = [0, 1, 2, 3, 4, 5];
            const ret = Util.chooseUniqueItemsOfList(list, 2);
            expect(list).to.include.members(ret);
        });
    });

    describe("#getDiff", () => {
        it("should choose given count of number items", () => {
            const baselist = goita.KomaArray.createFrom("12312345");
            const targetlist = goita.KomaArray.createFrom("12312");
            const ret = Util.getDiff(baselist, targetlist);
            expect(goita.KomaArray.toString(ret)).to.equal("345");
        });
    });

    describe("#averageScores", () => {
        it("average", () => {
            const list = new Array<number[]>();
            list.push([1, 1, 1, 1]);
            list.push([2, 2, 2, 2]);
            list.push([3, 3, 3, 3]);
            list.push([2, 2, 2, 2]);
            const ret = Util.averageScores(list);
            expect(ret).to.deep.equal([2, 2, 2, 2]);
        });
    });
});
