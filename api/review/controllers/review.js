"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const { user } = ctx.state;
    const { comment, rating, sessionId } = ctx.request.body;

    if (!comment || !rating || !sessionId) {
      ctx.throw(400, "Provide a comment, rating and session id");
    }

    const entity = await strapi.services.review.create({
      comment,
      rating,
      user_profile: user.profile,
      session: sessionId,
    });
    return entity;
  },
};
