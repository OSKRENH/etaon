# Статистика скачиваний

Центр бренда записывает события успешной выдачи файлов из `/downloads/` во встроенный Cloudflare Workers Observability.

- cookies не используются;
- сторонние рекламные трекеры не подключены;
- IP-адреса и пользовательские идентификаторы в пользовательский лог не записываются;
- автоматические проверки `curl`, боты и range-запросы не учитываются;
- событие: `brand_download`;
- поля: `file`, `country`, `bytes`.

## Где смотреть

Cloudflare Dashboard → Workers & Pages → `etaon` → Observability → Logs.

В Query Builder установите фильтр:

```text
event = "brand_download"
```

Для рейтинга файлов создайте визуализацию:

- метрика: `Count`;
- группировка: `file`;
- фильтр: `event = "brand_download"`.

Данные можно выгрузить из Observability в JSON или CSV. На Workers Free логи хранятся 3 дня, на Workers Paid — 7 дней. Для более длинной истории позже можно одним переключателем включить Analytics Engine и вернуть готовую конфигурацию из истории Git.
