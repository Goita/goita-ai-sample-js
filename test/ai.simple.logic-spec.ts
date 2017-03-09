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
            expect(ret).match(/^.{8},.{8},.{8},11112345,s1,1.6,263,331$/);
        });

        it("should fill at ending", () => {
            const h = "12345678,12345679,11112345,11112345,s1,116,263,331,411,1p,2p,3p,411,1p,2p,311,4p,1p,217,3p,4p,175";
            const b = goita.Board.createFromString(h);
            const info = b.toThinkingInfo();
            const ret = SimpleLogic.fillUnknownKoma(info);
            expect(ret).match(/^.{8},.{8},.{8},.{8},s1,1.6,263,331,411,1p,2p,3p,4.1,1p,2p,311,4p,1p,217,3p,4p,175$/);
            // create board to validate the guessed history
            expect(goita.Board.createFromString.bind(null, ret)).not.to.throw();
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
