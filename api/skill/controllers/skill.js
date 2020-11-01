'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    /**
     * Retrieve skills for a given user
     * Empty populate to avoid leaking user data
     * TODO: Test with many filters to try using OR queries to leak other peoples skills
     */
    async find(ctx) {
        const {user} = ctx.state
        
        let entities;
        if (ctx.query._q) {
          entities = await strapi.services.skill.search({...ctx.query, user: user.id}, []);
        } else {
          entities = await strapi.services.skill.find({...ctx.query, user: user.id}, []);
        }
    
        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.skill }));
      },
};
