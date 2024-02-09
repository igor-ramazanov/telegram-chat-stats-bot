WITH mc AS (
  SELECT 
    chatId, 
    userId, 
    SUM(messageCount) AS messageCount  
  FROM 
      MessageCount 
  WHERE
    timestamp=:timestamp
  GROUP BY 
      chatId, userId
), am AS (
  SELECT
    chatId,
    AVG(messageCount) AS messagesAvg
  FROM
    MessageCount
  GROUP BY
    chatId
)

SELECT 
    mc.chatId,
    am.messagesAvg,
    SUM(mc.messageCount) AS totalMessages,
    JSON_GROUP_ARRAY(
        JSON_OBJECT('userId', mc.userId, 'messageCount', mc.messageCount)
    ) AS userMessages
FROM mc
JOIN am ON am.chatId=mc.chatId
GROUP BY 
    mc.chatId;