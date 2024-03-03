import mongoose from "mongoose";

const clickSchema = new mongoose.Schema({
  clickedAt: { type: Date, default: Date.now } // Date and time when the link was clicked
});

const linkSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  socialLinks: [
    {
      title: String,
      url: String,
      clickCount: { type: Number, default: 0 },
      clickHistory: [clickSchema]
    }
  ],
  customLinks: [
    {
      title: String,
      url: String,
      iconUrl: String,
      iconId: String,
      clickCount: { type: Number, default: 0 }, // Number of clicks for the link
      clickHistory: [clickSchema]
    }
  ]
});

const LinkModel = mongoose.model("Link", linkSchema);

export default LinkModel;
