<?php
/**
 * Скопируйте этот файл в config.php на сервере (рядом с apply.php) и впишите значения.
 * config.php НЕ загружайте в репозиторий: там секретный токен бота.
 */
return [
    'bot_token' => '',          // токен от @BotFather
    'chat_id' => '',            // id группы, например -1001234567890
    // Необязательно: id тем, если группа — форум (с темами)
    // 'thread_fighter' => 0, 'thread_partner' => 0, 'thread_rubaha' => 0, 'thread_other' => 0,
    // 'turnstile_secret' => '',                 // секрет Cloudflare Turnstile, если включите капчу
    // 'allowed_hosts' => ['example.by', 'www.example.by'],  // по умолчанию — домен, на котором лежит сайт
];
