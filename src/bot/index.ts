import { run } from '@grammyjs/runner';
import { handleCommand, handleGroup, handlePrivate } from './handle';
import { sessionFileStore } from './plugin';
import { bot } from '@/core/bot';

export async function runBot() {
  // plugins
  bot.use(sessionFileStore);

  await bot.api.setMyCommands([
    { command: 'help', description: '帮助' },
    { command: 'reset', description: '重置对话' },
    { command: 'allow', description: '仅管理员可用, 允许该群组使用Bot' },
    { command: 'not_allow', description: '仅管理员可用, 禁止该群组使用Bot' },
  ]);

  // handles
  bot.use(handleCommand);
  bot.use(handleGroup);
  bot.use(handlePrivate);

  bot.catch((err) => {
    console.log(`Error: \n${err}`);
  });

  // run
  const handle = run(bot);
  handle.task()?.then(() => {
    handle.stop();
  });

  process.once('SIGINT', () => handle.stop());
  process.once('SIGTERM', () => handle.stop());
}
