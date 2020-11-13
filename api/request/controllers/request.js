"use strict";
const { sanitizeEntity } = require("strapi-utils");
const slugify = require("slugify");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Retrieve all requests
   * Purposefully no populate so you only get basic data
   * May break user data. Let's finesse later
   */
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.request.search(ctx.query, ["tags"]);
    } else {
      entities = await strapi.services.request.find(ctx.query, ["tags"]);
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.request })
    );
  },
  /**
   * Retrieve one request, by slug
   * @param {*} ctx
   */
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.request.findOne({ slug: id }, [
      "tags",
    ]);
    return sanitizeEntity(entity, { model: strapi.models.request });
  },
  /**
   * Create a new requst
   * Your request is automatically attached to your profile
   */
  async create(ctx) {
    const { user } = ctx.state;
    const { title } = ctx.request.body;
    const slug = slugify(`${title} - ${new Date().getTime()}`);
    const entity = await strapi.services.request.create({
      ...ctx.request.body,
      profile: user.profile,
      slug,
    });
    return sanitizeEntity(entity, { model: strapi.models.request });
  },
};
