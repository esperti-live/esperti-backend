"use strict";
const cryptoRandomString = require("crypto-random-string");
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Expert creates a session between user and expert
   * expert profile is provided by magic plugin
   */
  async isValid(ctx) {
    const { slug } = ctx.params;
    const entity = await strapi.services.session.findOne({ slug }, []);
    if (entity && !entity.completed) {
      return { validSession: true, ...entity };
    }

    return { validSession: false };
  },

  async create(ctx) {
    const { user: expert } = ctx.state; // expert profile
    const { userId } = ctx.request.body;

    // Make sure userId is passed when making a session.
    if (!userId) {
      return ctx.throw(400, "No user id present");
    }

    const expertProfile = await strapi.services.profile.findOne({
      id: expert.profile,
    });

    // Check if expert profile exists
    if (!expertProfile) {
      return ctx.throw(404, "Expert not found");
    }

    // Make sure it is the expert that is creating the session
    if (expertProfile.type !== "expert") {
      return ctx.throw(403, "Only experts can create sessions");
    }

    const userProfile = await strapi.services.profile.findOne({ id: userId });
    const slug = cryptoRandomString({ length: 10, type: "alphanumeric" });

    // Make sure user profile exists
    if (!userProfile) {
      return ctx.throw(400, "User could not be found with that id");
    }

    // Create new session with user profile, expert profile and slug.
    await strapi.services.session.create({
      user_profile: userProfile.id,
      expert_profile: expert.profile,
      slug,
    });

    // Return newly created session.
    return await strapi.services.session.findOne({ slug }, []);
  },

  async start(ctx) {
    const { user } = ctx.state; // user profile
    const { slug } = ctx.params; // session slug

    const entity = await strapi.services.session.findOne({ slug });
    const userProfile = await strapi.services.profile.findOne({
      id: user.profile,
    });

    if (!userProfile) {
      return ctx.throw(400, "No user can be found");
    }

    // Make sure session exists.
    if (!entity) {
      return ctx.throw(400, "Session could not be found");
    }

    // Makes sure session is not finished
    if (entity.completed) {
      return ctx.throw(400, "Session is already completed");
    }

    // Checks that user is the one starting the counter
    if (entity.user_profile.id !== userProfile.id) {
      return ctx.throw(400, "Only user can start the session");
    }

    // Update session with current time
    strapi.services.session.update({ slug }, { start_time: new Date() });

    return { sucess: true };
  },

  async complete(ctx) {
    const { user } = ctx.state; // user profile
    const { slug } = ctx.params; // session slug

    const userProfile = await strapi.services.profile.findOne({
      id: user.profile,
    });

    if (!userProfile) {
      return ctx.throw(400, "No user can be found");
    }

    let entity = await strapi.services.session.findOne({ slug });

    // Checks that session exists
    if (!entity) {
      return ctx.throw(400, "Session could not be found");
    }

    // Makes sure session is still on going
    if (entity.completed) {
      return ctx.throw(400, "Session is already completed");
    }

    // Makes sure that session has already started
    if (!entity.start_time) {
      return ctx.throw(400, "Session hasn't started yet");
    }

    // Checks that user is the one starting the counter
    if (entity.user_profile.id !== userProfile.id) {
      return ctx.throw(400, "Only user can end the session");
    }

    const startDate = new Date(entity.start_time);
    const endDate = new Date();
    const timeInSeconds = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / 1000
    );
    await strapi.services.session.update(
      { slug },
      { slug, end_time: endDate, time: timeInSeconds, completed: true }
    );

    entity = await strapi.services.session.findOne({ slug }, []);

    return { entity };
  },
};
