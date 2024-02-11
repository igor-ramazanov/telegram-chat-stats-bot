SELECT 
  userId,  
  COUNT(*) as messageCount  
FROM 
    Messages 
WHERE
  timestamp>:ts0 AND timestamp<=:ts1 AND chatId=:chatId
GROUP BY 
    userId  
