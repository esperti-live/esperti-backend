"use strict";
const { sanitizeEntity } = require("strapi-utils");
const slugify = require("slugify");
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async myProfile(ctx) {
    try {
      const { profile } = ctx.state.user;

      console.log("here");
      if (!profile) {
        console.log("herer");
        return await strapi.services.profile.create({
          name: `anon-${ctx.state.user.id}`,
          slug: `anon-${ctx.state.user.id}`,
          user: ctx.state.user.id,
        });
      }

      let entity = await strapi.services.profile.findOne({
        user: ctx.state.user.id,
      });
      return sanitizeEntity(entity, { model: strapi.models.profile });
    } catch (err) {
      return null;
    }
  },
  /**
   * May break the image on aws
   */
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.profile.search(ctx.query, ["image"]);
    } else {
      entities = await strapi.services.profile.find(ctx.query, ["image"]);
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.profile })
    );
  },
  /**
   * Find a profile from slug
   */
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.profile.findOne({ slug: id });
    return sanitizeEntity(entity, { model: strapi.models.profile });
  },
  /**
   * Create a profile
   * You can only create with yor own user.id (provided by magic plugin)
   */
  async create(ctx) {
    const { user } = ctx.state;

    if (ctx.state.user && ctx.state.user.profile) {
      return ctx.throw(400, "You already have a profile");
    }

    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      const slug = slugify(data.name);
      entity = await strapi.services.profile.create(
        { ...data, user: user.id, slug },
        { files }
      );
    } else {
      let slug,
        name = "";

      if (ctx.request.body.name) {
        slug = slugify(ctx.request.body.name);
        name = ctx.request.body.name;
      } else {
        slug = `anon-${user.id + 1}`;
        name = `anon-${user.id + 1}`;
      }

      entity = await strapi.services.profile.create({
        ...ctx.request.body,
        name,
        user: user.id,
        slug,
      });
    }
    return sanitizeEntity(entity, { model: strapi.models.profile });
  },
  /**
   * Update your profile, only your own user id
   */
  async update(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.profile.update(
        { id, user: user.id },
        data,
        {
          files,
        }
      );
    } else {
      entity = await strapi.services.profile.update(
        { id, user: user.id },
        ctx.request.body
      );
    }

    return sanitizeEntity(entity, { model: strapi.models.profile });
  },
  /**
   * Delete profile
   * Only your own user.id
   */
  async delete(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    const entity = await strapi.services.profile.delete({ id, user: user.id });
    return sanitizeEntity(entity, { model: strapi.models.profile });
  },
};
