const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } =require("../middleware");

router.get('/',  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    console.log(campground);
    res.render('campgrounds/show', { campground });
}));

router.post('/', isLoggedIn, catchAsync(async (req, res) => {
    if (!req.body.campground) throw new ExpressError('不正なキャンプ場データです', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();  
    req.flash('success', 'キャンプ場を作成しました');
    res.redirect(`/campgrounds/${campground._id}`);
}));
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, catchAsync(async (req, res) => {
   const { id } = req.params;
   const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
   req.flash('success', 'キャンプ場を更新しました');
   res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {    
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'キャンプ場を削除しました');
    res.redirect('/campgrounds');
}));
    
module.exports = router;