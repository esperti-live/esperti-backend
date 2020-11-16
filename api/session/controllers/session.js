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
  async create(ctx) {
    const { user: expert } = ctx.state; // expert profile
    const { userId } = ctx.request.body;

    if (!userId) {
      return ctx.throw(400, "No user id present");
    }

    const profile = await strapi.services.profile.findOne({ id: userId });
    const slug = cryptoRandomString({ length: 10, type: "alphanumeric" });

    if (!profile) {
      return ctx.throw(400, "User could not be found with that id");
    }

    await strapi.services.session.create({
      user_profile: profile.id,
      expert_profile: expert.profile,
      slug,
    });

    return await strapi.services.session.findOne({ slug }, []);
  },

  async start(ctx) {
    const { slug } = ctx.params;
    const { start_time } = ctx.request.body;

    const entity = strapi.services.session.findOne({ slug });

    if (!entity) {
      return ctx.throw(400, "Session could not be found");
    }

    if (!start_time) {
      return ctx.throw(400, "Provide start time");
    }

    strapi.services.session.update(
      { slug },
      { start_time: new Date(start_time) }
    );

    return { sucess: true };
  },

  async complete(ctx) {
    const { slug } = ctx.params;

    if ((!slug, !end_time)) {
      return ctx.throw(400, "Provide slug and end_time");
    }

    let entity = await strapi.services.session.findOne({ slug });

    if (!entity) {
      return ctx.throw(400, "Session could not be found");
    }

    const startDate = new Date(entity.start_time);
    const endDate = new Date();
    const timeInSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

    await strapi.services.session.update(
      { slug },
      { slug, end_time: endDate, time: timeInSeconds }
    );

    entity = await strapi.services.session.findOne({ slug }, []);

    return { entity };
  },
};
