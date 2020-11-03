'use strict';
const { sanitizeEntity } = require('strapi-utils');
const slugify = require('slugify')
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async myProfile(ctx) {
    try{
      const { id } = ctx.state.user.profile;

      const entity = await strapi.services.profile.findOne({ id }, ["profile.image"]);
      return sanitizeEntity(entity, { model: strapi.models.profile });
    } catch(err){
      return null
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

        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.profile }));
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
        const {user} = ctx.state

        if(ctx.state.user && ctx.state.user.profile){
          return ctx.throw(400, "You already have a profile")
        }

        let entity;
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          const slug = slugify(data.name)
          entity = await strapi.services.profile.create({...data, user: user.id, slug}, { files });
        } else {
          const slug = slugify(ctx.request.body.name)
          entity = await strapi.services.profile.create({...ctx.request.body, user: user.id, slug});
        }
        return sanitizeEntity(entity, { model: strapi.models.profile });
    },
    /**
     * Update your profile, only your own user id
     */
    async update(ctx) {
        const { id } = ctx.params;
        const {user} = ctx.state

        let entity;
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          entity = await strapi.services.profile.update({ id, user: user.id}, data, {
            files,
          });
        } else {
          entity = await strapi.services.profile.update({ id, user: user.id }, ctx.request.body);
        }
    
        return sanitizeEntity(entity, { model: strapi.models.profile });
    },
    /**
     * Delete profile
     * Only your own user.id
     */
    async delete(ctx) {
        const { id } = ctx.params;
        const {user} = ctx.state

        const entity = await strapi.services.profile.delete({ id, user: user.id });
        return sanitizeEntity(entity, { model: strapi.models.profile });
    },
};
