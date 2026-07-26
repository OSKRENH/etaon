# Статистика скачиваний

Центр бренда записывает только агрегированные события успешной выдачи файлов из `/downloads/` в Cloudflare Workers Analytics Engine.

- cookies не используются;
- сторонние рекламные трекеры не подключены;
- IP-адреса и пользовательские идентификаторы не сохраняются;
- автоматические проверки `curl`, боты и range-запросы не учитываются;
- набор данных: `etalon_downloads`;
- хранение данных в Analytics Engine — 3 месяца.

## Популярность файлов за 30 дней

```sql
SELECT
  blob1 AS file,
  SUM(_sample_interval) AS downloads
FROM etalon_downloads
WHERE timestamp > NOW() - INTERVAL '30' DAY
GROUP BY file
ORDER BY downloads DESC
```

## Скачивания по дням

```sql
SELECT
  toStartOfDay(timestamp) AS day,
  blob1 AS file,
  SUM(_sample_interval) AS downloads
FROM etalon_downloads
WHERE timestamp > NOW() - INTERVAL '30' DAY
GROUP BY day, file
ORDER BY day DESC, downloads DESC
```

Для запросов нужен API-токен Cloudflare с разрешением `Account Analytics Read`.
