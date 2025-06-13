import { updateAllRecordsInTableWithAvatar } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { copyItemToNewBucket } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";

export const setAvatarDemo = async (dynamoDb:any, s3:any, newBucket:any, usersTable:any) => {
      try {
            const path = "picture/linh123.jpg";
            //TODO: 
            const newImageUrl = `avatar_${Date.now()}.jpg`;
            // Update avatar for all users 
            const updateAvatar = await updateAllRecordsInTableWithAvatar(dynamoDb, newImageUrl, usersTable);
            //TODO: save newImage vào bucket newBucket
            const copyCsvToNewBucket = await copyItemToNewBucket(s3, newBucket, newImageUrl, path);
            return;
      } catch (error) {
            throw error;
      }
};