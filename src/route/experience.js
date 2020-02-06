const express = require("express");
const router = express.Router();
const User = require("../model/user");
const Experience = require("../model/experience");
const { check, validationResult } = require("express-validator");

router.post(
  "/:email",
  [
    check("email")
      .isEmail()
      .withMessage("A valid email is required!"),
    check("role")
      .isLength({ min: 2 })
      .withMessage("Role is required. Min. Lenght is 2 characters."),
    check("company")
      .isLength({ min: 2 })
      .withMessage("Company is required. Min. Lenght is 2 characters."),
    check("startDate").isISO8601({ strict: true })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const email = req.params.email;
    try {
      const { role, company, startDate, endDate, description, area } = req.body;
      let newExperience = { role, company, startDate };
      if (endDate) newExperience = { ...newExperience, endDate };
      if (description) newExperience = { ...newExperience, description };
      if (area) newExperience = { ...newExperience, area };
      const response = await Experience.create(newExperience);
      await response.save();
      await User.findOneAndUpdate(
        { email },
        {
          $push: {
            experiences: response._id
          }
        }
      );
      res.json(response);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.put(
  "/:_id",
  [
    check("role")
      .isLength({ min: 2 })
      .withMessage("Role is required. Min. Lenght is 2 characters."),
    check("company")
      .isLength({ min: 2 })
      .withMessage("Company is required. Min. Lenght is 2 characters."),
    check("startDate").isISO8601({ strict: true })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const _id = req.params._id;
      const { role, company, startDate, endDate, description, area } = req.body;
      let update = { role, company, startDate };
      if (endDate) update = { ...update, endDate };
      if (description) update = { ...update, description };
      if (area) update = { ...update, area };
      const response = await Experience.findByIdAndUpdate(_id, update, {
        new: true
      });
      res.json(response);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);
module.exports = router;
