require("dotenv").config();
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { OAuth2Client } = require("google-auth-library")

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
)

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  )
}

// Register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({
      email,
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const user = await User.create({
      email,
      password: hashedPassword,
    })

    const token = generateToken(
      user._id
    )

    res.status(201).json({
      success: true,
      token,
      user,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Email Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({
      email,
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Google account check
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account was created with Google. Please login with Google.",
      })
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const token = generateToken(
      user._id
    )

    res.status(200).json({
      success: true,
      token,
      user,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Google Login
exports.googleLogin = async (
  req,
  res
) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Credential missing",
      })
    }

    const ticket =
      await client.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      })

    const payload = ticket.getPayload()

    const { email } = payload

    let user = await User.findOne({
      email,
    })

    // First Google Login
    if (!user) {
      user = await User.create({
        email,
        password: null,
      })
    }

    const token = generateToken(
      user._id
    )

    res.status(200).json({
      success: true,
      token,

    })
  } catch (error) {
    console.error(error)
console.error("GOOGLE LOGIN ERROR:", error)

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}