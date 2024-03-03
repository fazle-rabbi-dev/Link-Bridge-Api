import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// SEO Metadata Schema
const seoMetadataSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  desc: {
    type: String,
    default: ""
  }
});

// Define Schema for user
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true
    },
    bio: {
      type: String,
      minlength: 1,
      maxlength: 200,
      trim: true,
      default: "🚀 Bio"
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: [3, "Username must be at least 3 digit"],
      maxlength: 30,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: "Invalid email format"
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      select: false
    },
    profilePic: {
      url: {
        type: String,
        default: ""
      },
      publicId: {
        type: String,
        default: ""
      }
    },
    authentication: {
      confirmationToken: {
        type: String,
        select: false
      },
      resetPasswordToken: {
        type: String,
        select: false
      },
      isConfirmed: {
        type: Boolean,
        default: false,
        select: false
      },
      authMethod: {
        type: String,
        default: "email+password"
      },
      providerAccessToken: {
        type: String,
        default: ""
      }
    },
    
    // For linktree profile customization
    design: {
      theme: {
        type: String,
        default: "default"
      },
      background: {
        color: {
          type: String,
          default: ""
        },
        image: {
          url: {
            type: String,
            default: ""
          },
          publicId: {
            type: String,
            default: ""
          }
        }
      },
      buttonStyle: {
        radius: {
          type: String,
          default: "rounded-full"
        },
        type: {
          type: String,
          default: "fill"
        },
        bgColor: {
          type: String,
          default: "#222"
        },
        textColor: {
          type: String,
          default: "#f8f8f8"
        }
      },
      fontStyle: {
        fontFamily: {
          type: String,
          default: "font-satoshi-medium"
        },
        fontColor: {
          type: String,
          default: "#222"
        }
      },
      socialPosition: {
        type: String,
        default: "top"
      }
    },
    
    // For SEO
    seoMetadata: seoMetadataSchema
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
