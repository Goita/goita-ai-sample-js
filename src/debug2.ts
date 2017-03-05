import * as chai from "chai";
import * as goita from "goita-core";
import { SimpleLogic } from "./ai.simple.logic";

const expect = chai.expect;

const h = "12345678,12345679,11112345,11112345,s1,116,263,331";
            const b = goita.Board.createFromString(h);
            const info = b.toThinkingInfo();
            const ret = SimpleLogic.fillUnknownKoma(info);
            // [6]{1}.{7},[63]{2}.{6},[13]{2},{6},11112345,s1,1.6,263,331
            expect(ret).match(/[6]{1}.{7},[63]{2}.{6},[13]{2},{6},11112345,s1,1.6,263,331/);

process.exit(0);
