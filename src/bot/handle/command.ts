import { Composer } from 'grammy';
import type { MyContext } from '#/bot';
import { isAdminUser, useBot } from '@/utils/useBot';
import { useConversations } from '@/utils/bardConversations';
import { bot } from '@/core/bot';

export const handleCommand = new Composer<MyContext>();

// 监听命令
handleCommand.command('reset', async (ctx) => {
  const type = ctx.chat.type;
  const isPrivate = type === 'private';

  if (type === 'group' || type === 'supergroup') {
    if (ctx.from && ctx.from.id) {
      useConversations(ctx.from.id).del();
    }
  }
  if (type === 'private') {
    useConversations(ctx.chat.id).del();
  }

  await ctx.reply('对话已重置!', {
    reply_to_message_id: isPrivate ? undefined : ctx.msg.message_id,
  });
});

handleCommand.command('start', async (ctx) => {
  if (useBot('private', ctx.chat.id)) {
    await ctx.reply('发送消息即可和 Bard 聊天!');
  }
});

handleCommand.command('help', async (ctx) => {
  const type = ctx.chat.type;
  const isPrivate = type === 'private';

  const message = `这是一个可以与 Google Bard 对话的 bot. \n\n每个人有独立的对话上下文. \n\n- 使用 /reset 可以重置对话. \n- 使用 /status 查看当前群组是否可用. \n- 使用 /allow 仅管理员可用, 允许当前群组使用. \n- 使用 /not_allow 仅管理员可用, 禁止当前群组使用.`;

  await ctx.reply(message, {
    reply_to_message_id: isPrivate ? undefined : ctx.msg.message_id,
  });
});

handleCommand.command('allow', async (ctx) => {
  const type = ctx.chat.type;
  const isPrivate = type === 'private';
  const session = ctx.session;
  const fromId = ctx.from?.id;

  if (isPrivate) {
    ctx.reply('仅群组中可用!');
  } else {
    if (fromId && isAdminUser(fromId)) {
      session.isUse = true;
      ctx.reply('已允许该群组使用!', {
        reply_to_message_id: ctx.msg.message_id,
      });
    } else {
      ctx.reply('仅管理员可使用此命令!', {
        reply_to_message_id: ctx.msg.message_id,
      });
    }
  }
});

handleCommand.command('not_allow', async (ctx) => {
  const type = ctx.chat.type;
  const isPrivate = type === 'private';
  const session = ctx.session;
  const fromId = ctx.from?.id;

  if (isPrivate) {
    ctx.reply('仅群组中可用!');
  } else {
    if (fromId && isAdminUser(fromId)) {
      session.isUse = false;
      ctx.reply('已禁止该群组使用!', {
        reply_to_message_id: ctx.msg.message_id,
      });
    } else {
      ctx.reply('仅管理员可使用此命令!', {
        reply_to_message_id: ctx.msg.message_id,
      });
    }
  }
});

handleCommand.command('status', async (ctx) => {
  const type = ctx.chat.type;
  const isPrivate = type === 'private';
  const session = ctx.session;

  if (isPrivate) return;

  if (session.isUse) {
    ctx.reply('当前群组可使用!', {
      reply_to_message_id: ctx.msg.message_id,
    });
  } else {
    ctx.reply('当前群组不可使用!', {
      reply_to_message_id: ctx.msg.message_id,
    });
  }
});
