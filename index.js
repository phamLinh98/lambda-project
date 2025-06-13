const sqsName = '123';
const checkItemSpecificItemInSQSList = { QueueUrls: ['https://sqs.us-east-1.amazonaws.com/123'] };

const exitstingQueueUrl = checkItemSpecificItemInSQSList.QueueUrls || [];
const queueExists = exitstingQueueUrl.some((queueUrl) =>
  queueUrl.endsWith(`/${sqsName}`)
);

console.log('queueExists', queueExists);