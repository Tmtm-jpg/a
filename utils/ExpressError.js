class ExpressError extends Error {
    constructor(message, statusCode) {
        super(); //エラークラスのコンストラクタを呼び出す
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;