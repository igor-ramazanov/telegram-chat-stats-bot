SELECT 
  chatId,  
  COUNT(*) as totalMessages  
FROM 
    Messages 
WHERE
  timestamp>:ts0 AND timestamp<=:ts1
GROUP BY 
    chatId  
