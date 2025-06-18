# Lambdaハンドラー詳細設計: create-preurl-s3-update-status-uploading-lambda

## 1. 目的
Lambda `create-preurl-s3-update-status-uploading-lambda` のハンドラーを詳細設計し、S3 へのファイルアップロード用の Pre-signed URL を生成し、アップロード中のファイル状態を更新する。

## 2. コンポーネント
- ハンドラーは **TypeScript** で実装する。  
- **AWS SDK** を利用して **S3**、**DynamoDB**、**AWS Secrets Manager** と連携する。

## 3. 詳細設計
1. AWS Secrets Manager から **bucketName** と **bucketCsvName** を取得する。  
2. AWS Secrets Manager からアップロード管理用テーブル名 **uploadCsvTableName** を取得する。  
3. 一意な UUID を生成する `generateUUID` 関数を実装する。  
4. 生成した UUID を用いてファイル名を作成する。  
5. DynamoDB テーブルの状態を **“Uploading”** に更新する。  
6. S3 に保存する CSV ファイル名を `csv/{fileName}.csv` 形式で生成する。  
7. Pre-signed URL の有効期限を **3,600 秒（1 時間）** に設定する。  
8. S3 バケットに対して CSV ファイルをアップロードするための Pre-signed URL を生成する。  
   8.1. URL 生成中にエラーが発生した場合  
   &nbsp;&nbsp;&nbsp;&nbsp;8.1.1 HTTP 500 を返却し、メッセージは **“Failed to create pre-signed URL”** とする。  
   &nbsp;&nbsp;&nbsp;&nbsp;8.1.2 エラー内容を CloudWatch にログ出力する。  
   8.2. 生成に成功した場合  
   &nbsp;&nbsp;&nbsp;&nbsp;8.2.1 ステップ 9 へ進む。  
9. Pre-signed URL と生成したファイル名を JSON 形式で返却する。  
   9.1. レスポンス返却中にエラーが発生した場合  
   &nbsp;&nbsp;&nbsp;&nbsp;9.1.1 HTTP 500 を返却し、メッセージは **“Call Lambda PreURL fail”** とする。  
   &nbsp;&nbsp;&nbsp;&nbsp;9.1.2 エラー内容を CloudWatch にログ出力する。  
   9.2. 正常終了した場合  
   &nbsp;&nbsp;&nbsp;&nbsp;9.2.1 Pre-signed URL と生成したファイル名を返却する。  