SELECT
    chatId,
    COUNT(*) / CAST(COUNT(DISTINCT DATE(timestamp)) AS FLOAT) AS messagesAvg
FROM
    Messages
WHERE
    CAST(strftime('%w', DATE(timestamp)) AS INTEGER) = :weekDay
GROUP BY
    chatId;