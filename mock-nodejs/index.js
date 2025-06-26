const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json({ type: "*/*" }));

// ✅ Mock database cho DynamoDB (key = tên bảng)
const db = {
  uploadCsvTableName: [
    {
      id: { S: "1fab83f3-5260-43d7-afb2-f33cc596896c" },
      name: { S: "Item 1" },
      status: { S: "Pending" },
    },
    {
      id: { S: "234" },
      name: { S: "Item 2" },
      status: { S: "Pending" },
    },
  ],
  users:[
    {
      id: { S: "1" },
      name: { S: "User 1" },
    }
  ]
};

// ✅ Mock database cho Secrets Manager
const secrets = {
  HitoEnvSecret: JSON.stringify({
    uploadCsvTableName: "uploadCsvTableName",
    bucketCsvName: "linhclass-csv-bucket",
    sqsName: "linhclass-lambda-call-to-queue",
    prefixQueueURL: "https://sqs.ap-southeast-1.amazonaws.com/123456789012/",
  }),
};

// ✅ Mock SQS Queues
const queues = [
  "https://sqs.ap-northeast-1.amazonaws.com/123456789012/linhclass-lambda-call-to-queue",
  "https://sqs.ap-northeast-1.amazonaws.com/123456789012/dead-letter-queue",
];

app.post("/", (req, res) => {
  const target = req.headers["x-amz-target"];

  // ✅ DynamoDB handlers
  if (target && target.startsWith("DynamoDB_20120810.")) {
    switch (target) {
      case "DynamoDB_20120810.PutItem": {
        const { TableName, Item } = req.body;
        if (!db[TableName]) db[TableName] = [];
        db[TableName].push(Item);
        return res.json({});
      }

      case "DynamoDB_20120810.Scan": {
        const scanTable = req.body.TableName;
        const items = db[scanTable] || [];

        const filterExp = req.body.FilterExpression;
        const exprNames = req.body.ExpressionAttributeNames || {};
        const exprValues = req.body.ExpressionAttributeValues || {};

        if (filterExp && exprNames && exprValues) {
          const fieldName = exprNames["#id"];
          const filterValueObj = exprValues[":id"];
          const filterValue =
            filterValueObj?.S || filterValueObj?.N || filterValueObj;

          const filteredItems = items.filter((item) => {
            return (
              item[fieldName]?.S === filterValue ||
              item[fieldName]?.N === filterValue
            );
          });

          return res.json({ Items: filteredItems });
        }

        return res.json({ Items: items });
      }

      case "DynamoDB_20120810.UpdateItem": {
        const {
          TableName,
          Key,
          UpdateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
        } = req.body;

        const table = db[TableName];
        if (!table) {
          return res
            .status(400)
            .json({ message: `Table ${TableName} không tồn tại` });
        }

        const keyField = Object.keys(Key)[0];
        const keyValue = Key[keyField]?.S || Key[keyField]?.N;

        const itemIndex = table.findIndex((item) => {
          const value = item[keyField]?.S || item[keyField]?.N;
          return value === keyValue;
        });

        if (itemIndex === -1) {
          return res.status(404).json({ message: "Item không tồn tại để update" });
        }

        const attrName = ExpressionAttributeNames["#status"];
        const newValue = ExpressionAttributeValues[":status"];

        table[itemIndex][attrName] = newValue;

        return res.json({});
      }

      case "DynamoDB_20120810.ListTables":
        return res.json({ TableNames: Object.keys(db) });

      default:
        return res.status(400).json({
          message: "Unsupported DynamoDB operation",
          target,
        });
    }
  }

  // ✅ Secrets Manager handler
  if (target === "secretsmanager.GetSecretValue") {
    const { SecretId } = req.body;
    if (secrets[SecretId]) {
      return res.json({ SecretString: secrets[SecretId] });
    }
    return res.status(404).json({ message: "Secret not found" });
  }

  // ✅ SQS - ListQueues
  if (target === "AmazonSQS.ListQueues") {
    return res.json({ QueueUrls: queues });
  }

  // ✅ SQS - SendMessage
  if (target === "AmazonSQS.SendMessage") {
    const { QueueUrl, MessageBody } = req.body;

    if (!QueueUrl || !MessageBody) {
      return res.status(400).json({ message: "Missing QueueUrl or MessageBody" });
    }

    console.log(`📨 Mock SQS: Message sent to ${QueueUrl}: ${MessageBody}`);

    // Tính MD5 checksum đúng của MessageBody
    const md5 = crypto.createHash("md5").update(MessageBody).digest("hex");

    return res.json({
      MessageId: `1fab83f3-5260-43d7-afb2-f33cc596896c`,
      MD5OfMessageBody: md5,
    });
  }

  // ❌ Unsupported operation
  return res.status(400).json({ message: "Unsupported operation", target });
});

// 🔥 Server startup
app.listen(8001, () => {
  console.log("🔥 Mock DynamoDB, SecretsManager & SQS running at http://localhost:8001");
});
