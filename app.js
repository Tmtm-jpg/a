const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review')
const router = require('./routes/campgrounds');
const review = require('./routes/review');
const session = require('express-session'); 
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user");
const userRoutes = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 *7, //cookieの有効期限
        httpOnly: true 
    }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));//pluginで追加されたauthenticateメソッドを使って認証を行う
passport.serializeUser(User.serializeUser());//ユーザー情報をセッションに保存する方法を定義
passport.deserializeUser(User.deserializeUser());//セッションからユーザー情報を取得する方法を定義

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
app.get('/', (req, res) => {
    res.render('home');
});

app.get("/fakeuser", async (req, res) => {
    const user = new User({ email: 'fakeuser@example.com', username: 'fakeuser' });
    const newUser = await User.register(user, 'password');
    res.send(newUser);
});
app.use('/', userRoutes);
app.use('/campgrounds', router);
app.use('/campgrounds/:id/reviews', review);

app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //show.ejsにおける合うべ手のレビューの要素はname="review[body]"とname="review[rating]"であるため
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));
//レビューの削除。キャンプ場スキーマにはレビューのIDが配列として保存されているので
//キャンプ場のidも取ってこないと、キャンプ場に紐づいているオブジェクトIDが宙ぶらりんになってしまう。
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));


app.all('/{*any}', (req, res, next) => {
    next(new ExpressError('ページが見つかりません', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if (!err.message) {
        err.message = '何かがおかしいようです';
    }
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});