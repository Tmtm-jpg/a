const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.post('/', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //show.ejsにおける合うべ手のレビューの要素はname="review[body]"とname="review[rating]"であるため
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'レビューを作成しました');
    res.redirect(`/campgrounds/${campground._id}`);
}));
//レビューの削除。キャンプ場スキーマにはレビューのIDが配列として保存されているので
//キャンプ場のidも取ってこないと、キャンプ場に紐づいているオブジェクトIDが宙ぶらりんになってしまう。
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'レビューを削除しました');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;