import mongoose from "mongoose";

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true, // Leading and trailing whitespaces will be removed before saving it to the mongodb
      unique: true, // No two documents in mongodb can have same name
      required: true,
    },
    age: Number,
    gender: {
      type: String,
      default: "Male",
      enum: ["Male", "Female", "Others"],
    },
    race: {
      type: String,
      default: "Human",
      enum: [
        "Human",
        "Elf",
        "Dwarf",
        "Orc",
        "Half-elf",
        "Half-orc",
        "Gnome",
        "Halfling",
        "Tiefling",
      ],
    },
    class_system: {
      type: String,
      default: "Fighter",
      enum: [
        "Fighter",
        "Barbarian",
        "Mage",
        "Cleric",
        "Druid",
        "Ranger",
        "Rogue",
        "Bard",
        "Sorcerer",
      ],
    },
    is_npc: {
      type: Boolean,
      default: false,
    },
    profile_pic: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Record", schema);
