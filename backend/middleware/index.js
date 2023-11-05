import authJwt from "./authJwt.js";
import verifySignUp from "./verifySignUp.js";
import account from "./verifyAccountStatus.js";

const middleware = {
    authJwt,
    verifySignUp,
    account
}

export default middleware;