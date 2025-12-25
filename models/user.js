const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default || require('passport-local-mongoose');
console.log(passportLocalMongoose);

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// passport-local-mongoose プラグインを適用
userSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        UserExistsError: 'そのユーザー名はすでに使われています。',
        MissingPasswordError: 'パスワードを入力してください。',
        AttemptTooSoonError: 'アカウントがロックされてます。時間をあけて再度試してください。',
        TooManyAttemptsError: 'ログインの失敗が続いたため、アカウントをロックしました。',
        NoSaltValueStoredError: '認証ができませんでした。',
        IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています。',
        IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています。',
    }
});

module.exports = mongoose.model('User', userSchema);