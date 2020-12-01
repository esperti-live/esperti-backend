'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

/**
 * Given the initiator and receiver id's reutrn the proper chatID
 */
const getChatId = (initiator, receiver) => {
    if(initiator > receiver){
        return `${receiver}-${initiator}`
    }
    return `${initiator}-${receiver}`
}

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Retrieve records.
   *
   * @return {Array}
   */
  async find(ctx) {
    const { user } = ctx.state

    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.chat.search({...ctx.query, users: [user.id]});
    } else {
      entities = await strapi.services.chat.find({...ctx.query, users: [user.id]});
    }


    entities.map(entity => delete entity.users) //Better privacy
    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.chat }));
  },

  async create(ctx) {
    const { user } = ctx.state
    const { lastMessage, recipient } = ctx.request.body

    if(!lastMessage){
        return ctx.throw(400, "Please add last message")
    }
    if(!recipient){
        return ctx.throw(400, "Please add last recipient")
    }

    //recipient is id of other profile
    const otherProfile = await strapi.services.profile.findOne({id: recipient}, ["user", "user.id"])
    const otherId = otherProfile.user.id
    //Ids for relation
    const users = [
        user.id,
        otherId
    ]

    const profiles = [
        user.profile.id,
        otherProfile.id
    ]

    const myChats = await strapi.services.chat.find({
        users: [user.id],
        _limit: -1, //No limit
    })

    const alreadyExisting = myChats.find(chat => chat.users[0].id === otherId || chat.users[1].id === otherId)

    if(alreadyExisting){
        return await strapi.services.chat.update({
            id: alreadyExisting.id
        },
        {
            lastMessage
        })
    }

    //People for easy way to show info, indexed by profile id
    const people = {
        [profiles[0]]: user.profile.name,
        [profiles[1]]: otherProfile.name
    }

    //save
    const newChat = await strapi.services.chat.create({
        people,
        users,
        lastMessage,
        chatId: getChatId(profiles[0], profiles[1])
    })

    return newChat
  }
};
