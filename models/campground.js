const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]//配列として管理
});

//app.jsでfindByIdAndDeleteを使っているからfindOneAndDeleteがトリガーとして作動する
campgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews //_idがdoc(campgrounds)のreviewsの配列に含まれていたらという条件文
            }
        });
    }
});



module.exports = mongoose.model('Campground', campgroundSchema);