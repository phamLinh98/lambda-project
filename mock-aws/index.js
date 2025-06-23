const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json({ type: "*/*" }));

// Mock database cho DynamoDB, key = tên bảng
const db = {
  uploadCsvTableName: [
    { id: { S: "123" }, name: { S: "Item 1" }, status: {} },
    { id: { S: "234" }, name: { S: "Item 20" }, status: {} },
    {
      id: { S: "6af9fe83-72d2-4dea-a157-6d2ba8ca5614" },
      name: { S: "Auto Created" },
      status: { S: "Init" },
    },
  ],
};

// Mock database cho Secrets Manager
const secrets = {
  HitoEnvSecret: JSON.stringify({
    uploadCsvTableName: "uploadCsvTableName",
    bucketCsvName: "linhclass-csv-bucket",
    anotherSecretKey: "anotherSecretValue",
  }),
};

app.post("/", (req, res) => {
  const target = req.headers["x-amz-target"];

  // =============================
  // ✅ MOCK DYNAMODB
  // =============================
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

        if (!db[TableName]) {
          return res
            .status(400)
            .json({ message: `Table ${TableName} không tồn tại` });
        }

        const keyField = Object.keys(Key)[0];
        const keyValue = Key[keyField].S || Key[keyField].N;

        const items = db[TableName];

        const itemIndex = items.findIndex(
          (item) =>
            item[keyField]?.S === keyValue || item[keyField]?.N === keyValue
        );

        if (itemIndex === -1) {
          console.error(`❌ Không tìm thấy item với ${keyField} = ${keyValue}`);
          console.error(
            "📦 Tất cả keys trong DB:",
            items.map((i) => i[keyField])
          );
          return res
            .status(404)
            .json({ message: "Item không tồn tại để update" });
        }

        const attrNameKey = Object.keys(ExpressionAttributeNames)[0];
        const attrName = ExpressionAttributeNames[attrNameKey];

        const attrValueKey = Object.keys(ExpressionAttributeValues)[0];
        const attrValueObj = ExpressionAttributeValues[attrValueKey];

        // Cập nhật giá trị
        items[itemIndex][attrName] = attrValueObj;

        console.log(
          `✅ Updated ${attrName} of item ${keyValue} in table ${TableName}`
        );
        return res.json({});
      }

      case "DynamoDB_20120810.ListTables":
        return res.json({ TableNames: Object.keys(db) });

      default:
        return res
          .status(400)
          .json({ message: "Unsupported DynamoDB operation", target });
    }
  }

  // =============================
  // ✅ MOCK SECRETS MANAGER
  // =============================
  if (target === "secretsmanager.GetSecretValue") {
    const { SecretId } = req.body;
    if (secrets[SecretId]) {
      return res.json({ SecretString: secrets[SecretId] });
    }
    return res.status(404).json({ message: "Secret not found" });
  }

  // =============================
  // ❌ Unsupported target
  // =============================
  return res.status(400).json({ message: "Unsupported operation", target });
});

app.listen(8001, () => {
  console.log(
    "🔥 Mock DynamoDB & SecretsManager running on http://localhost:8001"
  );
});
