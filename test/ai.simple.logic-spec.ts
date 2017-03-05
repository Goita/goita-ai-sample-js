import * as chai from "chai";
import * as goita from "goita-core";
import { SimpleLogic } from "../src/";

const expect = chai.expect;
describe("SimpleLogic", () => {
    describe("#fillUnknownKoma", () => {
        it("should fill at first move", () => {
            const h = "12345678,12345679,11112345,11112345,s1";
            const b = goita.Board.createFromString(h);
            const info = b.toThinkingInfo();
            const ret = SimpleLogic.fillUnknownKoma(info);
            expect(ret).to.match(/^12345678,.{8},.{8},.{8},s1$/);
        });
        it("should fill at beginning", () => {
            const h = "12345678,12345679,11112345,11112345,s1,116,263,331";
            const b = goita.Board.createFromString(h);
            const info = b.toThinkingInfo();
            const ret = SimpleLogic.fillUnknownKoma(info);
            // [6]{1}.{7},[63]{2}.{6},[13]{2},{6},11112345,s1,1.6,263,331
            expect(ret).match(/.{1}[6]{1}.{6},[63]{2}.{6},[31]{2}.{6},11112345,s1,1.6,263,331/);
        });
    });
    // getDiffKomaList
    describe("#getDiffKomaList", () => {
        it("diff to 8 will be 24", () => {
            const hand = "12345678";
            const list = goita.KomaArray.createFrom(hand);
            const ret = SimpleLogic.getDiffKomaList(list);
            expect(ret.length).to.equal(24);
        });
    });
});
